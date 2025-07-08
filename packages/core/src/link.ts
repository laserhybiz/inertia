import {
  CacheForOption,
  FormDataConvertible,
  LinkPrefetchOption,
  mergeDataIntoQueryString,
  Method,
  PendingVisit,
  PreserveStateOption,
  Progress,
} from './'

export interface InertiaLinkOptions {
  data?: Record<string, FormDataConvertible>
  href: string | { url: string; method: Method }
  method?: Method
  headers?: Record<string, string>
  preserveScroll?: PreserveStateOption
  preserveState?: PreserveStateOption
  replace?: boolean
  only?: string[]
  except?: string[]
  onCancelToken?: (cancelToken: import('axios').CancelTokenSource) => void
  onBefore?: () => void
  onStart?: (visit: PendingVisit) => void
  onProgress?: (progress: Progress) => void
  onFinish?: (visit: PendingVisit) => void
  onCancel?: () => void
  onSuccess?: () => void
  onError?: () => void
  queryStringArrayFormat?: 'brackets' | 'indices'
  async?: boolean
  prefetch?: boolean | LinkPrefetchOption | LinkPrefetchOption[]
  cacheFor?: CacheForOption | CacheForOption[]
}

export default function resolveLinkOptions(options: InertiaLinkOptions) {
  const {
    data = {},
    href,
    method = 'get',
    headers = {},
    preserveScroll = false,
    preserveState,
    replace = false,
    only = [],
    except = [],
    onCancelToken = () => {},
    onBefore = () => {},
    onStart = () => {},
    onProgress = () => {},
    onFinish = () => {},
    onCancel = () => {},
    onSuccess = () => {},
    onError = () => {},
    queryStringArrayFormat = 'brackets',
    async = false,
    prefetch = false,
    cacheFor = 0,
  } = options

  const _method: Method = typeof href === 'object' ? href.method : (method.toLowerCase() as Method)

  const prefetchModes = (() => {
    if (prefetch === true) {
      return ['hover']
    }

    if (prefetch === false) {
      return []
    }

    if (Array.isArray(prefetch)) {
      return prefetch
    }

    return [prefetch]
  })() as LinkPrefetchOption[]

  const cacheForValue = (() => {
    if (cacheFor !== 0) {
      // If they've provided a value, respect it
      return cacheFor
    }

    if (prefetchModes.length === 1 && prefetchModes[0] === 'click') {
      // If they've only provided a prefetch mode of 'click',
      // we should only prefetch for the next request but not keep it around
      return 0
    }

    // Otherwise, default to 30 seconds
    return 30_000
  })()

  const [_href, _data] = mergeDataIntoQueryString(
    _method,
    typeof href === 'object' ? href.url : href || '',
    data,
    queryStringArrayFormat,
  )

  return {
    href: _href,
    method: _method,
    baseParams: {
      data: _data,
      method: _method,
      replace,
      preserveScroll,
      preserveState: preserveState ?? _method !== 'get',
      only,
      except,
      headers,
      async,
    },
    cacheFor: cacheForValue,
    prefetchModes,
    hooks: {
      onCancelToken,
      onBefore,
      onStart,
      onProgress,
      onFinish,
      onCancel,
      onSuccess,
      onError,
    },
  }
}
