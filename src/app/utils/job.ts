import { LocalCache, setLocalCache } from './local-cache'

export type JobStage = 'INIT' | 'PRE_PROCESSING' | 'PROCESSING' | 'POST_PROCESSING' | 'DONE'

export interface Job {
  entryId: string
  progress: number
  stage: JobStage
}

const jobLocalCache = new LocalCache('job')

export function createJob(entryId: string) {
  return jobLocalCache.set(entryId, {
    entryId,
    progress: 0,
    stage: 'INIT',
  })
}

export function updateJob(entryId: string, job: Job) {
  return jobLocalCache.set(entryId, job)
}

export function getJob(entryId: string) {
  return jobLocalCache.get(entryId)
}