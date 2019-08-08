export const shouldNavigate = (event) => {
    return (
        !event.defaultPrevented &&
        event.button === 0 &&
        !(event.metaKey || event.altKey || event.ctrlKey || event.shiftKey)
    );
};

const defaultConverters = [{
    type: "str",
    pattern: "[\\w-]+"
}, {
    type: "int",
    pattern: "\\d+"
}];

export const CreateRouter = ({ routes, converters = [] }) => {

    converters = [
        ...defaultConverters,
        ...converters
    ];

    routes = routes.map(route => {
        let rule = route.path;

        let path = route.path;
        let urlparams = path.match(/<.*?>/g) || [];

        urlparams.forEach(item => {

            let [type, name] = item.slice(1, -1).split(":");

            let {
                pattern
            } = converters.find(e => e.type === type);
            rule = rule.replace(item, `(?<${name}>${pattern})`);

            path = path.replace(item, `<${name}>`);
        });

        route.path = path;

        return {
            ...route,
            rule: new RegExp("^" + rule + "$", "u"),
            resolve(opts) {
                let path = this.path;

                for (let key in opts) {
                    path = path.replace(`<${key}>`, opts[key]);
                }

                return path;
            }
        };
    });

    return {
        routes,
        resolveUrl({ name, params }) {
            const route = this.routes.find(r => r.name === name);

            if (!route) {
                return "";
            }

            if (!params) {
                return route.resolve();
            }

            return route.resolve(params);
        },
        find(name) {
            return this.routes.find(r => r.name === name);
        },
        resolveComponent(name, callback) {

            const route = this.find(name);
            let component = route.component;

            if (!component) {
                return null;
            }

            if (typeof component === "function") {
                component().then(callback);
            } else {
                callback(component);
            }

        }
    };
};