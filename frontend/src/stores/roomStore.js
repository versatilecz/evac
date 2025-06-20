import { ref } from 'vue'
import { defineStore } from 'pinia'
import { deepCopy } from '@/utils'
import { useMainStore } from './mainStore'


export const useRoomStore = defineStore('room', () => {
  const mainStore = useMainStore()

  const data = ref({})
  const oldData = ref({})

  mainStore.on('RoomList', (value) => {
    console.log(value)
    data.value = value
    oldData.value = deepCopy(value)
  })

  mainStore.on('room', (value) => {
    data.value[value.uuid] = value
    oldData.value[value.uuid] = deepCopy(value)
  })


  function reset() {
    console.log('Reset rooms store')
    data.value = deepCopy(oldData.value)
  }

  return {
    data,
    reset,
    print
  }
})