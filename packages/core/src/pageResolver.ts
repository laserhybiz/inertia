export default function createPageResolver<TComponent>(
  pages: Record<string, TComponent | (() => Promise<TComponent>)>,
  resolver: (page: string) => string | string[],
): (name: string) => Promise<TComponent> {
  return (name: string) => {
    const resolved = resolver(name)

    for (const name of Array.isArray(resolved) ? resolved : [resolved]) {
      const page = pages[name]

      if (!page) {
        continue
      }

      if (typeof page !== 'function') {
        return Promise.resolve(page)
      }

      return (page as () => Promise<TComponent>)()
    }

    return Promise.reject(new Error(`Page component "${name}" not found.`))
  }
}
