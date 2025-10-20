import { isAsyncIterable, type AsyncIter } from './definitions'

export async function* mergeAsyncIterables<T>(...iters: AsyncIter<T>[]): AsyncGenerator<T> {
  const iterators = iters.map<AsyncIterator<T>>((iter) => (isAsyncIterable(iter) ? iter[Symbol.asyncIterator]() : iter))
  const promises = new Map(iterators.map((iterator) => [iterator, next(iterator)]))

  try {
    while (promises.size > 0) {
      const reply = await Promise.race(promises.values())

      if (reply.length === 3) {
        const [, iterator, err] = reply
        // Since this iterator threw, it's already ended, so we remove it.
        promises.delete(iterator)
        throw err
      }

      const [res, iterator] = reply

      if (res.done) {
        promises.delete(iterator)
      } else {
        // Prevent memory leak in case the consumer of the merged iterator
        // doesn't call .next() anymore. We remove the reference to the value
        // in the next tick, so if nobody consumes it, it can be garbage
        // collected.
        setTimeout(() => {
          ;(res as { value: null }).value = null
        })

        // Return the value to the consumer. In the next tick, it will be
        // removed from here, so even if nobody calls .next() on the merged
        // iterator anymore, the value will be garbage collected.
        yield res.value

        // Iterators starvation prevention. Imagine you merge two iterators, and
        // iterator1 always yields something, whilst iterator2 yields rarely. If
        // we don't delete and then re-add the Promise in the end, then
        // Promise.race() would have always returned values from iterator1 and
        // never from iterator2. With deletion and re-adding to the end, we tell
        // Promise.race() to give a fair chance to all iterators.
        promises.delete(iterator)

        // After we're back from yield (aka someone called .next() on the merged
        // iterator again), schedule the next value fetching from the same
        // iterator and re-add the Promise to the END of the set, subject for
        // Promise.race() fair pickup.
        promises.set(iterator, next(iterator))
      }
    }
  } finally {
    // Cleanup: if we're exiting the merged iterator, we need to close all
    // inner iterators. We don't care about their results/errors, so we just
    // call return() on them.
    // Note: we don't care about starvation here, since we're closing all of
    // them anyway.
    // Note: we call return() on all iterators, even those that already ended,
    // because calling return() on an already-ended iterator is a no-op.
    promises.forEach((_, iterator) => void iterator.return?.())
  }
}

async function next<T>(iterator: AsyncIterator<T>) {
  return iterator
    .next()
    .then((res) => [res, iterator] as const)
    .catch((err: Error) => [undefined, iterator, err] as const)
}
