<template>
  <div><a @click="toggleFullScreen">&#x26F6;</a></div>
</template>

<script setup>
import isMobile from 'ismobilejs'

const iphone = isMobile(window.navigator).apple.phone

async function toggleFullScreen() {
  if (iphone) return
  if (!document.fullscreenElement) {
    await document.documentElement.requestFullscreen()
  } else if (document.exitFullscreen) {
    await document.exitFullscreen()
  }
}
</script>
