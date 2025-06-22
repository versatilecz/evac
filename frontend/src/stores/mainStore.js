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
    websocket.send(JSON.stringify({ [tag]: content }))
  }

  watch(
    websocket.data,
    (val) => {
      const msg = JSON.parse(val)
      for(let tag in msg) {
        if(tag in register) {
          register[tag](msg[tag])
        }
      }
    },
    { lazy: true }
  )


  return {
    on,
    send
  }
})
