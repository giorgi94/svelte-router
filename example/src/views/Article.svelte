<script>
    import { getContext, createEventDispatcher } from "svelte";

    export let route;

    const router = getContext("router");

    console.log(router);

    const doSomething = () => {
        router.navigate({
            name: "article",
            params: { id: 5, alias: "myarticle" },
            query: { page: 8, cat: ["sda", "sdft"] },
        });
    };
</script>

<h1>Article Page</h1>

<p>{JSON.stringify(route, null, 4)}</p>

<button on:click={doSomething}>Click</button>
