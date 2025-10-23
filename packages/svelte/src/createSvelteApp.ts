import type { InertiaAppProps } from './components/App.svelte'
import App from './components/App.svelte'

export function createSvelteApp(
  el: HTMLElement | null,
  props: InertiaAppProps,
  hydrate?: Function,
  mount?: Function,
  render?: Function,
) {
  if (!hydrate || !mount) {
    // Svelte 4...
    return new App({ target: el!, props, hydrate: true })
  }

  if (typeof window === 'undefined' && render) {
    // Svelte 5 SSR...
    return render(App, { props })
  }

  if (el?.dataset.serverRendered === 'true') {
    return hydrate(App, { target: el, props })
  }

  return mount(App, { target: el, props })
}
