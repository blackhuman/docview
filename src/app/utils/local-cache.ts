
const localCache = new Map<string, any>()

export function setLocalCache(key: string, value: any) {
  localCache.set(key, value)
}

export function getLocalCache(key: string) {
  return localCache.get(key)
}

export class LocalCache {
  constructor(
    private category: string
  ) { }

  set(key: string, value: any) {
    setLocalCache(`${this.category}-${key}`, value)
    return value
  }

  get(key: string) {
    return getLocalCache(`${this.category}-${key}`)
  }
}
