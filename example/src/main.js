import "../assets/stylus/main.styl";
import App from "./App.svelte";


const el = document.querySelector("#app");
el.innerHTML = "";

const app = new App({
    target: el,
    props: {
        name: "world",
        url: window.location.pathname
    }
});

export default app;