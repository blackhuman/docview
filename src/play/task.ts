export default async function limit(tasks: () => Array<Promise<any>>, concurrency: number) {
  const results: any[] = [];

  type PromiseProvider = () => Promise<string>;

  async function runTasks(tasksIterator: (() => Promise<string>)[]) {
    for (const [index, task] of tasksIterator.entries()) {
      try {
        results[index] = await task();
      } catch (error) {
        results[index] = new Error(`Failed with: ${error.message}`);
      }
    }
  }

  console.log('tasks.entries()', tasks[Symbol.iterator]())

  const workers = new Array(concurrency)
    .fill(tasks[Symbol.iterator]())
    .map(runTasks);

  await Promise.allSettled(workers);

  return results;
}

const tasks = [
  () => Promise.resolve('Task 1'),
  () => Promise.resolve('Task 2'),
  () => Promise.resolve('Task 3'),
  () => Promise.resolve('Task 4'),
]

for (const [index, task] of tasks.entries()) {
}

// const results = await limit(tasks, 3);
// console.log(results);