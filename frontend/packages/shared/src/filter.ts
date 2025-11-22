type Filter<T> = (item: T, index: number, input: Iterable<T>) => boolean

export function unionFilters<T>(filters: Filter<T>[]): (input: Iterable<T>) => Generator<T>
export function unionFilters<T>(input: Iterable<T>, filters: Filter<T>[]): Generator<T>
export function unionFilters<T>(...args: [Filter<T>[]] | [Iterable<T>, Filter<T>[]]) {
  if (args.length === 1) {
    return (input: Iterable<T>) => filter('union', input, args[0])
  } else {
    return filter('union', args[0], args[1])
  }
}


export function intersectFilters<T>(filters: Filter<T>[]): (input: Iterable<T>) => Generator<T>
export function intersectFilters<T>(input: Iterable<T>, filters: Filter<T>[]): Generator<T>
export function intersectFilters<T>(...args: [Filter<T>[]] | [Iterable<T>, Filter<T>[]]) {
  if (args.length === 1) {
    return (input: Iterable<T>) => filter('intersection', input, args[0])
  } else {
    return filter('intersection', args[0], args[1])
  }
}

type FilterType = 'union' | 'intersection'


function* filter<T>(type: FilterType, input: Iterable<T>, filters: Filter<T>[]): Generator<T> {
  const method = type === 'union' ? 'some' : 'every'

  let i = 0
  for (const item of input) {
    if (filters[method]((filter) => filter(item, i++, input))) {
      yield item
    }
  }
}
