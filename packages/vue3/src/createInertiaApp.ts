import {
  ConfigureInertiaAppOptionsForCSR,
  ConfigureInertiaAppOptionsForSSR,
  createPageResolver,
  InertiaAppResponse,
  InertiaAppSSRResponse,
  PageProps,
  router,
  setupProgress,
} from '@inertiajs/core'
import { createSSRApp, DefineComponent, h, Plugin, App as VueApp } from 'vue'
import { renderToString } from 'vue/server-renderer'
import App, { InertiaApp, InertiaAppProps, plugin } from './app'
import { createVueApp } from './createVueApp'
import { ComponentResolver } from './types'

type SetupOptions<ElementType, SharedProps extends PageProps> = {
  el: ElementType
  App: InertiaApp
  props: InertiaAppProps<SharedProps>
  plugin: Plugin
}

type InertiaAppOptionsForCSR<SharedProps extends PageProps> = ConfigureInertiaAppOptionsForCSR<
  SharedProps,
  ComponentResolver,
  SetupOptions<HTMLElement, SharedProps>,
  void,
  DefineComponent
>

type InertiaAppOptionsForSSR<SharedProps extends PageProps> = ConfigureInertiaAppOptionsForSSR<
  SharedProps,
  ComponentResolver,
  SetupOptions<null, SharedProps>,
  VueApp,
  DefineComponent
> & {
  render: typeof renderToString
}

export default async function createInertiaApp<SharedProps extends PageProps = PageProps>(
  options: InertiaAppOptionsForCSR<SharedProps>,
): Promise<void>
export default async function createInertiaApp<SharedProps extends PageProps = PageProps>(
  options: InertiaAppOptionsForSSR<SharedProps>,
): Promise<InertiaAppSSRResponse>
export default async function createInertiaApp<SharedProps extends PageProps = PageProps>({
  id = 'app',
  resolve,
  setup,
  title,
  progress = {},
  page,
  pages,
  render,
}: InertiaAppOptionsForCSR<SharedProps> | InertiaAppOptionsForSSR<SharedProps>): InertiaAppResponse {
  if (!resolve && !pages) {
    throw new Error('You must provide either a `resolve` function or a `pages` object.')
  }

  if (!resolve) {
    resolve = createPageResolver<DefineComponent>(pages!, (page: string) => [
      `./pages/${page}.vue`,
      `/pages/${page}.vue`,
      `./Pages/${page}.vue`,
      `/Pages/${page}.vue`,
    ])
  }

  const isServer = typeof window === 'undefined'
  const el = isServer ? null : document.getElementById(id)
  const initialPage = page || JSON.parse(el?.dataset.page || '{}')
  const resolveComponent = (name: string) => Promise.resolve(resolve(name)).then((module) => module?.default || module)

  let head: string[] = []

  const vueApp = await Promise.all([
    resolveComponent(initialPage.component),
    router.decryptHistory().catch(() => {}),
  ]).then(([initialComponent]) => {
    const props = {
      initialPage,
      initialComponent,
      resolveComponent,
      titleCallback: title,
      onHeadUpdate: isServer ? (elements: string[]) => (head = elements) : undefined,
    }

    if (!setup) {
      return createVueApp(el, props, isServer)
    }

    if (isServer) {
      const ssrSetup = setup as (options: SetupOptions<null, SharedProps>) => VueApp

      return ssrSetup({
        el: null,
        App,
        props,
        plugin,
      })
    }

    const csrSetup = setup as (options: SetupOptions<HTMLElement, SharedProps>) => void

    return csrSetup({
      el: el as HTMLElement,
      App,
      props,
      plugin,
    })
  })

  if (!isServer && progress) {
    setupProgress(progress)
  }

  if (isServer && render) {
    const body = await render(
      createSSRApp({
        render: () =>
          h('div', {
            id,
            'data-page': JSON.stringify(initialPage),
            'data-server-rendered': 'true',
            innerHTML: vueApp ? render(vueApp) : '',
          }),
      }),
    )

    return { head, body }
  }
}
