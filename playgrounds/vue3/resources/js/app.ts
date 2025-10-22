import { createInertiaApp } from '@inertiajs/vue3'
import { DefineComponent } from 'vue'

createInertiaApp({
  title: (title) => `${title} - Vue 3 Playground`,
  pages: import.meta.glob<DefineComponent>('./Pages/**/*.vue'),
})
