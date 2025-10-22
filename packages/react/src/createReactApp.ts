import { PageProps, PageResolver } from '@inertiajs/core'
import { createElement, ReactElement } from 'react'
import { hydrateRoot } from 'react-dom/client'
import App, { InertiaAppProps } from './App'

interface PageResolverOptions {
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
): PageResolver {
  const {
    patterns = (page: string) => [
      `./pages/${page}.jsx`,
      `/pages/${page}.jsx`,
      `./Pages/${page}.jsx`,
      `/Pages/${page}.jsx`,
      `./pages/${page}.tsx`,
      `/pages/${page}.tsx`,
      `./Pages/${page}.tsx`,
      `/Pages/${page}.tsx`,
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

export function createReactApp<SharedProps extends PageProps = PageProps>(
  el: HTMLElement | null,
  props: InertiaAppProps<SharedProps>,
  isServer: boolean,
): ReactElement {
  const appElement = createElement(App, {
    children: undefined,
    initialPage: props.initialPage,
    initialComponent: props.initialComponent,
    resolveComponent: props.resolveComponent,
    titleCallback: props.titleCallback,
    onHeadUpdate: props.onHeadUpdate,
  })

  if (!isServer && el) {
    hydrateRoot(el, appElement, {
      onRecoverableError: (error: unknown) => {
        if (error instanceof Error) {
          // TODO: make configurable...
          throw error
        }
      },
    })
  }

  return appElement
}
