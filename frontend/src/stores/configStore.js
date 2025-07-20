import { ref } from 'vue'
import { defineStore } from 'pinia'
import { deepCopy } from '@/utils'
import { useMainStore } from './mainStore'
import { useActivityStore } from './activityStore'

export const useConfigStore = defineStore('config', () => {
  const mainStore = useMainStore()
  const activityStore = useActivityStore()

  const init = {
    base: {},
    setting: {}
  }
  const data = ref(init)
  const oldData = ref(init)

  mainStore.on('Config', (value) => {
    data.value = value
    oldData.value = deepCopy(value)
    activityStore.setActivityDiff(data.value.base.activityDiff)
  })

  function set() {
    mainStore.send('configSet', data.value)
  }

  return { mainStore, data, set }
})
