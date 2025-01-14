import { LocalCache } from './local-cache'
import { Bus } from 'baconjs'
import { SSEType } from './sse-type'

export type JobStage = 'INIT' | 'PRE_PROCESSING' | 'PROCESSING' | 'POST_PROCESSING' | 'DONE'

export interface Job {
  entryId: string
  progress?: number
  stage: JobStage
}

const jobs = new Map<string, Job>()
const bus = new Bus<Map<string, Job>>()
const property = bus.toProperty(jobs)

export function updateJob(job: Job) {
  jobs.set(job.entryId, job)
  bus.push(jobs)
}

export function getJobs() {
  return bus
}

export type SSEJob = SSEType<Map<string, Job>>