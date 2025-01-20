import { LocalCache } from './local-cache'
import { Bus } from 'baconjs'
import { SSEType } from './sse-type'
import { globalJobs, globalJobsBus, globalRandom } from './singleton'

export type JobStage = 'INIT' | 'PRE_PROCESSING' | 'PROCESSING' | 'POST_PROCESSING' | 'DONE'

export interface Job {
  entryId: string
  progress?: number
  stage: JobStage
}

export function updateJob(userId: string, job: Job) {
  initJob(userId)
  const userJobs = globalJobs.get(userId)!
  userJobs.set(job.entryId, job)
  const userBus = globalJobsBus.get(userId)
  console.log('updateJob', userId, globalRandom)
  userBus?.push(userJobs)
}

export function getJobs(userId: string) {
  initJob(userId)
  const userBus = globalJobsBus.get(userId)!
  console.log('getJobs', userId, globalRandom)
  return userBus
}

export function deleteJob(userId: string, entryId: string) {
  initJob(userId)
  globalJobs.get(userId)?.delete(entryId)
}

function initJob(userId: string) {
  if (!globalJobs.has(userId)) {
    console.log('initJob', userId, globalRandom)
    globalJobs.set(userId, new Map())
    globalJobsBus.set(userId, new Bus())
  }
}

export type SSEJob = SSEType<Map<string, Job>>