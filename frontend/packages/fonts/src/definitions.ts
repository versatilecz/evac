import { resolve } from 'node:path'

export type FontDefinition = {
  family: string
  styles: FontStyle[]
  publicPath: string
  src: string
}

export type FontStyle = {
  src: string
  style: 'normal' | 'italic' | 'oblique'
  weight: string
}

export const fonts: FontDefinition[] = [
  {
    family: 'Montserrat',
    styles: [
      {
        src: 'Montserrat-VariableFont_wght.ttf',
        style: 'normal',
        weight: '100 900',
      },
      {
        src: 'Montserrat-Italic-VariableFont_wght.ttf',
        style: 'italic',
        weight: '100 900',
      },
    ],
    publicPath: '/fonts/montserrat',
    src: resolve(import.meta.dirname, '../montserrat'),
  },
  {
    family: 'Fira Mono',
    styles: [
      {
        src: 'FiraMono-Regular.ttf',
        style: 'normal',
        weight: '400',
      },
      {
        src: 'FiraMono-Bold.ttf',
        style: 'normal',
        weight: '700',
      },
      {
        src: 'FiraMono-Medium.ttf',
        style: 'normal',
        weight: '500',
      },
    ],
    publicPath: '/fonts/fira-mono',
    src: resolve(import.meta.dirname, '../fira-mono'),
  },
]
