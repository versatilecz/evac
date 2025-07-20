import { ref } from 'vue'
import { defineStore } from 'pinia'
import { deepCopy } from '@/utils'
import { useMainStore } from './mainStore'
import { v4 as uuidv4 } from 'uuid';


export const useEmailStore = defineStore('email', () => {
  const mainStore = useMainStore()

  const data = ref({})
  const oldData = ref({})

  mainStore.on('EmailList', (value) => {
     for(let email of value) {
      data.value[email.uuid] = email;
    }

    oldData.value = deepCopy(value)
    console.log(data.value)
  })


  mainStore.on('EmailDetail', (value) => {
    data.value[value.uuid] = value
    oldData.value[value.uuid] = deepCopy(value)
  })

    mainStore.on('EmailRemoved', (value) => {
    delete data.value[value]
    delete oldData[value]
  })

  function save(scanner) {
    mainStore.send("EmailSet", scanner)
  }


  function create(name, subject, text, html) {
    save({
      uuid: uuidv4(),
      name,
      subject,
      text,
      html
    })
  }

  function reset() {
    data.value = deepCopy(oldData.value)
  }

  function remove(uuid) {
    mainStore.send("EmailRemove", uuid)
  }

  return {
    data,
    reset,
    create,
    remove,
    save
  }
})