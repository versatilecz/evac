import { ref } from 'vue'
import { defineStore } from 'pinia'
import { useMainStore } from './mainStore'


export const usePositionStore = defineStore('position', () => {
  const mainStore = useMainStore()

  const data = ref([])

  mainStore.on('Positions', (value) => {
      data.value = value
    })

    return {
        data
    }
})