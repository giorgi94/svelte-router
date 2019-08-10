import { CreateRouter } from "svelte-router";
import HomePage from "../views/Home.svelte";


export const router = CreateRouter({
    routes: [{
        path: "/",
        name: "home",
        component: () => HomePage
    },
    {
        path: "/article/<int:id>-<str:alias>/",
        name: "article",
        component: () => import("../views/Article.svelte").then(_ => _.default)
    }
    ]
});