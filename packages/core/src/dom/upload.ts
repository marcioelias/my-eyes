import { formatBytes, toFileList, validateFiles, type UploadMessages, type UploadOptions } from '../headless/upload.js'
import { t } from '../headless/i18n.js'
import { bind, emitInput, readBoolean, readNumber, readString } from './helpers.js'

/*
 * File upload binding: drag and drop, a reviewable file list and client-side
 * size/type checks.
 *
 * The zone is a <label> wrapping a real file input, so clicking and keyboard
 * activation work with no JavaScript at all. Everything here is enhancement.
 *
 * Validation messages come from the shared message dictionary, and a data
 * attribute on the element overrides them when one upload needs different
 * wording from the rest.
 */

const seen = new WeakSet<Element>()

export function initUploads(root: ParentNode = document): void {
    bind<HTMLElement>(root, '[data-me-upload]', seen, setup)
}

function setup(container: HTMLElement): void {
    const input = container.querySelector<HTMLInputElement>('[data-me-upload-input]')
    const zone = container.querySelector<HTMLElement>('[data-me-upload-zone]')
    const list = container.querySelector<HTMLElement>('[data-me-upload-list]')

    if (!input || !zone) {
        return
    }

    const options: UploadOptions = {
        multiple: input.multiple,
    }

    const accept = readString(container, 'accept') ?? input.accept
    const maxSize = readNumber(container, 'maxSize')
    const maxFiles = readNumber(container, 'maxFiles')

    if (accept !== '') options.accept = accept
    if (maxSize !== undefined) options.maxSize = maxSize
    if (maxFiles !== undefined) options.maxFiles = maxFiles

    // Per-element data attributes win, so one upload can differ from the rest.
    const messages: UploadMessages = {
        tooLarge: (name, limit) =>
            template(readString(container, 'msgTooLarge') ?? t('upload.tooLarge'), { name, limit }),
        wrongType: (name) => template(readString(container, 'msgWrongType') ?? t('upload.wrongType'), { name }),
        tooMany: (limit) => template(readString(container, 'msgTooMany') ?? t('upload.tooMany'), { limit: String(limit) }),
    }

    // Object URLs for previews must be released or the page leaks memory.
    let previews: string[] = []

    const render = (): void => {
        if (!list) {
            return
        }

        previews.forEach((url) => URL.revokeObjectURL(url))
        previews = []
        list.replaceChildren()

        const files = Array.from(input.files ?? [])
        const { files: validated } = validateFiles(files, options, messages)

        validated.forEach(({ file, error }, index) => {
            list.append(renderItem(file, error, index))
        })

        container.dataset.fileCount = String(files.length)
    }

    const renderItem = (file: File, error: string | null, index: number): HTMLElement => {
        const item = document.createElement('li')
        item.className = 'me-upload__item'

        if (error !== null) {
            item.dataset.invalid = 'true'
        }

        if (file.type.startsWith('image/')) {
            const url = URL.createObjectURL(file)
            previews.push(url)

            const image = document.createElement('img')
            image.className = 'me-upload__preview'
            image.src = url
            image.alt = ''
            item.append(image)
        }

        const body = document.createElement('div')
        body.className = 'me-upload__item-body'

        const name = document.createElement('span')
        name.className = 'me-upload__name'
        name.textContent = file.name

        const meta = document.createElement('span')
        meta.className = 'me-upload__meta'
        meta.textContent = error ?? formatBytes(file.size)

        body.append(name, meta)
        item.append(body)

        const remove = document.createElement('button')
        remove.type = 'button'
        remove.className = 'me-upload__remove'
        remove.setAttribute('aria-label', `${readString(container, 'msgRemove') ?? t('upload.remove')} ${file.name}`)
        remove.innerHTML =
            '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round"><path d="M5 5l10 10M15 5L5 15"/></svg>'
        remove.addEventListener('click', () => removeAt(index))

        item.append(remove)

        return item
    }

    const removeAt = (index: number): void => {
        const kept = Array.from(input.files ?? []).filter((_, position) => position !== index)

        input.files = toFileList(kept)
        emitInput(input)
        render()
    }

    input.addEventListener('change', render)

    /*
     * Drag events fire for child elements too, so a naive dragleave handler
     * flickers. Counting enter/leave pairs keeps the highlight stable.
     */
    let depth = 0

    zone.addEventListener('dragenter', (event: DragEvent) => {
        event.preventDefault()
        depth += 1
        zone.dataset.dragging = 'true'
    })

    zone.addEventListener('dragover', (event: DragEvent) => {
        event.preventDefault()
    })

    zone.addEventListener('dragleave', () => {
        depth = Math.max(0, depth - 1)
        if (depth === 0) {
            delete zone.dataset.dragging
        }
    })

    zone.addEventListener('drop', (event: DragEvent) => {
        event.preventDefault()
        depth = 0
        delete zone.dataset.dragging

        if (input.disabled) {
            return
        }

        const dropped = Array.from(event.dataTransfer?.files ?? [])
        if (dropped.length === 0) {
            return
        }

        // Appending, not replacing, matches what users expect from a dropzone.
        const existing = options.multiple ? Array.from(input.files ?? []) : []

        input.files = toFileList(options.multiple ? [...existing, ...dropped] : dropped.slice(0, 1))
        emitInput(input)
        render()
    })

    if (input.disabled) {
        zone.dataset.disabled = 'true'
    }

    render()
}

function template(text: string, replacements: Record<string, string>): string {
    return Object.entries(replacements).reduce(
        (result, [key, value]) => result.replaceAll(`:${key}`, value),
        text,
    )
}
