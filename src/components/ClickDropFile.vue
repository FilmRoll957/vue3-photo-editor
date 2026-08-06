<template>
  <button
    @click="handleClick"
    @drop="dropHandler"
    @dragover="dragOverHandler"
    @dragleave="dragLeaveHandler"
    v-html="text"
  />
</template>

<script setup>
import { openFile } from '../js/tools.js'

const props = defineProps({
  text: { type: String, default: 'click or drop file' },
  accept: { type: String, default: 'image/*' },
})

const emit = defineEmits(['file'])

async function handleClick() {
  try {
    const file = await openFile(props.accept)
    if (!file) return
    emit('file', file)
  } catch (e) { console.error(e) }
}

function dropHandler(ev) {
  ev.preventDefault()
  ev.target.style.borderColor = ''
  let file
  if (ev.dataTransfer.items) {
    const item = ev.dataTransfer.items[0]
    file = item.getAsFile()
  } else {
    file = ev.dataTransfer.files[0]
  }
  emit('file', file)
}

function dragOverHandler(ev) {
  ev.preventDefault()
  ev.target.style.borderColor = 'var(--accent)'
}

function dragLeaveHandler(ev) {
  ev.preventDefault()
  ev.target.style.borderColor = ''
}
</script>
