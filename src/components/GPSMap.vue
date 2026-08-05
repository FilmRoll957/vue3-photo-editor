<template>
  <div>
    <div id="map" style="height:180px;width:180px;color:black;border-radius:15px;margin:10px auto;"></div>
  </div>
</template>

<script setup>
import { onMounted, onUnmounted } from 'vue'

const props = defineProps({
  coord: { type: Array, required: true }
})

let map

onMounted(async () => {
  if (typeof maplibregl === 'undefined') return
  map = new maplibregl.Map({
    container: 'map',
    style: 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json',
    center: props.coord,
    zoom: 9
  })
  new maplibregl.Marker().setLngLat(props.coord).addTo(map)
})

onUnmounted(() => {
  map?.remove()
})
</script>
