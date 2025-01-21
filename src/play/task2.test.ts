import { delay, range } from 'es-toolkit';
import { TaskRunner } from '../src/app/utils/task-runner';

const taskRunner = new TaskRunner(2)
range(0, 4).forEach((i) => {
  taskRunner.addTask(async (concurrencyIndex) => {
    await delay(1000)
    console.log('task', i, concurrencyIndex)
  })
})
console.log('start')
await taskRunner.run()
console.log('done')