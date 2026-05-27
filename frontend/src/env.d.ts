/// <reference types="vite/client" />
/// <reference types="vue/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue'

  const component: DefineComponent<object, object, unknown>
  export default component
}

declare namespace JSX {
  interface IntrinsicElements {
    [name: string]: unknown
  }
}

declare const __ROUTER_BASENAME__: string

declare module 'leaflet'
