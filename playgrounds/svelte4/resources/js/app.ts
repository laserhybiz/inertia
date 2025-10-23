import { createInertiaApp, type ResolvedComponent } from '@inertiajs/svelte'

createInertiaApp({
  pages: import.meta.glob<ResolvedComponent>('./Pages/**/*.svelte', { eager: true }),
  setup({ el, App, props }) {
    new App({ target: el, props, hydrate: true })
  },
})
