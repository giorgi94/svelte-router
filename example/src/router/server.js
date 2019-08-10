import { CreateRouter } from "svelte-router";
import HomePage from "../views/Home.svelte";
import ArticlePage from "../views/Article.svelte";

export const router = CreateRouter({
    routes: [{
        path: "/",
        name: "home",
        component: () => HomePage
    },
    {
        path: "/article/<int:id>-<str:alias>/",
        name: "article",
        component: () => ArticlePage
    }
    ]
});