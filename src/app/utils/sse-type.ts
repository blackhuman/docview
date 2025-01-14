
export type SSEType<T> = {
  data: T,
  event: 'data'
} | {
  event: 'close'
}
