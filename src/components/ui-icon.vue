<template>
    <span class="ui-icon" v-bind="attrs">
        <component :is="IconComponent" aria-hidden="true" />
    </span>
</template>
<script setup lang="ts">
import { defineAsyncComponent, computed, useAttrs } from 'vue';

const props = defineProps<{
    name: string
}>()

const attrs = useAttrs()

const IconComponent = computed(() =>
    defineAsyncComponent(() =>
        import(`@/assets/${attrs.hasOwnProperty('svg') ? 'svg' : 'icons'}/${props.name}.svg`)
    )
)
</script>
<style>
.ui-icon>svg {
    width: 1em;
    height: 1em;
    fill: currentColor;
    display: inline-block;
    vertical-align: middle;
}
</style>