import { defineStore } from 'pinia'
import { ref, reactive } from 'vue'

export const useEditorStore = defineStore('editor', () => {
  const themeMode = ref('auto')
  const appName = ref('Vue3 PhotoEditor')

  function toggleMode(noauto = false) {
    const root = document.getElementById('app')
    const sysmode = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
    const altmode = sysmode === 'dark' ? 'light' : 'dark'
    const currmode = themeMode.value

    if (currmode === 'auto') {
      root.classList.add(altmode)
      root.classList.remove(sysmode)
      themeMode.value = altmode
    } else if (currmode === altmode) {
      root.classList.add(sysmode)
      root.classList.remove(altmode)
      themeMode.value = sysmode
    } else if (!noauto && currmode === sysmode) {
      root.classList.remove(altmode)
      root.classList.remove(sysmode)
      themeMode.value = 'auto'
    } else if (noauto && currmode === sysmode) {
      root.classList.add(altmode)
      root.classList.remove(currmode)
      themeMode.value = altmode
    }
  }

  return { themeMode, appName, toggleMode }
})
