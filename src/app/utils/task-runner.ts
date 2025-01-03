import { range } from 'es-toolkit';

export class TaskRunner {
  constructor(
    private concurrency: number = 1,
    private tasks: ((concurrencyIndex: number) => Promise<any>)[] = [],
  ) { }

  addTask(task: (concurrencyIndex: number) => Promise<any>) {
    this.tasks.push(task);
  }

  async processNextTask(concurrencyIndex: number): Promise<void> {
    const task = this.tasks.shift()
    if (!task) return
    await task(concurrencyIndex)
    return this.processNextTask(concurrencyIndex)
  }

  async run() {
    const processingTasks = range(0, this.concurrency).map((i) => {
      return this.processNextTask(i)
    })
    await Promise.all(processingTasks)
  }
}