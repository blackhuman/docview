
const localCache = new Map<string, any>()

export class LocalCache {
  constructor(
    private category: string
  ) { }

  set(key: string, value: any) {
    localCache.set(`${this.category}-${key}`, value)
    return value
  }

  get(key: string) {
    return localCache.get(`${this.category}-${key}`)
  }
}
