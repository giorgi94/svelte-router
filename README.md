# Svelte Router

This project was inspired by [svelte-routing](https://github.com/EmilTholin/svelte-routing). It is written to work similar to `vue-router`. Components are written so that it supports lazy-loading, routes need to be named and supports regex patterns.



## Getting started

### Installation

```shell
npm install git+https://github.com/giorgi94/svelte-router.git
```

### Usage

Like in `vue-router`, we create router in separate file

```javascript
// router.js

import { CreateRouter } from "svelte-router"
import HomePage from "@/views/Home.svelte"

export const router = CreateRouter({
    // optional
    converters: [] ,
    // required
    routes: [{
        path: "/",
        name: "home",
        component: HomePage
    },
    {
        path: "/category/<str:alias>/",
        name: "category",
        component: () => import("@/views/Category.svelte").then(_ => _.default)
    },
    {
        path: "/article/<int:id>-<str:alias>/",
        name: "article",
        component: () => import("@/views/Article.svelte").then(_ => _.default)
    }]
});
```
url paths are written, like in flask, where `<int:id>` is converter. We have defaults, and custom converters can be added when router is created.

```javascript
// utils.js

const defaultConverters = [{
    type: "str",
    pattern: "[\\w-]+"
}, {
    type: "int",
    pattern: "\\d+"
}];

```

When router is created we import it in `App.svelte` file and register router component


```html
<!-- App.svelte -->
<script>
    import { Router, Link, Route } from "svelte-router";
    import { router } from "./router";

    export let url = "";
    export let viewProps = {}
</script>

<Router {url} {router}>
    <nav>
        <!-- Link component can take string or object -->
        <Link to="/">Home</Link>
        <Link to={name: 'category', params: { alias: 'tech' }}>Category</Link>
        <Link to="/article/34-my-article-title/"}>Article</Link>
    </nav>

    <!-- Route component renders components by active route and provided names -->
    <Route
            names={['home', 'category']}
            defaultName={'home'}
            {...viewProps} />

    <Route names={['article']}/>

</Router>
```

Components, which are in `Route`, receive data on current route and other props

```html
<!-- Home.svelte -->


<script>
    export let route = {};
</script>

<div>Home Page</div>

```