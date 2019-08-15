<script>
    import { Router, Link, Route } from "svelte-router";
    import { setContext } from "svelte";

    export let router;
    export let url = null;

    setContext("router", router);
</script>

<style>
    h1 {
        color: purple;
    }
</style>

<h1>Hello Svelte Router</h1>

<Router {url} {router}>

    <nav>
        <Link to="/">home</Link>
        <Link to="/article/23-ewfjie-34-4vdfv/">Article #23</Link>
        <Link
            to={{ name: 'article', params: { id: 24, alias: 'sd3vf-324-sdf' }, query: { page: 1 } }}>
            Article #24
        </Link>
    </nav>

    <Route names={['home', 'article']} defaultName={'home'} />

</Router>
