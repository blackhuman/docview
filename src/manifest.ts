export class Manifest {
  meta?: {
    title: string,
    publisher: string,
    language: string,
    author: string,
  }
  cover?: string
  spineFiles: string[] = []
  toc: {
    name: string,
    index: number,
    indexRange: [number, number]
  }[] = []
}