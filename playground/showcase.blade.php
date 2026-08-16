<x-me::layouts.admin
    :heading="__('Components')"
    :subheading="__('Every my-eyes component, rendered from the real Blade views.')"
>
    <x-slot:nav>
        <x-me::nav.section :title="__('Overview')">
            <x-me::nav.item href="#" icon="layout-dashboard" :active="true">Dashboard</x-me::nav.item>
            <x-me::nav.item href="#" icon="users" badge="12">Customers</x-me::nav.item>
        </x-me::nav.section>

        <x-me::nav.section :title="__('Manage')">
            <x-me::nav.group label="Catalog" icon="home">
                <x-me::nav.subitem href="#">Products</x-me::nav.subitem>
                <x-me::nav.subitem href="#">Categories</x-me::nav.subitem>
                <x-me::nav.subitem href="#">Suppliers</x-me::nav.subitem>
            </x-me::nav.group>

            <x-me::nav.group label="Settings" icon="settings">
                <x-me::nav.subitem href="#">General</x-me::nav.subitem>
                <x-me::nav.subitem href="#">Members</x-me::nav.subitem>
            </x-me::nav.group>

            <x-me::nav.item href="#" icon="search">Search</x-me::nav.item>
        </x-me::nav.section>
    </x-slot:nav>

    <x-slot:user>
        <x-me::user-menu name="Márcio Elias" email="marcio@example.com">
            <x-me::dropdown.item href="#" icon="user">Profile</x-me::dropdown.item>
            <x-me::dropdown.item href="#" icon="settings">Settings</x-me::dropdown.item>
            <x-me::dropdown.divider />
            <x-me::dropdown.item href="#" icon="log-out" variant="danger">Sign out</x-me::dropdown.item>
        </x-me::user-menu>
    </x-slot:user>

    <x-slot:actions>
        <x-me::button variant="secondary" icon="search">Search</x-me::button>
        <x-me::button variant="primary" icon="plus">New order</x-me::button>
    </x-slot:actions>

    <div class="me-stack me-stack--loose">
        <x-me::card title="Buttons" description="Solid, outline and low-emphasis variants across six roles.">
            <div class="me-stack">
                <div class="me-row">
                    @foreach (['primary', 'secondary', 'success', 'danger', 'warning', 'info'] as $variant)
                        <x-me::button :variant="$variant">{{ ucfirst($variant) }}</x-me::button>
                    @endforeach
                </div>

                <div class="me-row">
                    @foreach (['primary', 'secondary', 'success', 'danger', 'warning', 'info'] as $variant)
                        <x-me::button :variant="'outline-'.$variant">{{ ucfirst($variant) }}</x-me::button>
                    @endforeach
                </div>

                <div class="me-row">
                    <x-me::button variant="ghost" icon="settings">Ghost</x-me::button>
                    <x-me::button variant="link">Link</x-me::button>
                    <x-me::button variant="primary" loading>Loading</x-me::button>
                    <x-me::button variant="primary" disabled>Disabled</x-me::button>
                    <x-me::button variant="secondary" icon="plus" />
                </div>

                <div class="me-row">
                    <x-me::button variant="primary" size="xs">Extra small</x-me::button>
                    <x-me::button variant="primary" size="sm">Small</x-me::button>
                    <x-me::button variant="primary" size="md">Medium</x-me::button>
                    <x-me::button variant="primary" size="lg">Large</x-me::button>
                </div>
            </div>
        </x-me::card>

        <x-me::card title="Form controls" description="Click into a field: the border thickens to 2px and picks up a soft halo — one line, no offset ring. Invalid fields focus in red.">
            <div class="me-stack">
                <x-me::input name="showcase_name" label="Full name" hint="As it appears on your documents." value="Márcio Elias" required />

                <x-me::input name="showcase_email" type="email" label="Email" value="not-an-email" error="Enter a valid email address." />

                <x-me::input name="showcase_password" type="password" label="Password" hint="Click the eye to reveal." />

                <x-me::input name="showcase_site" label="Website" prefix="https://" suffix=".com" value="acme" />

                <x-me::numeric name="showcase_price" label="Price" prefix="R$" :decimals="2" :step="0.5" :min="0" :value="1234.5" hint="Type freely — it formats on blur. Arrow keys step." />

                <x-me::select
                    name="showcase_status"
                    label="Status"
                    placeholder="Choose a status"
                    selected="paid"
                    :options="['pending' => 'Pending', 'paid' => 'Paid', 'refunded' => 'Refunded']"
                />

                <x-me::textarea name="showcase_notes" label="Notes" rows="3" value="A native textarea, styled to match." />
            </div>
        </x-me::card>

        <x-me::card title="Choices" description="Native controls, restyled — keyboard and form behaviour intact.">
            <div class="me-stack">
                <x-me::checkbox name="showcase_terms" label="I accept the terms" hint="You can revoke this at any time." checked />
                <x-me::switch name="showcase_notify" label="Email notifications" hint="Weekly summary of your account." checked />
                <x-me::switch name="showcase_beta" label="Beta features" size="lg" />

                <div class="me-stack me-stack--tight">
                    <x-me::radio name="showcase_plan" value="free" label="Free" hint="For trying things out." card checked />
                    <x-me::radio name="showcase_plan" value="pro" label="Pro" hint="For teams shipping to production." card />
                </div>
            </div>
        </x-me::card>

        <x-me::card title="Upload" description="Drop a file, or click to browse. Try dragging an image in.">
            <x-me::upload name="showcase_files" label="Attachments" accept="image/*,.pdf" :max-size="2097152" multiple />
        </x-me::card>

        <x-me::card title="Feedback" description="Tinted rather than saturated, so a busy page stays calm.">
            <div class="me-stack">
                <x-me::alert variant="primary" title="Heads up">A neutral, informative message.</x-me::alert>
                <x-me::alert variant="success" title="Saved">Your changes have been stored.</x-me::alert>
                <x-me::alert variant="warning" title="Check this">The invoice is due in two days.</x-me::alert>
                <x-me::alert variant="danger" title="Failed" dismissible>The payment was declined. This one is dismissible.</x-me::alert>

                <div class="me-row">
                    <x-me::badge>Default</x-me::badge>
                    <x-me::badge variant="primary">Primary</x-me::badge>
                    <x-me::badge variant="success" dot>Active</x-me::badge>
                    <x-me::badge variant="warning">Pending</x-me::badge>
                    <x-me::badge variant="danger">Overdue</x-me::badge>
                    <x-me::badge variant="solid">7</x-me::badge>
                </div>

                <div class="me-row">
                    <x-me::avatar name="Márcio Elias" size="sm" />
                    <x-me::avatar name="Márcio Elias" />
                    <x-me::avatar name="Ana Souza" size="lg" status="success" />
                    <x-me::avatar name="Carlos Lima" size="xl" />
                </div>
            </div>
        </x-me::card>

        <x-me::card title="Custom select" description="Its own list: multiple selection, search, groups, per-option descriptions and disabled items. Becomes a bottom sheet on phones.">
            <div class="me-stack">
                <x-me::select-field
                    name="showcase_owner"
                    label="Owner"
                    placeholder="Pick someone"
                    selected="ana"
                    :options="[
                        ['value' => 'ana', 'label' => 'Ana Souza', 'description' => 'Operations'],
                        ['value' => 'bruno', 'label' => 'Bruno Lima', 'description' => 'Finance'],
                        ['value' => 'carla', 'label' => 'Carla Dias', 'description' => 'Support'],
                        ['value' => 'diego', 'label' => 'Diego Alves', 'description' => 'On leave', 'disabled' => true],
                    ]"
                />

                <x-me::select-field
                    name="showcase_stack"
                    label="Stack"
                    hint="Multiple selection, grouped, with one option disabled."
                    multiple
                    :selected="['php', 'mysql']"
                    :options="[
                        ['value' => 'php', 'label' => 'PHP', 'group' => 'Backend'],
                        ['value' => 'go', 'label' => 'Go', 'group' => 'Backend'],
                        ['value' => 'rust', 'label' => 'Rust', 'group' => 'Backend', 'disabled' => true],
                        ['value' => 'blade', 'label' => 'Blade', 'group' => 'Frontend'],
                        ['value' => 'vue', 'label' => 'Vue', 'group' => 'Frontend'],
                        ['value' => 'react', 'label' => 'React', 'group' => 'Frontend'],
                        ['value' => 'mysql', 'label' => 'MySQL', 'group' => 'Data'],
                        ['value' => 'redis', 'label' => 'Redis', 'group' => 'Data'],
                    ]"
                />
            </div>
        </x-me::card>

        <x-me::card title="Colour modes" description="Light, dark, and system — which follows your OS and is the default. The toggle in the top bar cycles all three; this menu picks one directly.">
            <div class="me-row">
                <x-me::theme-menu align="start" />
                <x-me::theme-toggle />
                <span class="me-hint">The icon shows the mode you selected, so “system” stays distinguishable from an explicit choice.</span>
            </div>
        </x-me::card>

        <x-me::card
            title="Icons"
            description="One family: 24×24 grid, 1.75 stroke, round terminals. Drawn for CRUD, ERP and CRM work — hover any of them for the name. Add or override one through the “icons” key in config, or pass a one-off drawing as the slot."
        >
            <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(3.25rem,1fr));gap:0.375rem">
                @foreach (array_keys(\MyEyes\Support\Icons::PATHS) as $icon)
                    <span
                        style="display:flex;align-items:center;justify-content:center;aspect-ratio:1;border-radius:0.5rem;border:1px solid var(--color-line);color:var(--color-content-muted)"
                        data-me-tooltip="{{ $icon }}"
                    >
                        <x-me::icon :name="$icon" />
                    </span>
                @endforeach
            </div>

            <p class="me-hint" style="margin-top:0.75rem">
                {{ count(\MyEyes\Support\Icons::PATHS) }} icons. A name that does not exist raises an
                exception while debugging rather than rendering an empty square.
            </p>
        </x-me::card>

        <x-me::card title="Progress" description="Linear and circular, determinate and indeterminate.">
            <div class="me-stack">
                <x-me::progress :value="72" variant="primary" label="Importing customers" show-value />
                <x-me::progress :value="38" variant="success" size="sm" label="Disk usage" show-value />
                <x-me::progress :value="91" variant="danger" size="sm" label="Quota" show-value />
                <x-me::progress variant="primary" size="sm" label="Syncing (unknown length)" />

                <div class="me-row" style="gap:1.25rem;padding-top:0.5rem">
                    <x-me::progress-ring :value="64" />
                    <x-me::progress-ring :value="28" variant="warning" />
                    <x-me::progress-ring :value="96" variant="success" size="lg" />
                    <x-me::progress-ring variant="info" size="sm" :show-value="false" />
                </div>
            </div>
        </x-me::card>

        <x-me::card title="Tooltip" description="Hover or tab to a control. Flips when it would run off screen, and the arrow keeps pointing at the trigger even when the body is nudged back inside.">
            <div class="me-row">
                <x-me::tooltip text="Sits above the trigger" placement="top">
                    <x-me::button variant="secondary">Top</x-me::button>
                </x-me::tooltip>

                <x-me::tooltip text="Sits below the trigger" placement="bottom">
                    <x-me::button variant="secondary">Bottom</x-me::button>
                </x-me::tooltip>

                <x-me::tooltip text="Sits after the trigger" placement="end">
                    <x-me::button variant="secondary">End</x-me::button>
                </x-me::tooltip>

                <x-me::tooltip text="A longer explanation that wraps onto more than one line and stays balanced." placement="top">
                    <x-me::button variant="ghost" icon="info">Long text</x-me::button>
                </x-me::tooltip>

                <x-me::tooltip text="Delete this order" placement="top">
                    <x-me::button variant="ghost" icon="x" />
                </x-me::tooltip>
            </div>
        </x-me::card>

        <x-me::card title="Toasts" description="They stack and cascade. The progress bar IS the timer — hover a toast to pause both.">
            <div class="me-stack">
                <div class="me-row">
                    <x-me::button variant="success" data-demo-toast="success">Success</x-me::button>
                    <x-me::button variant="danger" data-demo-toast="danger">Error</x-me::button>
                    <x-me::button variant="warning" data-demo-toast="warning">Warning</x-me::button>
                    <x-me::button variant="info" data-demo-toast="info">Info</x-me::button>
                    <x-me::button variant="secondary" data-demo-toast="persistent">Persistent</x-me::button>
                    <x-me::button variant="outline-primary" data-demo-toast="cascade">Cascade five</x-me::button>
                </div>

                <div class="me-row">
                    <span class="me-hint">Position</span>
                    <select class="me-input me-select me-input--sm" data-demo-toast-position style="width:auto">
                        <option value="top-end">top-end</option>
                        <option value="top-center">top-center</option>
                        <option value="top-start">top-start</option>
                        <option value="bottom-end">bottom-end</option>
                        <option value="bottom-center">bottom-center</option>
                        <option value="bottom-start">bottom-start</option>
                    </select>
                </div>
            </div>
        </x-me::card>

        <x-me::card
            title="Data table"
            description="Sorting, quick search, advanced filters, page size and pagination — all server-driven through the query string. Rows fade in with a slight stagger."
            flush
        >
            <x-me::table :table="$table" striped />
        </x-me::card>

        <x-me::card title="Confirmation modal" description="Native <dialog>: real backdrop, Escape to close, focus trapped by the browser. Colour follows the role.">
            <div class="me-row">
                <x-me::button variant="danger" data-me-modal-open="demo-delete">Delete order</x-me::button>
                <x-me::button variant="warning" data-me-modal-open="demo-warn">Discard changes</x-me::button>
                <x-me::button variant="secondary" data-me-modal-open="demo-done">Show acknowledgement</x-me::button>
                <x-me::button variant="outline-danger" data-me-modal-open="demo-static">Static — no ESC, no backdrop</x-me::button>
            </div>

            <x-me::modal
                id="demo-delete"
                variant="danger"
                title="Delete this order?"
                confirm="Delete order"
                cancel="Keep it"
            >
                Order #01023 and every line item on it are removed permanently. This cannot be undone.
            </x-me::modal>

            <x-me::modal
                id="demo-warn"
                variant="warning"
                title="Discard your changes?"
                confirm="Discard"
                cancel="Keep editing"
            >
                You have unsaved edits on this order. Leaving now loses them.
            </x-me::modal>

            <x-me::modal
                id="demo-done"
                variant="success"
                title="Export ready"
                confirm="Got it"
            >
                Your export finished and was emailed to you. A single button, because there is nothing to cancel.
            </x-me::modal>

            <x-me::modal
                id="demo-static"
                variant="warning"
                title="This one will not let you slip out"
                confirm="I understand"
                cancel="Go back"
                static
            >
                Escape does nothing and clicking the backdrop does nothing. The two buttons are the only way out — for decisions where dismissing by accident would leave you unsure what happened.
            </x-me::modal>
        </x-me::card>

        <x-me::card title="Error pages" description="Severity follows the status code — 4xx warns, 5xx alarms.">
            <div class="me-row">
                <x-me::button variant="outline-warning" icon="file-question">404 · Not found</x-me::button>
                <x-me::button variant="outline-warning" icon="shield-off">403 · Forbidden</x-me::button>
                <x-me::button variant="outline-danger" icon="server-crash">500 · Server error</x-me::button>
            </div>

            <div style="margin-top:1rem;border:1px solid var(--color-line);border-radius:var(--me-radius);overflow:hidden">
                <div class="me-error-page me-error-page--warning" style="min-height:auto;padding:2rem 1rem">
                    <div class="me-error-page__panel">
                        <span class="me-error-page__badge"><x-me::icon name="file-question" /></span>
                        <p class="me-error-page__status">404</p>
                        <h2 class="me-error-page__title">Page not found</h2>
                        <p class="me-error-page__text">The page you are looking for does not exist, or it has been moved.</p>
                    </div>
                </div>
            </div>
        </x-me::card>
    </div>

        <x-me::card
            title="Starter kit pages"
            description="Real views from the package, rendered here with their outer document stripped. Publish them over a Breeze or Fortify install with vendor:publish --tag=my-eyes-pages."
        >
            <div class="me-stack">
                @foreach (['login' => 'Sign in', 'register' => 'Register', 'forgot' => 'Forgot password', 'error' => 'Error page (404)'] as $key => $caption)
                    <div>
                        <p class="me-hint" style="margin-bottom:0.375rem">{{ $caption }}</p>
                        <div class="me-page-preview">{!! $previews[$key] !!}</div>
                    </div>
                @endforeach
            </div>
        </x-me::card>

    {{--
        Preview frames. Scoped to the showcase rather than the package: the
        starter kit pages fill the viewport by design, which is exactly what an
        embedded preview must not do.
    --}}
    <style>
        .me-page-preview {
            border: 1px solid var(--color-line);
            border-radius: var(--me-radius);
            overflow: hidden;
            background-color: var(--color-surface);
        }

        .me-page-preview .me-auth,
        .me-page-preview .me-error-page {
            min-height: auto;
            padding: 2rem 1rem;
        }

        .me-page-preview .me-skip-link {
            display: none;
        }
    </style>

    {{--
        Demo wiring for the toast buttons. Listeners rather than inline
        handlers, so the page needs no relaxed CSP.
    --}}
    <script>
        document.addEventListener('DOMContentLoaded', function () {
            /*
             * Nothing here can navigate: this is a single static file with no
             * server behind it. Sorting, paging and the auth screens all need
             * one, so their links are neutralised at build time and explained
             * here instead of failing silently.
             */
            document.addEventListener('click', function (event) {
                var link = event.target.closest('a[data-demo-link], a[href="#"]');

                if (!link || link.closest('.me-dropdown__panel')) {
                    return;
                }

                event.preventDefault();

                window.myEyes.toast({
                    variant: 'info',
                    title: 'Static showcase',
                    text: 'This link needs a Laravel app behind it — sorting, paging and the auth screens are all server-driven.',
                    duration: 4000,
                    position: 'bottom-center',
                });
            });

            document.querySelectorAll('form[data-demo-link]').forEach(function (form) {
                form.addEventListener('submit', function (event) {
                    event.preventDefault();
                });
            });

            // The page-size picker navigates by option value, not by href.
            document.querySelectorAll('[data-demo-navigate]').forEach(function (select) {
                select.addEventListener('change', function () {
                    window.myEyes.toast({
                        variant: 'info',
                        text: 'Page size is applied by the server on the next request.',
                        duration: 3500,
                        position: 'bottom-center',
                    });
                });
            });

            var picker = document.querySelector('[data-demo-toast-position]');
            var position = function () {
                return picker ? picker.value : 'top-end';
            };

            var samples = {
                success: { variant: 'success', title: 'Order paid', text: 'Order #01042 was settled and the receipt is on its way.' },
                danger: { variant: 'danger', title: 'Payment declined', text: 'The card issuer refused the charge.' },
                warning: { variant: 'warning', title: 'Almost out of stock', text: 'Only 3 units of SKU-8841 remain.' },
                info: { variant: 'info', text: 'A nightly export finished. Nothing needs your attention.' },
                persistent: { variant: 'primary', title: 'Import running', text: 'This one has no timer and no progress bar — dismiss it yourself.', duration: 0 },
            };

            document.querySelectorAll('[data-demo-toast]').forEach(function (button) {
                button.addEventListener('click', function () {
                    var kind = button.dataset.demoToast;

                    if (kind === 'cascade') {
                        ['success', 'info', 'warning', 'danger', 'info'].forEach(function (variant, index) {
                            window.setTimeout(function () {
                                window.myEyes.toast({
                                    variant: variant,
                                    text: 'Cascaded message ' + (index + 1) + ' of 5.',
                                    position: position(),
                                    duration: 6000,
                                });
                            }, index * 220);
                        });

                        return;
                    }

                    var sample = samples[kind];
                    sample.position = position();
                    window.myEyes.toast(sample);
                });
            });
        });
    </script>

    <x-slot:footer>
        <span>my-eyes · showcase generated from the Blade components</span>
        <span>Try the theme toggle, the sidebar collapse and this page at phone width.</span>
    </x-slot:footer>
</x-me::layouts.admin>
