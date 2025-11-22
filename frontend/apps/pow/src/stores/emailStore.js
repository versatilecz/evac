import { ref } from 'vue'
import { defineStore } from 'pinia'
import { deepCopy } from '@/utils'
import { useMainStore } from './mainStore'
import { v4 as uuidv4 } from 'uuid'

export const useEmailStore = defineStore('email', () => {
  const mainStore = useMainStore()

  const data = ref({})
  const oldData = ref({})

  mainStore.on('NotificationList', (value) => {
    for (let email of value) {
      data.value[email.uuid] = email
    }

    oldData.value = deepCopy(value)
    console.log(data.value)
  })

  mainStore.on('NotificationDetail', (value) => {
    data.value[value.uuid] = value
    oldData.value[value.uuid] = deepCopy(value)
  })

  mainStore.on('NotificationRemoved', (value) => {
    delete data.value[value]
    delete oldData[value]
  })

  function save(scanner) {
    mainStore.send('NotificationSet', scanner)
  }

  function create(name, subject, short, long) {
    save({
      uuid: uuidv4(),
      name,
      subject,
      short,
      long,
    })
  }

  function reset() {
    data.value = deepCopy(oldData.value)
  }

  function remove(uuid) {
    mainStore.send('NotificationRemove', uuid)
  }

  return {
    data,
    reset,
    create,
    remove,
    save,
  }
})
