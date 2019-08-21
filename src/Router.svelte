<script>
    import { getContext, setContext, onMount } from "svelte";
    import { writable, derived } from "svelte/store";
    import { LOCATION, ROUTER } from "./contexts.js";
    import { globalHistory } from "./history.js";
    import { location, activeRoute } from "./store.js";
    import { queryString } from "./utils.js";

    export let basepath = "/";
    export let url = null;
    export let urlqurey = null;
    export let router = {};

    setContext(ROUTER, router);

    const getRoute = loc => {
        const pathname = loc.pathname;

        let search = loc.search || "";

        search = search.length > 1 ? queryString.load(loc.search) : {};

        const matched = router.routes.find(route => route.rule.test(pathname));

        if (!matched) {
            return null;
        }

        const params = matched.rule.exec(pathname);

        return {
            name: matched.name,
            params: params ? params.groups || {} : {},
            query: search,
        };
    };

    const locationContext = getContext(LOCATION);

    const _loc =
        locationContext || url
            ? { pathname: url, search: urlqurey }
            : globalHistory.location;

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
