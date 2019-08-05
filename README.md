# Svelte Router

#### Currently not ready for production.

This project was inspired by [svelte-routing](https://github.com/EmilTholin/svelte-routing). It is written to work like `vue-router`, by predefining routes and passing it to router. Components are written so that it supports lazy-loading, routes need to be named and provide some helpful functionalities.


## Usage

Like in `vue-router` you define routes and then pass it to router

```javascript
// router.js

const HomePage = () => import("@/views/Home.svelte").then(_ => _.default);
const CategoryPage = () => import("@/views/Category.svelte").then(_ => _.default);

export const routes = [{
        resolve: () => "/",
        rule: /^\/$/,
        name: "home",
        component: HomePage
    },
    {
        resolve: ({ alias }) => `/category/${alias}/`,
        rule: new RegExp("^/category/(?<alias>[\\w-]+)/$", "u"),
        name: "category",
        component: CategoryPage
    }
];

// App.svelte

<Router {routes}>
    <Route
        names={['home', 'category']}
        defaultName={'home'}
        {...viewProps} />
</Router>
```