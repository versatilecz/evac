import { ref } from 'vue'
import { defineStore } from 'pinia'
import { deepCopy } from '@/utils'
import { useMainStore } from './mainStore'
import { v4 as uuidv4 } from 'uuid'

export const useAlarmStore = defineStore('alarm', () => {
  const mainStore = useMainStore()

  const data = ref({})
  const oldData = ref({})

  mainStore.on('AlarmList', (value) => {
    for (let alarm of value) {
      data.value[alarm.uuid] = alarm
    }

    oldData.value = deepCopy(value)
    console.log(data.value)
  })

  mainStore.on('AlarmDetail', (value) => {
    data.value[value.uuid] = value
    oldData.value[value.uuid] = deepCopy(value)
  })

  mainStore.on('AlarmRemoved', (value) => {
    delete data.value[value]
    delete oldData[value]
  })

  function save(scanner) {
    mainStore.send('AlarmSet', scanner)
  }

  function create(name, email, buzzer, led) {
    save({
      uuid: uuidv4(),
      name,
      email,
      buzzer,
      led,
    })
  }

  function reset() {
    data.value = deepCopy(oldData.value)
  }

  function remove(uuid) {
    mainStore.send('AlarmRemove', uuid)
  }

  return {
    data,
    reset,
    create,
    remove,
    save,
  }
})
