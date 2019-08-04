# Svelte Router

Currently not ready for production.

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
        resolve: () => "/",
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