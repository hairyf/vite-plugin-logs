import path from 'node:path'
import fs from 'fs-extra'
import type { Plugin } from 'vite'
import type * as CSS from 'csstype'

export interface CSSProperties extends CSS.Properties<string | number>, CSS.PropertiesHyphen<string | number> {
  /**
   * The index signature was removed to enable closed typing for style
   * using CSSType. You're able to use type assertion or module augmentation
   * to add properties or an index signature of your own.
   *
   * For examples and more information, visit:
   * https://github.com/frenic/csstype#what-should-i-do-when-i-get-type-errors
   */
  [v: `--${string}`]: string | number | undefined
}

export interface Options {
  text: string
  style?: CSSProperties
}

// vite-plugin-logs
function logs(logs: Options[][] = []): Plugin {
  return {
    name: 'vite:project-logs',
    enforce: 'pre',
    transformIndexHtml(html) {
      const js = `<script>${generate(logs)}</script>`
      return html.replace(/<head>/i, `<head>\n${js}`)
    },
  }
}

function generate(logs: Options[][]) {
  const packageJSON = fs.readJSONSync(path.resolve('package.json'))
  const prints = logs.map((log) => {
    return {
      text: `%c ${log.map(log => replace(log.text)).join(' %c')}`,
      style: log.map(log => varcss(log.style)),
    }
  })

  function replace(text: string) {
    return text
      .replace('{_NAME_}', packageJSON.name)
      .replace('{_VERSION_}', packageJSON.version)
      .replace('{_TIME_}', new Date().toLocaleString())
  }

  return `${JSON.stringify(prints)}.forEach(log => console.log(log.text, ...log.style));`
}

function varcss(style: CSSProperties = {}) {
  return Object
    .entries(style)
    .map(([key, value]) => `${key}: ${value}`)
    .join(';')
}

const styles: Record<string, CSSProperties> = {
  darkblue: {
    'padding': '2px 1px',
    'color': '#fff',
    'border-radius': '3px 0 0 3px',
    'background': '#35495e',
  },
  blue: {
    'padding': '2px 1px',
    'color': '#fff',
    'border-radius': '0 3px 3px 0',
    'background': '#2a61c4',
  },
  gray: {
    'padding': '2px 1px',
    'color': '#fff',
    'border-radius': '0 3px 3px 0',
    'background': '#9f9f9f',
  },
  green: {
    'padding': '2px 1px',
    'color': '#fff',
    'border-radius': '0 3px 3px 0',
    'background': '#89bf04',
  },
}

interface PresetOptions {
  type: 'darkblue:gray' | 'darkblue:green' | 'darkblue:blue'
  label: string
  value: string
}

export function preset(options: PresetOptions[]) {
  const logs: Options[][] = []
  for (const option of options) {
    const [label, value] = option.type.split(':')
    logs.push(
      [
        { text: option.label, style: styles[label] },
        { text: option.value, style: styles[value] },
      ],
    )
  }
  return logs
}

export default logs
