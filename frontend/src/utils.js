export function deepCopy(value) {
  return JSON.parse(JSON.stringify(value));
}

export function sort(items, key) {
  return items.sort((first, second) => {
    if (first[key]?.localeCompare && second[key]?.localeCompare) {
      return first[key].localeCompare(second[key]);
    }

    if (first[key] < second[key]) return -1;

    if (first[key] > second[key]) return 1;
    return 0;
  });
}

export function throttle(fn, wait) {
  let throttled = false;
  return function (...args) {
    if (!throttled) {
      fn.apply(this, args);
      throttled = true;
      setTimeout(() => {
        throttled = false;
      }, wait);
    }
  };
}

export function debounce(fn, wait) {
  let timer;
  return function (...args) {
    if (timer) {
      clearTimeout(timer); // clear any pre-existing timer
    }
    const context = this; // get the current context
    timer = setTimeout(() => {
      fn.apply(context, args); // call the function if time expires
    }, wait);
  };
}

export function formatDate(
  dateString,
  dateStyle = "short",
  timeStyle = undefined,
) {
  if (!dateString) return "";

  const date = new Date(dateString);
  // Then specify how you want your dates to be formatted
  return new Intl.DateTimeFormat("default", { dateStyle, timeStyle }).format(
    date,
  );
}

/*
export function formatPrice(amount, currency='CZK') {
  return `${amount} ${currency}`
}
*/
export function formatPrice(price) {
  const currency = new Intl.NumberFormat("cs-CZ", {
    style: "currency",
    currency: "CZK",
  });
  return currency.format(price);
}

export function filter(items, itemFilter) {
  const value = itemFilter?.name
    ?.normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

  if (itemFilter.name) {
    items = items.filter((p) =>
      p.name
        ?.normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .includes(value),
    );
  }

  if (itemFilter.tags?.length > 0) {
    items = items.filter((p) =>
      p?.tags?.some((t) => itemFilter.tags.includes(t)),
    );
  }

  if (!itemFilter.hide) {
    items = items.filter((p) => p.hide === false);
  }

  return items;
}

export function parseTime(time) {
  if (time) {
    const parts = time.split(":");
    return {
      hours: parseInt(parts[0]),
      minutes: parseInt(parts[1]),
      seconds: parseInt(parts[2]),
    };
  } else {
    const now = new Date();
    return {
      hours: now.getHours(),
      minutes: now.getMinutes(),
      seconds: now.getSeconds(),
    };
  }
}

export function formatMac(array, reverse = false) {
  return (reverse ? [...array].reverse() : array)
    .map((n) => n.toString(16))
    .join(":");
}

export function openDate(date, hourOpen) {
  date = new Date(date);
  hourOpen = parseTime(hourOpen);

  if (
    date.getHours() <= hourOpen.hours ||
    (date.getHours() == hourOpen.hours && date.getMinutes() <= hourOpen.minutes)
  ) {
    date.setDate(date.getDate() - 1);
  }

  date.setHours(hourOpen.hours);
  date.setMinutes(hourOpen.minutes);
  return date;
}

export function closeDate(date, hourClose) {
  date = new Date(date);
  hourClose = parseTime(hourClose);

  if (
    date.getHours() >= hourClose.hours ||
    (date.getHours() == hourClose.hours &&
      date.getMinutes() >= hourClose.minutes)
  ) {
    date.setDate(date.getDate() + 1);
  }

  date.setHours(hourClose.hours);
  date.setMinutes(hourClose.minutes);
  return date;
}
