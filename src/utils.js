export const resolveUrl = (routes, {
    name,
    params
}) => {
    const route = routes.find(r => r.name === name);

    console.log(route.resolve());

    if (!route) {
        return "";
    }

    if (!params) {
        return route.resolve();
    }

    return route.resolve(params);
};

export const shouldNavigate = (event) => {
    return (
        !event.defaultPrevented &&
        event.button === 0 &&
        !(event.metaKey || event.altKey || event.ctrlKey || event.shiftKey)
    );
};