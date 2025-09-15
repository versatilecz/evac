import { ref } from "vue";
import { defineStore } from "pinia";
import { useMainStore } from "./mainStore";

export const useEventStore = defineStore("event", () => {
  const mainStore = useMainStore();

  const data = ref({});

  mainStore.on("EventList", (eventList) => {
    for (let event of eventList) {
      data.value[event.uuid] = event;
    }
  });

  mainStore.on("Event", (event) => {
    data.value[event.uuid] = event;
  });

  mainStore.on("EventRemoved", (uuid) => {
    delete data.value[uuid];
  });

  function reset() {
    data.value = {};
  }

  return {
    data,
    reset,
  };
});
