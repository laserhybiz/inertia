import { PageProps } from '@inertiajs/core'
import { createElement, ReactElement } from 'react'
import { hydrateRoot } from 'react-dom/client'
import App, { InertiaAppProps } from './App'

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
