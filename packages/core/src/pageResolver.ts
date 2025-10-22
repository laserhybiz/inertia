export interface PageResolverOptions {
  /**
   * Transform function to extract the component from the module
   * @default (module) => module
   */
  patterns: (page: string) => string[]
  transform?: (module: any) => any
}

export default function createPageResolver<TPages extends Record<string, any>>(
  pages: TPages,
  options: PageResolverOptions,
) {
  const { patterns, transform = (module: any) => module } = options

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
