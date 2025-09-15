import { ref } from "vue";
import { defineStore } from "pinia";
import { deepCopy } from "@/utils";
import { useMainStore } from "./mainStore";
import { useRoomStore } from "./roomStore";
import { useLocationStore } from "./locationStore";

export const useScannerStore = defineStore("scanner", () => {
  const mainStore = useMainStore();
  const roomStore = useRoomStore();
  const locationStore = useLocationStore();

  const data = ref({});
  const oldData = ref({});

  mainStore.on("ScannerList", (value) => {
    for (let scanner of value) {
      data.value[scanner.uuid] = scanner;
    }

    oldData.value = deepCopy(value);
    console.log(data.value);
  });

  mainStore.on("ScannerDetail", (value) => {
    data.value[value.uuid] = value;
    oldData.value[value.uuid] = deepCopy(value);
  });

  mainStore.on("ScannerRemoved", (value) => {
    delete data.value[value];
    delete oldData[value];
  });

  function save(scanner) {
    mainStore.send("ScannerSet", scanner);
  }

  function reset() {
    console.log("Reset scanner store");
    data.value = deepCopy(oldData.value);
  }

  function remove(uuid) {
    mainStore.send("ScannerRemove", uuid);
  }

  function name(uuid) {
    const scanner = data.value[uuid];
    if (typeof scanner !== "undefined") {
      return scanner.name;
    }

    return undefined;
  }

  function room(uuid) {
    const scanner = data.value[uuid];
    if (typeof scanner !== "undefined") {
      const room = roomStore.data[scanner.room];
      if (typeof room !== "undefined") {
        return room.name;
      }
    }

    return undefined;
  }

  function location(uuid) {
    const scanner = data.value[uuid];
    if (typeof scanner !== "undefined") {
      const room = roomStore.data[scanner.room];
      if (typeof room !== "undefined") {
        const location = locationStore.data[room.location];
        if (typeof location !== "undefined") {
          return location.name;
        }
      }
    }

    return undefined;
  }

  return {
    data,
    reset,
    remove,
    save,
    name,
    room,
    location,
  };
});
