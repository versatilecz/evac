import { ref } from 'vue'
import { defineStore } from 'pinia'
import { deepCopy } from '@/utils'
import { useMainStore } from './mainStore'


export const useEventStore = defineStore('event', () => {
  const mainStore = useMainStore()

  const data = ref({})
  const oldData = ref({})

  mainStore.on('events', (value) => {
    console.log(value)
    data.value = value
    oldData.value = deepCopy(value)
  })

  mainStore.on('event', (value) => {
    data.value[value.uuid] = value
    oldData.value[value.uuid] = deepCopy(value)
  })


  function reset() {
    console.log('Reset event store')
    data.value = deepCopy(oldData.value)
  }

  return {
    data,
    reset,
    print
  }
})