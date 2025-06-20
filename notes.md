# Setup

1. `pnpm dlx sv create` then follows instruction

# Changing layout depending on user screen

In `+page.svelte`, we have

```
<script>
let innerWidth = $state(0);
</script>

<svelte:window bind:innerWidth />
```

# problem with dynamic src with enhanced image

`<enhanced:img src={myImgSrc} />` just fails for me. Eventually arrived at [this github discussion](https://github.com/sveltejs/kit/discussions/11098), which just says that one needs to go through annoying `+page.js` to load ALL images first etc etc. Extremely annoying. Just put all images to static directory and load from there now...
