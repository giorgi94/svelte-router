import { navigate } from "./history.js";

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
},
{
    type: "all",
    pattern: ".*"
}];

export const queryString = {
    load(query) {
        return query.slice(1).split("&").map((e) => e.split("="))
            .reduce((m, [key, val]) => {

                if (/^\d+$/.test(val)) {
                    val = parseInt(val);
                }

                if (key in m) {
                    if (Array.isArray(m[key])) {
                        m[key].push(val);
                    } else {
                        m[key] = [m[key], val];
                    }
                } else {
                    m[key] = val;
                }
                return m;
            }, {});
    },
    dump(query) {
        return "?" + Object.entries(query).map(([key, val]) => {
            if (!Array.isArray(val)) {
                return `${key}=${val}`;
            } else {
                return val.map(v => `${key}=${v}`).join("&");
            }
        }).join("&");
    }
};

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
        resolveUrl({ name, params, query }) {
            let qstring = "";
            const route = this.routes.find(r => r.name === name);

            if (!route) {
                return "";
            }

            if (typeof query === "object" && Object.entries(query).length !== 0) {
                qstring = queryString.dump(query);
            }

            if (!params) {
                return route.resolve() + qstring;
            }

            return route.resolve(params) + qstring;
        },
        find(name) {
            return this.routes.find(r => r.name === name);
        },
        resolveComponent(from, to, name, callback) {
            const route = this.find(name);

            if (!("component" in route)) {
                return false;
            }

            const next = () => {
                let component = route.component();
                if (component instanceof Promise) {
                    component.then(callback);
                } else {
                    callback(component);
                }
                this.afterResolve(from, to);
            };

            this.beforeResolve(from, to, next);

        },
        beforeResolve(from, to, next) {
            next();
        },
        afterResolve(from, to) {

        },
        navigate(to, { state, replace = false } = {}) {
            navigate(this.resolveUrl(to), { state, replace });
        }
    };
};