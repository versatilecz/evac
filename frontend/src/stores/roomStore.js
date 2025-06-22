import { ref } from 'vue'
import { defineStore } from 'pinia'
import { deepCopy } from '@/utils'
import { useMainStore } from './mainStore'
import { v4 as uuidv4 } from 'uuid';


export const useRoomStore = defineStore('room', () => {
  const mainStore = useMainStore()

  const data = ref({})
  const oldData = ref({})

  mainStore.on('RoomList', (value) => {
     for(let room of value) {
      data.value[room.uuid] = room;
    }

    oldData.value = deepCopy(value)
    console.log(data.value)
  })


  mainStore.on('RoomDetail', (value) => {
    data.value[value.uuid] = value
    oldData.value[value.uuid] = deepCopy(value)
  })

    mainStore.on('RoomRemoved', (value) => {
    delete data.value[value]
    delete oldData[value]
  })

  function save(scanner) {
    mainStore.send("RoomSet", scanner)
  }


  function create(name, location) {
    save({
      uuid: uuidv4(),
      name,
      location
    })
  }

  function reset() {
    console.log('Reset scanner store')
    data.value = deepCopy(oldData.value)
  }

  function remove(uuid) {
    mainStore.send("RoomRemove", uuid)
  }

  return {
    data,
    reset,
    create,
    remove,
    save
  }
})