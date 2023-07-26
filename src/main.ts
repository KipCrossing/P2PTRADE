import App from "./App.svelte";

const app = new App({
  target: document.body,
  props: {
    title: "Trading App",
  },
});

export default app;
