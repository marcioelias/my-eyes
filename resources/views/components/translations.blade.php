{{--
    Hands the current locale's strings to the JavaScript layer.

    Emitted as JSON inside a script tag rather than as executable code, so no
    relaxed Content-Security-Policy is needed. initMyEyes() reads it before any
    binding renders text of its own.

    Included by the bundled layouts. Add it yourself if you use your own layout:

        <x-me::translations />

    For Vue, React or Inertia, share MyEyes\Support\Messages::forJavaScript()
    through your usual props and call configureMessages() with it instead.
--}}

<script type="application/json" data-me-messages>@json(\MyEyes\Support\Messages::forJavaScript())</script>
