type Filter<T> = (item: T, index: number, input: Iterable<T>) => boolean

export function applyFilters<T>(filters: Filter<T>[]): (input: Iterable<T>) => Generator<T>
export function applyFilters<T>(input: Iterable<T>, filters: Filter<T>[]): Generator<T>
export function applyFilters<T>(...args: [Filter<T>[]] | [Iterable<T>, Filter<T>[]]) {
  if (args.length === 1) {
    return (input: Iterable<T>) => filter(input, args[0])
  } else {
    return filter(args[0], args[1])
  }

  function* filter(input: Iterable<T>, filters: Filter<T>[]): Generator<T> {
    let i = 0
    for (const item of input) {
      if (filters.every((filter) => filter(item, i++, input))) {
        yield item
      }
    }
  }
}
