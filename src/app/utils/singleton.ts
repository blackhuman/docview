import { Bus } from 'baconjs'
import { Job } from './job'
import { v4 as uuidv4 } from 'uuid'
import { Entry, PrismaClient } from '@prisma/client';

// @ts-ignore
console.log('globalThis.globalJobs', globalThis.globalRandom)

declare const globalThis: {
  globalJobs: Map<string, Map<string, Job>>;
  globalJobsBus: Map<string, Bus<Map<string, Job>>>;
  globalEntryBus: Bus<any>;
  globalRandom: string;
  globalPrisma: PrismaClient
} & typeof global;

const globalJobs = globalThis.globalJobs ?? new Map<string, Map<string, Job>>()
const globalJobsBus = globalThis.globalJobsBus ?? new Map<string, Bus<Map<string, Job>>>()
const globalEntryBus = globalThis.globalEntryBus ?? new Bus<any>()
const globalRandom = globalThis.globalRandom ?? uuidv4()
const globalPrisma = globalThis.globalPrisma ?? new PrismaClient()

class Singleton {
  static globalEntryBus = new Bus<any>()
}

if (process.env.NODE_ENV !== 'production') {
  globalThis.globalJobs = globalJobs
  globalThis.globalJobsBus = globalJobsBus
  globalThis.globalEntryBus = globalEntryBus
  globalThis.globalRandom = globalRandom
  globalThis.globalPrisma = globalPrisma
}

export function initBus(userId: string) {
  if (!globalJobsBus.has(userId)) {
    globalJobsBus.set(userId, new Bus())
  }
  if (!globalJobs.has(userId)) {
    globalJobs.set(userId, new Map())
  }
}

export { globalJobs, globalJobsBus, globalEntryBus, Singleton, globalRandom, globalPrisma }