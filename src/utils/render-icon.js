import { h } from 'vue'
import { NIcon } from 'naive-ui'

export function renderIcon(icon, props = {}) {
  return () => h(NIcon, null, { default: () => h(icon, props) })
}
