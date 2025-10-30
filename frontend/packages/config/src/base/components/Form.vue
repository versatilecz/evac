<script setup lang="ts">
import { syncRef } from '@vueuse/core'
import { ref, toRef } from 'vue'
import { $BaseConfig } from '../definitions'

const props = defineProps<{ config: $BaseConfig }>()

const formData = ref<$BaseConfig | null>(null)
syncRef(toRef(props, 'config'), formData, { direction: 'ltr' })
const readonly = ref(true)
</script>

<template>
  <form v-if="formData" class="grid grid-cols-3 gap-4" @submit.prevent>
    <label class="label" for="config-configPath">
      <span class="label-text">Config path</span>
      <input id="config-configPath" v-model="formData.configPath" class="input w-full" :readonly="readonly" type="text" />
    </label>
    <label class="label" for="config-dataPath">
      <span class="label-text">Data path</span>
      <input id="config-dataPath" v-model="formData.dataPath" class="input w-full" :readonly="readonly" type="text" />
    </label>
    <label class="label" for="config-frontendPath">
      <span class="label-text">Frontend path</span>
      <input id="config-frontendPath" v-model="formData.frontendPath" class="input w-full" :readonly="readonly" type="text" />
    </label>

    <label class="label" for="config-portBroadcast">
      <span class="label-text">Port broadcast</span>
      <input id="config-portBroadcast" v-model="formData.portBroadcast" class="input w-full" :readonly="readonly" type="text" />
    </label>
    <label class="label" for="config-portScanner">
      <span class="label-text">Port scanner</span>
      <input id="config-portScanner" v-model="formData.portScanner" class="input w-full" :readonly="readonly" type="text" />
    </label>
    <label class="label" for="config-portWeb">
      <span class="label-text">Port web</span>
      <input id="config-portWeb" v-model="formData.portWeb" class="input w-full" :readonly="readonly" type="text" />
    </label>

    <label class="label" for="config-activityDiff">
      <span class="label-text">Activity Diff</span>
      <input id="config-activityDiff" v-model="formData.activityDiff" class="input w-full" :readonly="readonly" type="text" />
    </label>
    <label class="label" for="config-querySize">
      <span class="label-text">Query size</span>
      <input id="config-querySize" v-model="formData.querySize" class="input w-full" :readonly="readonly" type="text" />
    </label>
    <label class="label" for="config-routine">
      <span class="label-text">Routine</span>
      <input id="config-routine" v-model="formData.routine" class="input w-full" :readonly="readonly" type="text" />
    </label>
    <label class="label" for="config-salt">
      <span class="label-text">Salt</span>
      <input id="config-salt" v-model="formData.salt" class="input w-full" :readonly="readonly" type="text" />
    </label>
  </form>
</template>
