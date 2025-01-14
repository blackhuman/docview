export function asyncRun<T>(fn: () => Promise<T>) {
  try {
    fn()
  } catch (e) {
    console.error(e)
  }
}