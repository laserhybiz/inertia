import { createInertiaApp, type ResolvedComponent } from '@inertiajs/svelte'
import { hydrate, mount } from 'svelte'

createInertiaApp({
  pages: import.meta.glob<ResolvedComponent>('./Pages/**/*.svelte', { eager: true }),
  setup({ el, App, props }) {
    if (el.dataset.serverRendered === 'true') {
      hydrate(App, { target: el, props })
    } else {
      mount(App, { target: el, props })
    }
  },
})
