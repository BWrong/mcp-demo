<template>

  <div class="mcp-tool">
    <div>
      城市： <input v-model="data.city" placeholder="输入城市" />
    </div>
    <div>
      道路： <input v-model="data.name" placeholder="输入道路" />
    </div>
    <button @click="run">查询</button>


    <div>结果：{{ result }}</div>
  </div>

</template>

<script setup>

import { ref } from 'vue';

import { callMCPTool } from './mcp-client';



const data = ref({
  city: '',
  name: ''
});

const result = ref('');

const run = async () => {
  try {
    const result = await callMCPTool('get_traffic', data.value);
    result.value = result;
  } catch (error) {
    console.error('工具调用失败', error);
  }
};

</script>