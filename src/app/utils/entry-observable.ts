import { Bus } from 'baconjs';
import { globalEntryBus, globalRandom } from './singleton';

export function notifyEntry(userId: string) {
  initBus(userId)
  const userBus = globalEntryBus.get(userId)!
  console.log('notifyEntry', userId, globalRandom)
  userBus.push()
}

export function getBus(userId: string) {
  initBus(userId)
  console.log('getEntryBus', userId, globalRandom)
  return globalEntryBus.get(userId)!
}

function initBus(userId: string) {
  if (!globalEntryBus.has(userId)) {
    globalEntryBus.set(userId, new Bus())
  }
}