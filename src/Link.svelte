<script>
    import { getContext, createEventDispatcher } from "svelte";
    import { LOCATION, ROUTES } from "./contexts.js";
    import { navigate } from "./history.js";
    import { resolveUrl, shouldNavigate } from "./utils.js";

    export let to = "#";
    export let replace = false;
    export let state = {};
    export let getProps = () => ({});

    const routes = getContext(ROUTES);
    const location = getContext(LOCATION);
    const dispatch = createEventDispatcher();

    let href, isPartiallyCurrent, isCurrent, props, attrs;

    $: href = typeof to === "string" ? to : resolveUrl(routes, to);

    $: isCurrent = href === $location.pathname;
    $: ariaCurrent = isCurrent ? "page" : undefined;

    $: props = getProps({
        location: $location,
        href,
        isCurrent,
    });

    $: {
        const { to, replace, state, ...rest } = $$props;
        attrs = rest;
    }

    function onClick(event) {
        dispatch("click", event);

        if (shouldNavigate(event)) {
            event.preventDefault();
            const shouldReplace = $location.pathname === href || replace;
            navigate(href, { state, replace: shouldReplace });
        }
    }
</script>

<a {href} aria-current={ariaCurrent} on:click={onClick} {...props} {...attrs}>
    <slot />
</a>
