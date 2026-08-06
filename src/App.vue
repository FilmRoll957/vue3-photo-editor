<template>
  <Editor />
</template>

<script setup>
import { onMounted, onBeforeUnmount } from 'vue'
import Editor from './components/Editor.vue'

function syncRangeFill(el) {
  const min = parseFloat(el.min) || 0
  const max = parseFloat(el.max) || 100
  const val = parseFloat(el.value) || 0
  const pct = max !== min ? ((val - min) / (max - min)) * 100 : 50
  el.style.setProperty('--p', Math.min(100, Math.max(0, pct)).toFixed(2) + '%')
}

function onInput(e) {
  if (e.target && e.target.matches && e.target.matches('input[type="range"]')) syncRangeFill(e.target)
}

let observer

onMounted(() => {
  document.querySelectorAll('input[type="range"]').forEach(syncRangeFill)
  document.addEventListener('input', onInput, true)
  observer = new MutationObserver((mutations) => {
    for (const m of mutations) {
      for (const node of m.addedNodes) {
        if (node && node.nodeType === 1) {
          if (node.matches && node.matches('input[type="range"]')) syncRangeFill(node)
          if (node.querySelectorAll) node.querySelectorAll('input[type="range"]').forEach(syncRangeFill)
        }
      }
    }
  })
  observer.observe(document.body, { subtree: true, childList: true })
})

onBeforeUnmount(() => {
  document.removeEventListener('input', onInput, true)
  observer?.disconnect()
})
</script>
