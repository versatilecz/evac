import { ref } from 'vue'
import { defineStore } from 'pinia'
import { useMainStore } from './mainStore'


export const useEventStore = defineStore('event', () => {
  const mainStore = useMainStore()

  const data = ref({})

  mainStore.on('Event', (value) => {
    console.log(value)
    data.value[value.device] = value;
  })


  function reset() {
    data.value = {}
  }

  return {
    data,
    reset,

  }
})