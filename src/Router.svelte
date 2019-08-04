<script>
    import { getContext, setContext, onMount } from "svelte";
    import { writable, derived } from "svelte/store";
    import { LOCATION, ROUTES } from "./contexts.js";
    import { globalHistory } from "./history.js";
    import { location, activeRoute } from "./store.js";

    export let basepath = "/";
    export let url = null;
    export let routes = [];

    setContext(ROUTES, routes);

    const getRoute = loc => {
        const pathname = loc.pathname;
        const matched = routes.find(route => route.rule.test(pathname));

        if (!matched) {
            return null;
        }

        const params = matched.rule.exec(pathname);

        return {
            name: matched.name,
            params: params ? params.groups || {} : {},
        };
    };

    const locationContext = getContext(LOCATION);

    const _loc =
        locationContext || url ? { pathname: url } : globalHistory.location;

    location.set({ ..._loc, $route: getRoute(_loc) });

    if (!locationContext) {
        onMount(() => {
            const unlisten = globalHistory.listen(history => {
                const loc = history.location;
                location.set({ ...loc, $route: getRoute(loc) });
            });

            return unlisten;
        });

        setContext(LOCATION, location);
    }
</script>

<slot />
