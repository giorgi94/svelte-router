import { CreateRouter } from "svelte-router";
import { routerStruct } from ".";

import HomeComponent from "../views/Home.svelte";
import ArticleComponent from "../views/Article.svelte";



const getComponent = (name) => {
    switch (name) {
        case "Home":
            return () => HomeComponent;
        case "Article":
            return () => ArticleComponent;
        default:
            throw new Error(`Component for ${name} is not defined`);
    }
};


export const router = CreateRouter({
    ...routerStruct,
    routes: routerStruct.routes.map(route => {
        let component = getComponent(route.component);


        return {
            ...route,
            component
        };
    })
});