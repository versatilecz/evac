import { ref } from 'vue'
import { defineStore } from 'pinia'
import { deepCopy } from '@/utils'
import { useMainStore } from './mainStore'


export const useDeviceStore = defineStore('device', () => {
  const mainStore = useMainStore()

  const data = ref({})
  const oldData = ref({})

  mainStore.on('DeviceList', (value) => {
    console.log(value)
    data.value = value
    oldData.value = deepCopy(value)
  })

  mainStore.on('device', (value) => {
    data.value[value.uuid] = value
    oldData.value[value.uuid] = deepCopy(value)
  })


  function reset() {
    console.log('Reset device store')
    data.value = deepCopy(oldData.value)
  }

  return {
    data,
    reset,
    print
  }
})