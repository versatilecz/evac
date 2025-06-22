import { ref } from 'vue'
import { defineStore } from 'pinia'
import { deepCopy } from '@/utils'
import { useMainStore } from './mainStore'


export const useDeviceStore = defineStore('device', () => {
  const mainStore = useMainStore()

  const data = ref({})
  const oldData = ref({})


  mainStore.on('DeviceList', (value) => {
     for(let location of value) {
      data.value[location.uuid] = location;
    }

    oldData.value = deepCopy(value)
    console.log(data.value)
  })

  mainStore.on('DeviceDetail', (value) => {
    data.value[value.uuid] = value
    oldData.value[value.uuid] = deepCopy(value)
  })

    mainStore.on('DeviceRemoved', (value) => {
    delete data.value[value]
    delete oldData[value]
  })

  function name(uuid) {
    data[uuid].name || "unknown"
  }

  function save(scanner) {
    mainStore.send("DeviceSet", scanner)
  }

  mainStore.on('DeviceDetail', (value) => {
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
    name,
    save
  }
})