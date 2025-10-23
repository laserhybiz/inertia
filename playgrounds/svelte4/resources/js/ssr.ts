import { createInertiaApp, type ResolvedComponent } from '@inertiajs/svelte'
import createServer from '@inertiajs/svelte/server'

createServer((page) =>
  createInertiaApp({
    page,
    pages: import.meta.glob<ResolvedComponent>('./Pages/**/*.svelte', { eager: true }),
    setup({ App, props }) {
      return App.render(props)
    },
  }),
)
