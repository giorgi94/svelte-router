<script>
    import { getContext, onDestroy } from "svelte";
    import { ROUTES, LOCATION } from "./contexts.js";

    export let names = [];
    export let defaultName = null;

    const routes = getContext(ROUTES);
    const location = getContext(LOCATION);

    let routeProps = {};
    let activeRoute = {};

    let component = null;

    let unlisten = location.subscribe(loc => {
        if (!loc) return;

        activeRoute = loc.$route || {};

        if (loc.$route) {
            const name = loc.$route.name;
            let route = routes.find(r => r.name === name);

            if (!route && !component && defaultName) {
                route = routes.find(r => r.name === defaultName);
            }

            if (route.component) {
                route.component().then(c => (component = c));
            }
        } else if (defaultName) {
            let route = routes.find(r => r.name === defaultName);
            route.component().then(c => (component = c));
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
