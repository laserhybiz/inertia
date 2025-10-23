import { router } from '@inertiajs/core'
import { createInertiaApp } from '@inertiajs/vue3'
import type { DefineComponent } from 'vue'
import { createApp, h } from 'vue'

window.testing = { Inertia: router }

const scenarios: Record<string, () => void> = {
  // @ts-expect-error - 'pages' xor 'resolve'
  invalid: () => createInertiaApp({}),
  pagesWithEagerLoading: () =>
    createInertiaApp({
      pages: import.meta.glob<DefineComponent>('./Pages/**/*.vue', { eager: true }),
    }),
  pagesWithoutEagerLoading: () =>
    createInertiaApp({
      pages: import.meta.glob<DefineComponent>('./Pages/**/*.vue', { eager: false }),
    }),
  default: () =>
    createInertiaApp({
      resolve: async (name) => {
        const pages = import.meta.glob<DefineComponent>('./Pages/**/*.vue', { eager: true })

        if (name === 'DeferredProps/InstantReload') {
          // Add small delay to ensure the component is loaded after the initial page load
          // This is for projects that don't use { eager: true } in import.meta.glob
          await new Promise((resolve) => setTimeout(resolve, 50))
        }

        return pages[`./Pages/${name}.vue`]
      },
      setup({ el, App, props, plugin }) {
        const inst = createApp({ render: () => h(App, props) })

        if (!window.location.pathname.startsWith('/plugin/without')) {
          inst.use(plugin)
        }

        inst.mount(el)
      },
    }),
}

const scenario = new URLSearchParams(window.location.search).get('createInertiaApp') || 'default'
console.log({ scenario })
scenarios[scenario]()
