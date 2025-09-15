import { ref } from "vue";
import { defineStore } from "pinia";
import { useMainStore } from "./mainStore";

export const useActivityStore = defineStore("activityStore", () => {
  const mainStore = useMainStore();

  let activityDiff = 1000;
  const data = ref({});

  mainStore.on("Activity", (activity) => {
    data.value[activity.device] = activity;
  });

  mainStore.on("ActivityList", (activityList) => {
    for (let activity of activityList) {
      data.value[activity.device] = activity;
    }

    console.log("ActivityList", data.value);
  });

  function clear() {
    const now = Date.now();

    for (let activity of Object.values(data.value).filter(
      (a) => now - Date.parse(a.timestamp) > activityDiff * 1000,
    )) {
      console.log("Clearing activity", now, Date.parse(activity.timestamp));
      delete data.value[activity.device];
    }

    return window.setTimeout(() => {
      clear();
    }, activityDiff * 1000);
  }

  let timeoutHandler = clear(activityDiff);

  function setActivityDiff(value) {
    window.clearTimeout(timeoutHandler);
    activityDiff = value;
    clear();
  }

  return {
    data,
    setActivityDiff,
  };
});
