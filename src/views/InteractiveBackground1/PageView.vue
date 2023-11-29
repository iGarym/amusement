<script lang="ts" setup>
/**
 * 灵感来源: https://www.prefect.io/
 */
import { ref } from 'vue'
import { useInteractiveBackground } from './utils'

const domRef = ref<HTMLElement>()

useInteractiveBackground({
  target: domRef,
  gap: 14,
  queueSize: 50
})
</script>

<template>
  <div ref="domRef" h-screen w-screen />
</template>
