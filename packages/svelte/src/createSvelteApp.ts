import App, { type InertiaAppProps } from './components/App.svelte'
import { type ComponentResolver } from './types'

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
      `./pages/${page}.svelte`,
      `/pages/${page}.svelte`,
      `./Pages/${page}.svelte`,
      `/Pages/${page}.svelte`,
    ],
    transform = (module: any) => module,
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

export function createSvelteApp(el: HTMLElement | null, props: InertiaAppProps, hydrate?: Function, mount?: Function) {
  if (!hydrate || !mount) {
    return new App({ target: el!, props, hydrate: true })
  }

  if (el?.dataset.serverRendered === 'true') {
    return hydrate(App, { target: el, props })
  }

  return mount(App, { target: el, props })
}
