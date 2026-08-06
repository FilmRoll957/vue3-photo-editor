<template>
  <div class="section" :id="sectionname" :selected="sel === sectionname || undefined"
    :style="sel === sectionname && height > 0 ? { height: height + 'px' } : {}"
    @click.stop="onClick">
    <div class="section_header">
      <a v-if="!!onEnable" :id="'btn_skip_' + sectionname" class="section_skip" @click.stop="handleSkipSection"
        title="启用/禁用">&#9737;</a>
      <b class="section_label">{{ sectionLabels[sectionname] || sectionname }}</b>
      <a v-if="!!onReset" :id="'btn_reset_' + sectionname" class="reset_btn" :disabled="resetDisabled"
        @click.stop="resetSection" title="重置">&Oslash;</a>
    </div>

    <div v-if="sel === sectionname" :id="sectionname + '_content'" class="section_content" :class="{ skip: skipped }"
      @click.stop>
      <div class="section_scroll">
        <hr>
        <button class="close_btn" @click.stop="sel = ''">X</button>
        <slot></slot>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, inject } from 'vue'

// 区块标题中文映射
const sectionLabels = {
  composition: '构图',
  lights: '光影',
  colors: '色彩',
  effects: '效果',
  curve: '曲线',
  filters: '滤镜',
  blender: '混合',
  blur: '模糊',
  recipes: '配方',
  heal: '修复',
}

const sel = inject('sel')

const props = defineProps({
  sectionname: { type: String, required: true },
  height: { type: Number, default: 100 },
  params: { type: Object, default: () => ({}) },
  onEnable: { type: Function, default: null },
  onReset: { type: Function, default: null },
  resetDisabled: { type: Boolean, default: true }
})

const skipped = computed(() => {
  return !!props.params?.[props.sectionname]?.$skip
})

function onClick(e) {
  sel.value = props.sectionname
}

function handleSkipSection(e) {
  if (!props.params?.[props.sectionname]) return
  const sec = props.params[props.sectionname]
  sec.$skip = !sec.$skip
  if (props.onEnable) props.onEnable(!sec.$skip)
}

function resetSection() {
  if (props.params?.[props.sectionname]?.$skip) return
  if (props.onReset) props.onReset(props.sectionname)
}
</script>

<style scoped>
.section {
  background: light-dark(rgba(255, 255, 255, 0.52), rgba(27, 37, 64, 0.62));
  backdrop-filter: blur(10px) saturate(1.2);
  -webkit-backdrop-filter: blur(10px) saturate(1.2);
  border-radius: 12px;
  padding: 10px 12px;
  margin: 3px 0;
  font-size: 14px;
  height: 25px;
  transition: height .35s cubic-bezier(0.22, 1, 0.36, 1), background .2s, border-color .2s, box-shadow .2s, transform .15s;
  overflow: hidden;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  position: relative;
  cursor: pointer;
  border: 1px solid light-dark(rgba(30, 50, 90, 0.06), rgba(120, 160, 220, 0.1));
}

.section::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%) scaleY(0);
  width: 3px;
  height: 60%;
  border-radius: 0 2px 2px 0;
  background: var(--accent);
  transition: transform .25s cubic-bezier(0.22, 1, 0.36, 1);
}

.section:hover {
  background: light-dark(rgba(255, 255, 255, 0.68), rgba(35, 48, 82, 0.72));
  border-color: var(--accent-soft);
  box-shadow: 0 2px 12px var(--accent-soft);
  transform: translateX(1px);
}

.section[selected] {
  background: light-dark(rgba(247, 250, 253, 0.82), rgba(35, 48, 82, 0.78));
  border-color: var(--accent-soft);
  overflow: visible;
  height: auto;
  box-shadow: 0 6px 24px rgba(10, 20, 45, 0.1), 0 0 0 1px var(--accent-soft) inset;
}

.section[selected]::before {
  transform: translateY(-50%) scaleY(1);
}

.section[selected] .section_label {
  color: var(--accent-strong);
  font-weight: 600;
}

.section_header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.section_skip {
  width: 20px;
  color: var(--accent-strong);
  cursor: cell;
}

.section_label {
  flex: 1;
  text-align: left;
  color: light-dark(#6a7a92, rgba(255, 255, 255, 0.5));
  font-family: var(--font-body);
  font-weight: 500;
  font-size: 13px;
  letter-spacing: 0.3px;
}

.reset_btn {
  font-weight: bold;
  margin-left: 5px;
}

.reset_btn[disabled] {
  font-weight: normal;
}

.section_content {
  flex: 1;
  overflow: hidden;
}

.section_scroll {
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 2px;
  overflow-y: auto;
  overflow-x: hidden;
  min-width: 0;
}
.section_scroll :deep(> div) {
  flex-shrink: 0;
}

.close_btn {
  position: absolute;
  top: 7px;
  right: 25px;
  width: 40px;
  height: 20px;
  padding: 0;
  background: var(--accent-strong);
  display: none;
}

.section_content.skip {
  opacity: 0.2;
  pointer-events: none;
}
</style>
