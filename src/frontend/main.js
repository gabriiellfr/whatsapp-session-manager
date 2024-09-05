import App from './App.svelte';
import { Router } from 'svelte-routing';

const app = new App({
    target: document.body,
    props: {
        url: window.location.pathname,
    },
});

export default app;

if (import.meta.hot) {
    import.meta.hot.accept();
    import.meta.hot.dispose(() => {
        app.$destroy();
    });
}
