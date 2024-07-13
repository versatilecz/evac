import { inject, watch } from 'vue'
import { defineStore } from 'pinia'

export const useMainStore = defineStore('main', () => {
  const websocket = inject('$websocket')
  const register = {}

  function on(tag, callback) {
    console.log('Register: ', tag)
    register[tag] = callback
  }

  function send(tag, content) {
    websocket.send(JSON.stringify({ tag, content }))
  }

  watch(
    websocket.data,
    (val) => {
      const msg = JSON.parse(val)
      if (msg.tag in register) {
        register[msg.tag](msg.content)
      }
    },
    { lazy: true }
  )


  return {
    on,
    send
  }
})
