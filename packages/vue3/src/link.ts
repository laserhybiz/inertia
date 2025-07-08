import {
  CacheForOption,
  FormDataConvertible,
  LinkPrefetchOption,
  Method,
  PendingVisit,
  PreserveStateOption,
  Progress,
} from '@inertiajs/core'
import { computed, defineComponent, DefineComponent, h, onMounted, onUnmounted, PropType } from 'vue'
import { useLink } from './useLink'

export interface InertiaLinkProps {
  as?: string
  data?: Record<string, FormDataConvertible>
  href: string | { url: string; method: Method }
  method?: Method
  headers?: Record<string, string>
  onClick?: (event: MouseEvent) => void
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

type InertiaLink = DefineComponent<InertiaLinkProps>

const Link: InertiaLink = defineComponent({
  name: 'Link',
  props: {
    as: {
      type: String,
      default: 'a',
    },
    data: {
      type: Object,
      default: () => ({}),
    },
    href: {
      type: [String, Object] as PropType<InertiaLinkProps['href']>,
      required: true,
    },
    method: {
      type: String as PropType<Method>,
      default: 'get',
    },
    replace: {
      type: Boolean,
      default: false,
    },
    preserveScroll: {
      type: Boolean,
      default: false,
    },
    preserveState: {
      type: Boolean,
      default: null,
    },
    only: {
      type: Array<string>,
      default: () => [],
    },
    except: {
      type: Array<string>,
      default: () => [],
    },
    headers: {
      type: Object,
      default: () => ({}),
    },
    queryStringArrayFormat: {
      type: String as PropType<'brackets' | 'indices'>,
      default: 'brackets',
    },
    async: {
      type: Boolean,
      default: false,
    },
    prefetch: {
      type: [Boolean, String, Array] as PropType<boolean | LinkPrefetchOption | LinkPrefetchOption[]>,
      default: false,
    },
    cacheFor: {
      type: [Number, String, Array] as PropType<CacheForOption | CacheForOption[]>,
      default: 0,
    },
    onStart: {
      type: Function as PropType<(visit: PendingVisit) => void>,
      default: (_visit: PendingVisit) => {},
    },
    onProgress: {
      type: Function as PropType<(progress: Progress) => void>,
      default: () => {},
    },
    onFinish: {
      type: Function as PropType<(visit: PendingVisit) => void>,
      default: () => {},
    },
    onBefore: {
      type: Function as PropType<() => void>,
      default: () => {},
    },
    onCancel: {
      type: Function as PropType<() => void>,
      default: () => {},
    },
    onSuccess: {
      type: Function as PropType<() => void>,
      default: () => {},
    },
    onError: {
      type: Function as PropType<() => void>,
      default: () => {},
    },
    onCancelToken: {
      type: Function as PropType<(cancelToken: import('axios').CancelTokenSource) => void>,
      default: () => {},
    },
  },
  setup(props, { slots, attrs }) {
    const link = computed(() =>
      useLink(props.href, {
        method: props.method,
        data: props.data,
        headers: props.headers,
        preserveScroll: props.preserveScroll,
        preserveState: props.preserveState,
        replace: props.replace,
        only: props.only,
        except: props.except,
        queryStringArrayFormat: props.queryStringArrayFormat,
        async: props.async,
        prefetch: props.prefetch,
        cacheFor: props.cacheFor,
        onStart: props.onStart,
        onProgress: props.onProgress,
        onFinish: props.onFinish,
        onBefore: props.onBefore,
        onCancel: props.onCancel,
        onSuccess: props.onSuccess,
        onError: props.onError,
        onCancelToken: props.onCancelToken,
      }),
    )

    onMounted(() => link.value.onMounted())
    onUnmounted(() => link.value.onUnmounted())

    const method = computed(() => {
      const href = props.href
      return typeof href === 'object' ? href.method : (props.method.toLowerCase() as Method)
    })

    const tag = computed(() => (method.value !== 'get' ? 'button' : props.as.toLowerCase()))
    const elProps = computed(() => ({
      a: { href: link.value.href },
      button: { type: 'button' },
    }))

    return () => {
      return h(
        tag.value,
        {
          ...attrs,
          ...(elProps.value[tag.value] || {}),
          'data-loading': link.value.loading.value ? '' : undefined,
          ...link.value.events,
        },
        slots,
      )
    }
  },
})

export default Link
