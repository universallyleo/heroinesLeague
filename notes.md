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
