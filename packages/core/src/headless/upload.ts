/*
 * File selection rules, independent of any DOM or framework.
 *
 * Client-side validation here is a convenience, never a guarantee — the server
 * validates again. Its job is to tell the user about an oversized file before
 * they wait for an upload to fail.
 */

export interface UploadOptions {
    /** Same syntax as the accept attribute: ".pdf,image/*". */
    accept?: string
    /** Per-file limit, in bytes. */
    maxSize?: number
    maxFiles?: number
    multiple: boolean
}

export interface UploadMessages {
    tooLarge: (name: string, limit: string) => string
    wrongType: (name: string) => string
    tooMany: (limit: number) => string
}

export interface ValidatedFile {
    file: File
    error: string | null
}

export interface UploadValidation {
    files: ValidatedFile[]
    /** Files rejected because they exceeded maxFiles — not included above. */
    rejected: File[]
}

export function validateFiles(files: File[], options: UploadOptions, messages: UploadMessages): UploadValidation {
    const limit = options.multiple ? (options.maxFiles ?? files.length) : 1
    const accepted = files.slice(0, limit)
    const rejected = files.slice(limit)

    return {
        files: accepted.map((file) => ({
            file,
            error: validateFile(file, options, messages),
        })),
        rejected,
    }
}

function validateFile(file: File, options: UploadOptions, messages: UploadMessages): string | null {
    if (options.maxSize !== undefined && file.size > options.maxSize) {
        return messages.tooLarge(file.name, formatBytes(options.maxSize))
    }

    if (options.accept !== undefined && !matchesAccept(file, options.accept)) {
        return messages.wrongType(file.name)
    }

    return null
}

/**
 * Mirrors how a browser reads the accept attribute: extensions (".pdf"),
 * wildcard media types ("image/*") and exact media types.
 */
export function matchesAccept(file: File, accept: string): boolean {
    const patterns = accept
        .split(',')
        .map((pattern) => pattern.trim().toLowerCase())
        .filter((pattern) => pattern !== '')

    if (patterns.length === 0) {
        return true
    }

    const type = file.type.toLowerCase()
    const name = file.name.toLowerCase()

    return patterns.some((pattern) => {
        if (pattern.startsWith('.')) {
            return name.endsWith(pattern)
        }

        if (pattern.endsWith('/*')) {
            return type.startsWith(`${pattern.slice(0, -1)}`)
        }

        return type === pattern
    })
}

export function formatBytes(bytes: number, decimals = 1): string {
    if (bytes === 0) {
        return '0 B'
    }

    const units = ['B', 'KB', 'MB', 'GB', 'TB']
    const exponent = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1)
    const value = bytes / 1024 ** exponent
    const unit = units[exponent] ?? 'B'

    // Whole bytes never need a decimal point.
    const digits = exponent === 0 ? 0 : decimals

    return `${value.toFixed(digits)} ${unit}`
}

/**
 * Rebuilds a FileList from a kept subset, so removing one file from a
 * multi-select input does not clear the rest. DataTransfer is the only
 * supported way to construct a FileList.
 */
export function toFileList(files: File[]): FileList {
    const transfer = new DataTransfer()
    files.forEach((file) => transfer.items.add(file))

    return transfer.files
}
