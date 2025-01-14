import { Bus } from 'baconjs';

const bus = new Map<string, Bus<void>>()

export function notifyEntry(userId: string) {
  initBus(userId)
  bus.get(userId)?.push()
}

export function getBus(userId: string) {
  initBus(userId)
  return bus.get(userId)!
}

function initBus(userId: string) {
  if (!bus.has(userId)) {
    bus.set(userId, new Bus())
  }
}