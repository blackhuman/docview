import { Bus } from 'baconjs';
import { globalEntryBus, globalRandom, initBus } from './singleton';

export function notifyEntry(userId: string) {
  initBus(userId)
  console.log('notifyEntry', userId, globalRandom)
  // userBus.push({i}})
}

export function getBus(userId: string) {
  initBus(userId)
  console.log('getEntryBus', userId, globalRandom)
  return globalEntryBus.filter(v => v.db === 'entry' && v.data.authorId === userId)
}