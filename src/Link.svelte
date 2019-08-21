<script>
    import { getContext, createEventDispatcher } from "svelte";
    import { LOCATION, ROUTER } from "./contexts.js";
    import { navigate } from "./history.js";
    import { shouldNavigate, queryString } from "./utils.js";

    export let to = "#";
    export let replace = false;
    export let state = {};
    export let getProps = () => ({});

    const router = getContext(ROUTER);
    const location = getContext(LOCATION);
    const dispatch = createEventDispatcher();

    let href, isPartiallyCurrent, isCurrent, props, attrs;

    const resolveUrl = to => {
        let qstring = "";
        let query = to.query;

        if (typeof query === "object" && Object.entries(query).length !== 0) {
            qstring = queryString.dump(query);
        }

        const pathname = router.resolveUrl(to);

        return pathname + qstring;
    };

    $: href = typeof to === "string" ? to : resolveUrl(to);

    $: isCurrent = href === $location.pathname;
    $: ariaCurrent = isCurrent ? "page" : "";

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
