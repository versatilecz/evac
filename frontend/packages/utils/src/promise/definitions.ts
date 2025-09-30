// Utility type to extract the resolved type of a Promise
export type ResolvedPromise<T> = T extends Promise<infer U> ? U : T
