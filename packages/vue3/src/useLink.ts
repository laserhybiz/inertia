import { InertiaLinkOptions, Method, resolveLinkOptions, router, shouldIntercept } from '@inertiajs/core'
import { computed, ref } from 'vue'

export function useLinkBindings(
  href: string | { url: string; method: Method },
  options: Omit<InertiaLinkOptions, 'href'> = {},
) {
  const link = useLink(href, options)

  return {
    href: link.href,
    'data-loading': link.loading.value ? '' : undefined,
    ...link.events,
  }
}

export function useLink(
  href: string | { url: string; method: Method },
  options: Omit<InertiaLinkOptions, 'href'> = {},
) {
  const inFlightCount = ref(0)
  const hoverTimeout = ref<number | null>(null)

  const resolved = resolveLinkOptions({ href, ...options })

  const visitParams = {
    ...resolved.baseParams,
    onCancelToken: resolved.hooks.onCancelToken,
    onBefore: resolved.hooks.onBefore,
    onStart: (visit) => {
      inFlightCount.value++
      resolved.hooks.onStart?.(visit)
    },
    onProgress: resolved.hooks.onProgress,
    onFinish: (visit) => {
      inFlightCount.value--
      resolved.hooks.onFinish?.(visit)
    },
    onCancel: resolved.hooks.onCancel,
    onSuccess: resolved.hooks.onSuccess,
    onError: resolved.hooks.onError,
  }

  const prefetch = () => {
    router.prefetch(resolved.href, resolved.baseParams, { cacheFor: resolved.cacheFor })
  }

  const regularEvents = {
    onClick: (event) => {
      if (shouldIntercept(event)) {
        event.preventDefault()
        router.visit(resolved.href, visitParams)
      }
    },
  }

  const prefetchHoverEvents = {
    onMouseenter: () => {
      hoverTimeout.value = window.setTimeout(prefetch, 75)
    },
    onMouseleave: () => {
      if (hoverTimeout.value !== null) {
        clearTimeout(hoverTimeout.value)
      }
    },
    onClick: regularEvents.onClick,
  }

  const prefetchClickEvents = {
    onMousedown: (event) => {
      if (shouldIntercept(event)) {
        event.preventDefault()
        prefetch()
      }
    },
    onMouseup: (event) => {
      event.preventDefault()
      router.visit(resolved.href, visitParams)
    },
    onClick: (event) => {
      if (shouldIntercept(event)) {
        // Let the mouseup event handle the visit
        event.preventDefault()
      }
    },
  }

  return {
    href: resolved.href,
    loading: computed(() => inFlightCount.value > 0),
    events: (() => {
      if (resolved.prefetchModes.includes('hover')) {
        return prefetchHoverEvents
      }

      if (resolved.prefetchModes.includes('click')) {
        return prefetchClickEvents
      }

      return regularEvents
    })(),
    onMounted: () => {
      if (resolved.prefetchModes.includes('mount')) {
        prefetch()
      }
    },
    onUnmounted: () => {
      if (hoverTimeout.value !== null) {
        clearTimeout(hoverTimeout.value)
      }
    },
  }
}
