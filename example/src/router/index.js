
export const routerStruct = {
    routes: [{
        path: "/",
        name: "home",
        component: "Home"
    },
    {
        path: "/article/<int:id>-<str:alias>/",
        name: "article",
        component: "Article"
    }
    ]
};