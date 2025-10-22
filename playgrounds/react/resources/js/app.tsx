import { createInertiaApp } from '@inertiajs/react'
import { ComponentType } from 'react'

createInertiaApp({
  title: (title) => `${title} - React Playground`,
  pages: import.meta.glob<ComponentType>('./Pages/**/*.tsx', { eager: true }),
})
