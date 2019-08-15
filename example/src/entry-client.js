import "../assets/stylus/main.styl";
import App from "./App.svelte";

import { router } from "./router/client";


const el = document.querySelector("#app");
el.innerHTML = "";

const app = new App({
    target: el,
    props: {
        router,
        url: null
    }
});

export default app;