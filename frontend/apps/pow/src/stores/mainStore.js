import { inject, watch, ref } from 'vue'
import { defineStore } from 'pinia'

export const useMainStore = defineStore('main', () => {
  const websocket = inject('$websocket')
  const register = {}
  const activeAlarm = ref(null)
  const backups = ref({})

  function on(tag, callback) {
    console.log('Register: ', tag)
    register[tag] = callback
  }

  function send(tag, content) {
    websocket.send(JSON.stringify({ [tag]: content }))
  }

  function alarm(device, scanner, location, room, uuid) {
    send('Alarm', {
      device,
      scanner,
      location,
      room,
      uuid
    })
  }

  on('BackupList', (value) => {
    for (let backup of value) {
      backups.value[backup] = backup
    }
  })

  on('Backup', (value) => {
    backups.value[value] = value
  })

  on('BackupRemove', (value) => {
    delete backups.value[value]
  })

  on('Alarm', (value) => {
    activeAlarm.value = value
  })

  on('AlarmStop', () => {
    console.log('Alarm dismissed')
    activeAlarm.value = null
  })

  watch(
    websocket.data,
    (val) => {
      const msg = JSON.parse(val)
      for (let tag in msg) {
        if (tag in register) {
          register[tag](msg[tag])
        }
      }
    },
    { lazy: true }
  )

  return {
    on,
    send,
    alarm,
    backups,
    activeAlarm,
  }
})
