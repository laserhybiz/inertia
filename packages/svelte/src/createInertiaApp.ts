import {
  createPageResolver,
  router,
  setupProgress,
  type ConfigureInertiaAppOptionsForCSR,
  type InertiaAppResponse,
  type PageProps,
} from '@inertiajs/core'
import { escape } from 'lodash-es'
import App, { type InertiaAppProps } from './components/App.svelte'
import type { ComponentResolver, ResolvedComponent } from './types'

type SvelteRenderResult = { html: string; head: string; css?: { code: string } }

type SetupOptions<SharedProps extends PageProps> = {
  el: HTMLElement | null
  App: typeof App
  props: InertiaAppProps<SharedProps>
}

// Svelte doesn't use ConfigureInertiaAppOptionsForSSR as it doesn't pass a
// 'render' function, it calls it directly in the setup() method...
type InertiaAppOptions<SharedProps extends PageProps> = ConfigureInertiaAppOptionsForCSR<
  SharedProps,
  ComponentResolver,
  SetupOptions<SharedProps>,
  SvelteRenderResult | void,
  ResolvedComponent
> & {
  hydrate?: Function
  mount?: Function
}

export default async function createInertiaApp<SharedProps extends PageProps = PageProps>({
  id = 'app',
  resolve,
  setup,
  progress = {},
  page,
  pages,
}: InertiaAppOptions<SharedProps>): InertiaAppResponse {
  if (!resolve && !pages) {
    throw new Error('You must provide either a `resolve` function or a `pages` object.')
  }

  if (!resolve) {
    resolve = createPageResolver(pages!, {
      patterns(page: string) {
        return [`./pages/${page}.svelte`, `/pages/${page}.svelte`, `./Pages/${page}.svelte`, `/Pages/${page}.svelte`]
      },
    })
  }

  const isServer = typeof window === 'undefined'
  const el = isServer ? null : document.getElementById(id)
  const initialPage = page || JSON.parse(el?.dataset.page || '{}')
  const resolveComponent = (name: string) => Promise.resolve(resolve(name))

  const svelteApp = await Promise.all([
    resolveComponent(initialPage.component),
    router.decryptHistory().catch(() => {}),
  ]).then(([initialComponent]) => {
    const props = { initialPage, initialComponent, resolveComponent }

    return setup
      ? setup({
          el,
          App,
          props,
        })
      : new App({ target: el!, props, hydrate: true })
  })

  if (isServer && svelteApp) {
    const { html, head, css } = svelteApp

    return {
      body: `<div data-server-rendered="true" id="${id}" data-page="${escape(JSON.stringify(initialPage))}">${html}</div>`,
      head: [head, css ? `<style data-vite-css>${css.code}</style>` : ''],
    }
  }

  if (!isServer && progress) {
    setupProgress(progress)
  }
}
