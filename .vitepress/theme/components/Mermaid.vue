<template>
  <div class="mermaid-container" v-html="svgRef"></div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import mermaid from 'mermaid';

const props = defineProps<{
  id: string;
  code: string;
}>();

const svgRef = ref('');

const renderMermaid = async (id: string, code: string) => {
  mermaid.initialize({ startOnLoad: false });
  const { svg } = await mermaid.render(id, code);
  return svg;
};

onMounted(async () => {
  svgRef.value = await renderMermaid(props.id, decodeURIComponent(props.code));
});
</script>
