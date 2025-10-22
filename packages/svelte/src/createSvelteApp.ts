// export function createSvelteApp(el: HTMLElement | null, props: InertiaAppProps) {
//   if (!hydrate || !mount) {
//     return new App({ target: el!, props, hydrate: true })
//   }

//   if (el?.dataset.serverRendered === 'true') {
//     return hydrate(App, { target: el, props })
//   }

//   return mount(App, { target: el, props })
// }
