import { ref } from 'vue'
import { defineStore } from 'pinia'
import { deepCopy } from '@/utils'
import { useMainStore } from './mainStore'

export const useConfigStore = defineStore('config', () => {
  const mainStore = useMainStore()

  const init = {
    base: {},
    setting: {}
  }
  const data = ref(init)
  const oldData = ref(init)

  mainStore.on('Config', (value) => {
    data.value = value
    oldData.value = deepCopy(value)
  })

  function set() {
    mainStore.send('configSet', data.value)
  }

  return { mainStore, data, set }
})
