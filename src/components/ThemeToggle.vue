<template>
  <div>
    <a style="rotate:-90deg;" :title="currentMode" @click="toggleMode">{{ icon }}</a>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useEditorStore } from '../stores/editor.js'

const props = defineProps({
  noauto: { type: Boolean, default: false }
})

const store = useEditorStore()

const icons = {
  auto: '\u273B',
  dark: '\u263E',
  light: '\u273A'
}

const currentMode = computed(() => store.themeMode)
const icon = computed(() => icons[store.themeMode])

function toggleMode() {
  store.toggleMode(props.noauto)
}
</script>
