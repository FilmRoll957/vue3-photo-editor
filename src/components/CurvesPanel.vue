<template>
  <Section
    sectionname="curve"
    :height="200"
    :params="params"
    :onEnable="() => onUpdate?.()"
    :onReset="() => resetCurve()"
    :resetDisabled="!hasCurves"
  >
    <div class="cc_container">
      <ColorCurve :curve="curve" @update="setCurve" />
    </div>
  </Section>
</template>

<script setup>
import { ref, inject } from 'vue'
import Section from './Section.vue'
import ColorCurve from './ColorCurve.vue'

const sel = inject('sel')

const props = defineProps({
  params: { type: Object, required: true },
  onUpdate: { type: Function, required: true },
})

const curve = ref({
  space: 0,
  numpoints: 5,
  curvepoints: props.params.curve?.curvepoints || null,
  modifiedflag: null,
  resetFn: null,
})

const hasCurves = ref(false)

function setCurve(_curvepoints, _curvemodified) {
  curve.value.curvepoints = _curvemodified.map((e, i) => e && _curvepoints[i])
  if (curve.value.curvepoints.reduce((p, v) => p += v, 0) === 0) {
    props.params.curve.curvepoints = 0
    hasCurves.value = false
  } else {
    props.params.curve.curvepoints = curve.value.curvepoints
    hasCurves.value = true
  }
  props.onUpdate()
}

function resetCurve() {
  if (curve.value.resetFn) curve.value.resetFn()
  hasCurves.value = false
}
</script>
