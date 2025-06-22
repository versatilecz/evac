import { ref } from 'vue'
import { defineStore } from 'pinia'
import { deepCopy } from '@/utils'
import { useMainStore } from './mainStore'


export const useScannerStore = defineStore('scanner', () => {
  const mainStore = useMainStore()

  const data = ref({})
  const oldData = ref({})

  mainStore.on('ScannerList', (value) => {
    for(let scanner of value) {
      data.value[scanner.uuid] = scanner;
    }

    oldData.value = deepCopy(value)
    console.log(data.value)
  })

  mainStore.on('ScannerDetail', (value) => {
    data.value[value.uuid] = value
    oldData.value[value.uuid] = deepCopy(value)
  })

  mainStore.on('ScannerRemoved', (value) => {
    delete data.value[value]
    delete oldData[value]
  })

  function save(scanner) {
    mainStore.send("ScannerSet", scanner)
  }

  function reset() {
    console.log('Reset scanner store')
    data.value = deepCopy(oldData.value)
  }

  function remove(uuid) {
    mainStore.send("ScannerRemove", uuid)
  }

  return {
    data,
    reset,
    remove,
    save
  }
})