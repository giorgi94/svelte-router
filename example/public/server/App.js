'use strict';

function noop() { }
function run(fn) {
    return fn();
}
function blank_object() {
    return Object.create(null);
}
function run_all(fns) {
    fns.forEach(run);
}
function safe_not_equal(a, b) {
    return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
}
function subscribe(store, callback) {
    const unsub = store.subscribe(callback);
    return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
}
function get_store_value(store) {
    let value;
    subscribe(store, _ => value = _)();
    return value;
}

let current_component;
function set_current_component(component) {
    current_component = component;
}
function get_current_component() {
    if (!current_component)
        throw new Error(`Function called outside component initialization`);
    return current_component;
}
function onMount(fn) {
    get_current_component().$$.on_mount.push(fn);
}
function onDestroy(fn) {
    get_current_component().$$.on_destroy.push(fn);
}
function setContext(key, context) {
    get_current_component().$$.context.set(key, context);
}
function getContext(key) {
    return get_current_component().$$.context.get(key);
}

const invalid_attribute_name_character = /[\s'">/=\u{FDD0}-\u{FDEF}\u{FFFE}\u{FFFF}\u{1FFFE}\u{1FFFF}\u{2FFFE}\u{2FFFF}\u{3FFFE}\u{3FFFF}\u{4FFFE}\u{4FFFF}\u{5FFFE}\u{5FFFF}\u{6FFFE}\u{6FFFF}\u{7FFFE}\u{7FFFF}\u{8FFFE}\u{8FFFF}\u{9FFFE}\u{9FFFF}\u{AFFFE}\u{AFFFF}\u{BFFFE}\u{BFFFF}\u{CFFFE}\u{CFFFF}\u{DFFFE}\u{DFFFF}\u{EFFFE}\u{EFFFF}\u{FFFFE}\u{FFFFF}\u{10FFFE}\u{10FFFF}]/u;
// https://html.spec.whatwg.org/multipage/syntax.html#attributes-2
// https://infra.spec.whatwg.org/#noncharacter
function spread(args) {
    const attributes = Object.assign({}, ...args);
    let str = '';
    Object.keys(attributes).forEach(name => {
        if (invalid_attribute_name_character.test(name))
            return;
        const value = attributes[name];
        if (value === undefined)
            return;
        if (value === true)
            str += " " + name;
        const escaped = String(value)
            .replace(/"/g, '&#34;')
            .replace(/'/g, '&#39;');
        str += " " + name + "=" + JSON.stringify(escaped);
    });
    return str;
}
const escaped = {
    '"': '&quot;',
    "'": '&#39;',
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;'
};
function escape(html) {
    return String(html).replace(/["'&<>]/g, match => escaped[match]);
}
const missing_component = {
    $$render: () => ''
};
function validate_component(component, name) {
    if (!component || !component.$$render) {
        if (name === 'svelte:component')
            name += ' this={...}';
        throw new Error(`<${name}> is not a valid SSR component. You may need to review your build config to ensure that dependencies are compiled, rather than imported as pre-compiled modules`);
    }
    return component;
}
let on_destroy;
function create_ssr_component(fn) {
    function $$render(result, props, bindings, slots) {
        const parent_component = current_component;
        const $$ = {
            on_destroy,
            context: new Map(parent_component ? parent_component.$$.context : []),
            // these will be immediately discarded
            on_mount: [],
            before_update: [],
            after_update: [],
            callbacks: blank_object()
        };
        set_current_component({ $$ });
        const html = fn(result, props, bindings, slots);
        set_current_component(parent_component);
        return html;
    }
    return {
        render: (props = {}, options = {}) => {
            on_destroy = [];
            const result = { head: '', css: new Set() };
            const html = $$render(result, props, {}, options);
            run_all(on_destroy);
            return {
                html,
                css: {
                    code: Array.from(result.css).map(css => css.code).join('\n'),
                    map: null // TODO
                },
                head: result.head
            };
        },
        $$render
    };
}

const subscriber_queue = [];
/**
 * Create a `Writable` store that allows both updating and reading by subscription.
 * @param {*=}value initial value
 * @param {StartStopNotifier=}start start and stop notifications for subscriptions
 */
function writable(value, start = noop) {
    let stop;
    const subscribers = [];
    function set(new_value) {
        if (safe_not_equal(value, new_value)) {
            value = new_value;
            if (stop) { // store is ready
                const run_queue = !subscriber_queue.length;
                for (let i = 0; i < subscribers.length; i += 1) {
                    const s = subscribers[i];
                    s[1]();
                    subscriber_queue.push(s, value);
                }
                if (run_queue) {
                    for (let i = 0; i < subscriber_queue.length; i += 2) {
                        subscriber_queue[i][0](subscriber_queue[i + 1]);
                    }
                    subscriber_queue.length = 0;
                }
            }
        }
    }
    function update(fn) {
        set(fn(value));
    }
    function subscribe(run, invalidate = noop) {
        const subscriber = [run, invalidate];
        subscribers.push(subscriber);
        if (subscribers.length === 1) {
            stop = start(set) || noop;
        }
        run(value);
        return () => {
            const index = subscribers.indexOf(subscriber);
            if (index !== -1) {
                subscribers.splice(index, 1);
            }
            if (subscribers.length === 0) {
                stop();
                stop = null;
            }
        };
    }
    return { set, update, subscribe };
}

const LOCATION = {};
const ROUTER = {};

function getLocation(source) {
    return {
        ...source.location,
        state: source.history.state,
        key: (source.history.state && source.history.state.key) || "initial"
    };
}

function createHistory(source, options) {
    const listeners = [];
    let location = getLocation(source);

    return {
        get location() {
            return location;
        },

        listen(listener) {
            listeners.push(listener);

            const popstateListener = () => {
                location = getLocation(source);
                listener({
                    location,
                    action: "POP"
                });
            };

            source.addEventListener("popstate", popstateListener);

            return () => {
                source.removeEventListener("popstate", popstateListener);

                const index = listeners.indexOf(listener);
                listeners.splice(index, 1);
            };
        },

        navigate(to, {
            state,
            replace = false
        } = {}) {
            state = {
                ...state,
                key: Date.now() + ""
            };
            // try...catch iOS Safari limits to 100 pushState calls
            try {
                if (replace) {
                    source.history.replaceState(state, null, to);
                } else {
                    source.history.pushState(state, null, to);
                }
            } catch (e) {
                source.location[replace ? "replace" : "assign"](to);
            }

            location = getLocation(source);
            listeners.forEach(listener => listener({
                location,
                action: "PUSH"
            }));
        }
    };
}

// Stores history entries in memory for testing or other platforms like Native
function createMemorySource(initialPathname = "/") {
    let index = 0;
    const stack = [{
        pathname: initialPathname,
        search: ""
    }];
    const states = [];

    return {
        get location() {
            return stack[index];
        },
        addEventListener(name, fn) {},
        removeEventListener(name, fn) {},
        history: {
            get entries() {
                return stack;
            },
            get index() {
                return index;
            },
            get state() {
                return states[index];
            },
            pushState(state, _, uri) {
                const [pathname, search = ""] = uri.split("?");
                index++;
                stack.push({
                    pathname,
                    search
                });
                states.push(state);
            },
            replaceState(state, _, uri) {
                const [pathname, search = ""] = uri.split("?");
                stack[index] = {
                    pathname,
                    search
                };
                states[index] = state;
            }
        }
    };
}

// Global history uses window.history as the source if available,
// otherwise a memory history
const canUseDOM = Boolean(
    typeof window !== "undefined" &&
    window.document &&
    window.document.createElement
);
const globalHistory = createHistory(canUseDOM ? window : createMemorySource());

const location = writable(undefined);

/* node_modules/svelte-router/src/Router.svelte generated by Svelte v3.7.1 */

const Router = create_ssr_component(($$result, $$props, $$bindings, $$slots) => {
	

    let { basepath = "/", url = null, router = {} } = $$props;

    setContext(ROUTER, router);

    const getRoute = loc => {
        const pathname = loc.pathname;
        const matched = router.routes.find(route => route.rule.test(pathname));

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

	if ($$props.basepath === void 0 && $$bindings.basepath && basepath !== void 0) $$bindings.basepath(basepath);
	if ($$props.url === void 0 && $$bindings.url && url !== void 0) $$bindings.url(url);
	if ($$props.router === void 0 && $$bindings.router && router !== void 0) $$bindings.router(router);

	return `${$$slots.default ? $$slots.default() : ``}`;
});

/* node_modules/svelte-router/src/Route.svelte generated by Svelte v3.7.1 */

const Route = create_ssr_component(($$result, $$props, $$bindings, $$slots) => {
	

    let { names = [], defaultName = null } = $$props;

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

    onDestroy(unlisten);

	if ($$props.names === void 0 && $$bindings.names && names !== void 0) $$bindings.names(names);
	if ($$props.defaultName === void 0 && $$bindings.defaultName && defaultName !== void 0) $$bindings.defaultName(defaultName);

	{
                const { names, defaultName, ...rest } = $$props;
                routeProps = rest;
            }

	return `${ component !== null ? `${validate_component(((component) || missing_component), 'svelte:component').$$render($$result, Object.assign({ route: activeRoute }, routeProps), {}, {})}` : `${$$slots.default ? $$slots.default() : ``}` }`;
});

const defaultConverters = [{
    type: "str",
    pattern: "[\\w-]+"
}, {
    type: "int",
    pattern: "\\d+"
}];

const CreateRouter = ({ routes, converters = [] }) => {

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

            if (!("component" in route)) {
                return false;
            }

            let component = route.component();

            if (component instanceof Promise) {
                component.then(callback);
            } else {
                callback(component);
            }

        }
    };
};

/* node_modules/svelte-router/src/Link.svelte generated by Svelte v3.7.1 */

const Link = create_ssr_component(($$result, $$props, $$bindings, $$slots) => {
	let $location;

	

    let { to = "#", replace = false, state = {}, getProps = () => ({}) } = $$props;

    const router = getContext(ROUTER);
    const location = getContext(LOCATION); $location = get_store_value(location);

    let href, isCurrent, props, attrs;

	if ($$props.to === void 0 && $$bindings.to && to !== void 0) $$bindings.to(to);
	if ($$props.replace === void 0 && $$bindings.replace && replace !== void 0) $$bindings.replace(replace);
	if ($$props.state === void 0 && $$bindings.state && state !== void 0) $$bindings.state(state);
	if ($$props.getProps === void 0 && $$bindings.getProps && getProps !== void 0) $$bindings.getProps(getProps);

	$location = get_store_value(location);

	href = typeof to === "string" ? to : router.resolveUrl(to);
	isCurrent = href === $location.pathname;
	let ariaCurrent = isCurrent ? "page" : undefined;
	props = getProps({
                location: $location,
                href,
                isCurrent,
            });
	{
                const { to, replace, state, ...rest } = $$props;
                attrs = rest;
            }

	return `<a${spread([{ href: `${escape(href)}` }, { "aria-current": `${escape(ariaCurrent)}` }, props, attrs])}>
	    ${$$slots.default ? $$slots.default() : ``}
	</a>`;
});

/* src/views/Home.svelte generated by Svelte v3.7.1 */

const Home = create_ssr_component(($$result, $$props, $$bindings, $$slots) => {
	let { route } = $$props;

	if ($$props.route === void 0 && $$bindings.route && route !== void 0) $$bindings.route(route);

	return `<h1>Home Page</h1>

	<p>${escape(JSON.stringify(route))}</p>`;
});

/* src/views/Article.svelte generated by Svelte v3.7.1 */

const Article = create_ssr_component(($$result, $$props, $$bindings, $$slots) => {
	let { route } = $$props;

	if ($$props.route === void 0 && $$bindings.route && route !== void 0) $$bindings.route(route);

	return `<h1>Article Page</h1>

	<p>${escape(JSON.stringify(route))}</p>`;
});

const router = CreateRouter({
    routes: [{
        path: "/",
        name: "home",
        component: () => Home
    },
    {
        path: "/article/<int:id>-<str:alias>/",
        name: "article",
        component: () => Article
        // component: () => import("./views/Article.svelte").then(_ => _.default)
    }
    ]
});

/* src/App.svelte generated by Svelte v3.7.1 */

const css = {
	code: "h1.svelte-o015nm{color:purple}",
	map: "{\"version\":3,\"file\":\"App.svelte\",\"sources\":[\"App.svelte\"],\"sourcesContent\":[\"<script>\\n    import { Router, Link, Route } from \\\"svelte-router\\\";\\n    import { router } from \\\"./router\\\";\\n    export let name;\\n\\n    export let url;\\n</script>\\n\\n<style>\\n    h1 {\\n        color: purple;\\n    }\\n</style>\\n\\n<h1>Hello {name}!</h1>\\n\\n<Router {url} {router}>\\n\\n    <nav>\\n        <Link to=\\\"/\\\">home</Link>\\n        <Link to=\\\"/article/23-ewfjie-34-4vdfv/\\\">Article #23</Link>\\n        <Link\\n            to={{ name: 'article', params: { id: 24, alias: 'sd3vf-324-sdf' } }}>\\n            Article #24\\n        </Link>\\n    </nav>\\n\\n    <Route names={['home', 'article']} defaultName={'home'} />\\n\\n</Router>\\n\"],\"names\":[],\"mappings\":\"AASI,EAAE,cAAC,CAAC,AACA,KAAK,CAAE,MAAM,AACjB,CAAC\"}"
};

const App = create_ssr_component(($$result, $$props, $$bindings, $$slots) => {
	
    let { name, url } = $$props;

	if ($$props.name === void 0 && $$bindings.name && name !== void 0) $$bindings.name(name);
	if ($$props.url === void 0 && $$bindings.url && url !== void 0) $$bindings.url(url);

	$$result.css.add(css);

	return `<h1 class="svelte-o015nm">Hello ${escape(name)}!</h1>

	${validate_component(Router, 'Router').$$render($$result, { url: url, router: router }, {}, {
		default: () => `

	    <nav>
	        ${validate_component(Link, 'Link').$$render($$result, { to: "/" }, {}, { default: () => `home` })}
	        ${validate_component(Link, 'Link').$$render($$result, { to: "/article/23-ewfjie-34-4vdfv/" }, {}, { default: () => `Article #23` })}
	        ${validate_component(Link, 'Link').$$render($$result, { to: { name: 'article', params: { id: 24, alias: 'sd3vf-324-sdf' } } }, {}, {
		default: () => `
	            Article #24
	        `
	})}
	    </nav>

	    ${validate_component(Route, 'Route').$$render($$result, {
		names: ['home', 'article'],
		defaultName: 'home'
	}, {}, {})}

	`
	})}`;
});

module.exports = App;
