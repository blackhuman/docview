import { Bus } from 'baconjs';
import { globalEntryBus, globalRandom, initBus } from './singleton';

export function notifyEntry(userId: string) {
  initBus(userId)
  const userBus = globalEntryBus.get(userId)!
  console.log('notifyEntry', userId, globalRandom)
  // userBus.push({i}})
}

export function getBus(userId: string) {
  initBus(userId)
  console.log('getEntryBus', userId, globalRandom)
  return globalEntryBus.get(userId)!
}