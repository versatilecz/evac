import { ref } from 'vue'
import { defineStore } from 'pinia'
import { deepCopy } from '@/utils'
import { useMainStore } from './mainStore'

export const useDataStore = defineStore('data', () => {
  const mainStore = useMainStore()

  const init = {
    scanners: {},
    devices: {},
    rooms: {},
    locations: {},
  }
  const data = ref(init)
  const oldData = ref(init)

  mainStore.on('Data', (value) => {
    data.value = value
    oldData.value = deepCopy(value)
  })

  function set() {
    mainStore.send('dataSet', data.value)
  }

  return { mainStore, data, set }
})
