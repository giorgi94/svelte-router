import { CreateRouter } from "svelte-router";
import HomePage from "../views/Home.svelte";



const HomeComponent = () => import("../views/Home.svelte").then(_ => _.default);
const ArticleComponent = () => import("../views/Article.svelte").then(_ => _.default);


const getComponent = (name) => {
    switch (name) {
        case "Home":
            return HomeComponent;
        case "Article":
            return ArticleComponent;
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
