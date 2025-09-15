import { ref } from "vue";
import { v4 as uuidv4 } from "uuid";
import { defineStore } from "pinia";
import { deepCopy } from "@/utils";
import { useMainStore } from "./mainStore";

export const useLocationStore = defineStore("location", () => {
  const mainStore = useMainStore();

  const data = ref({});
  const oldData = ref({});

  mainStore.on("LocationList", (value) => {
    for (let location of value) {
      data.value[location.uuid] = location;
    }

    oldData.value = deepCopy(value);
    console.log(data.value);
  });

  mainStore.on("LocationDetail", (value) => {
    data.value[value.uuid] = value;
    oldData.value[value.uuid] = deepCopy(value);
  });

  mainStore.on("LocationRemoved", (value) => {
    delete data.value[value];
    delete oldData[value];
  });

  function create(name) {
    mainStore.send("LocationSet", {
      uuid: uuidv4(),
      name,
    });
  }

  function save(scanner) {
    mainStore.send("LocationSet", scanner);
  }

  function reset() {
    console.log("Reset scanner store");
    data.value = deepCopy(oldData.value);
  }

  function remove(uuid) {
    mainStore.send("LocationRemove", uuid);
  }

  return {
    data,
    reset,
    create,
    save,
    remove,
  };
});
