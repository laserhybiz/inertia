import {
  ConfigureInertiaAppOptionsForCSR,
  ConfigureInertiaAppOptionsForSSR,
  InertiaAppResponse,
  InertiaAppSSRResponse,
  PageProps,
  router,
  setupProgress,
} from '@inertiajs/core'
import { ReactElement, createElement } from 'react'
import { renderToString } from 'react-dom/server'
import App, { InertiaAppProps, type InertiaApp } from './App'
import { createPageResolver, createReactApp } from './createReactApp'
import { ReactComponent } from './types'

export type SetupOptions<ElementType, SharedProps extends PageProps> = {
  el: ElementType
  App: InertiaApp
  props: InertiaAppProps<SharedProps>
}

// The 'unknown' type is necessary for backwards compatibility...
type ComponentResolver = (
  name: string,
) => ReactComponent | Promise<ReactComponent> | { default: ReactComponent } | unknown

type InertiaAppOptionsForCSR<SharedProps extends PageProps> = ConfigureInertiaAppOptionsForCSR<
  SharedProps,
  ComponentResolver,
  SetupOptions<HTMLElement, SharedProps>,
  void,
  ReactComponent
>

type InertiaAppOptionsForSSR<SharedProps extends PageProps> = ConfigureInertiaAppOptionsForSSR<
  SharedProps,
  ComponentResolver,
  SetupOptions<null, SharedProps>,
  ReactElement,
  ReactComponent
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
    throw new Error('You must provide a `resolve` function or a `pages` object.')
  }

  if (!resolve) {
    resolve = createPageResolver(pages!)
  }

  const isServer = typeof window === 'undefined'
  const el = isServer ? null : document.getElementById(id)
  const initialPage = page || JSON.parse(el?.dataset.page || '{}')
  // @ts-expect-error - This can be improved once we remove the 'unknown' type from the resolver...
  const resolveComponent = (name) => Promise.resolve(resolve(name)).then((module) => module.default || module)

  let head: string[] = []

  const reactApp = await Promise.all([
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
      return createReactApp(el, props, isServer)
    }

    if (isServer) {
      const ssrSetup = setup as (options: SetupOptions<null, SharedProps>) => ReactElement

      return ssrSetup({
        el: null,
        App,
        props,
      })
    }

    const csrSetup = setup as (options: SetupOptions<HTMLElement, SharedProps>) => void

    return csrSetup({
      el: el as HTMLElement,
      App,
      props,
    })
  })

  if (!isServer && progress) {
    setupProgress(progress)
  }

  if (isServer && render) {
    const body = await render(
      createElement(
        'div',
        {
          id,
          'data-page': JSON.stringify(initialPage),
        },
        reactApp as ReactElement,
      ),
    )

    return { head, body }
  }
}
