import { App as VueApp, createSSRApp, h } from 'vue'
import App, { InertiaAppProps, plugin } from './app'
import { ComponentResolver } from './types'

export interface PageResolverOptions {
  /**
   * Transform function to extract the component from the module
   * @default (module) => module.default || module
   */
  patterns?: (page: string) => string[]
  transform?: (module: any) => any
}

export function createPageResolver<T extends Record<string, any>>(
  pages: T,
  options: PageResolverOptions = {},
): ComponentResolver {
  const {
    patterns = (page: string) => [
      `./pages/${page}.vue`,
      `/pages/${page}.vue`,
      `./Pages/${page}.vue`,
      `/Pages/${page}.vue`,
    ],
    transform = (module: any) => module.default || module,
  } = options

  return async (name: string) => {
    for (const pattern of patterns(name)) {
      const page = pages[pattern]

      if (page) {
        return transform(typeof page === 'function' ? await page() : page)
      }
    }

    throw new Error(`Page component "${name}" not found.`)
  }
}

export function createVueApp(el: HTMLElement | null, props: InertiaAppProps, isServer: boolean): VueApp {
  const app = createSSRApp({
    render: () => h(App, props),
  }).use(plugin)

  if (!isServer && el) {
    app.mount(el)
  }

  return app
}
