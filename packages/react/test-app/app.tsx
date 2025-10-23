import { router } from '@inertiajs/core'
import { createInertiaApp } from '@inertiajs/react'
import { ComponentType } from 'react'
import { createRoot } from 'react-dom/client'

window.testing = { Inertia: router }

const scenarios: Record<string, () => void> = {
  default: () =>
    createInertiaApp({
      resolve: async (name) => {
        const pages = import.meta.glob('./Pages/**/*.tsx', { eager: true })

        if (name === 'DeferredProps/InstantReload') {
          // Add small delay to ensure the component is loaded after the initial page load
          // This is for projects that don't use { eager: true } in import.meta.glob
          await new Promise((resolve) => setTimeout(resolve, 50))
        }

        return pages[`./Pages/${name}.tsx`]
      },
      setup({ el, App, props }) {
        createRoot(el).render(<App {...props} />)
      },
      progress: {
        delay: 0,
        color: 'red',
      },
    }),
  // @ts-expect-error - 'pages' xor 'resolve'
  invalid: () => createInertiaApp({}),
  pagesWithEagerLoading: () =>
    createInertiaApp({
      pages: import.meta.glob<ComponentType>('./Pages/**/*.tsx', { eager: true }),
    }),
  pagesWithoutEagerLoading: () =>
    createInertiaApp({
      pages: import.meta.glob<ComponentType>('./Pages/**/*.tsx', { eager: false }),
    }),
}

const scenario = new URLSearchParams(window.location.search).get('createInertiaApp') || 'default'
scenarios[scenario]()
