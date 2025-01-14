import { LocalCache } from './local-cache'
import { Bus } from 'baconjs'
import { SSEType } from './sse-type'

export type JobStage = 'INIT' | 'PRE_PROCESSING' | 'PROCESSING' | 'POST_PROCESSING' | 'DONE'

export interface Job {
  entryId: string
  progress?: number
  stage: JobStage
}

const jobs = new Map<string, Map<string, Job>>()
const bus = new Map<string, Bus<Map<string, Job>>>()

export function updateJob(userId: string, job: Job) {
  initJob(userId)
  const userJobs = jobs.get(userId)!
  userJobs.set(job.entryId, job)
  bus.get(userId)?.push(userJobs)
}

export function getJobs(userId: string) {
  initJob(userId)
  return bus.get(userId)!
}

function initJob(userId: string) {
  if (!jobs.has(userId)) {
    jobs.set(userId, new Map())
    bus.set(userId, new Bus())
  }
}

export type SSEJob = SSEType<Map<string, Job>>