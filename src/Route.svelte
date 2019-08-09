<script>
    import { getContext, onDestroy } from "svelte";
    import { ROUTER, LOCATION } from "./contexts.js";

    export let names = [];
    export let defaultName = null;

    const router = getContext(ROUTER);
    const location = getContext(LOCATION);

    let routeProps = {};
    let activeRoute = {};

    let component = null;

    let unlisten = location.subscribe(loc => {
        if (!loc) return;

        activeRoute = loc.$route || {};

        if (loc.$route) {
            const name = loc.$route.name;
            let route = router.find(name);

            if (names.indexOf(name) === -1) {
                return false;
            }

            if (!route && !component && defaultName) {
                route = router.find(defaultName);
            }

            router.resolveComponent(name, c => (component = c));
        } else if (defaultName) {
            router.resolveComponent(defaultName, c => (component = c));
        }
    });

    $: {
        const { names, defaultName, ...rest } = $$props;
        routeProps = rest;
    }

    onDestroy(unlisten);
</script>

{#if component !== null}
    <svelte:component this={component} route={activeRoute} {...routeProps} />
{:else}
    <slot />
{/if}
