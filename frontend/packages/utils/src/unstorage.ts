import { BehaviorSubject, Subscription } from "rxjs";
import type { Storage, StorageValue } from "unstorage";

/**
 * Synchronize an Unstorage key with a BehaviorSubject.
 */
export async function syncStorageWithSubject<T>(storage: Storage<StorageValue>, key: string, subject: BehaviorSubject<T>): Promise<Subscription> {
  // Initialize BehaviorSubject from storage
  const stored = await storage.getItem<T>(key);
  if (stored !== null && stored !== undefined) {
    subject.next(stored);
  } else {
    // ensure storage initialized to subject’s initial value
    await storage.setItem(key, subject.value as StorageValue);
  }

  // When BehaviorSubject changes, write to storage
  const sub = subject.subscribe(async (value) => {
    await storage.setItem(key, value as StorageValue);
  });

  // Return subscription for cleanup
  return sub;
}
