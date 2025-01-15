'use server'

import { Job, updateJob } from '../utils/job';
import { getUserId } from '../utils/supabase/server';

export async function updateJobAction(job: Job) {
  const userId = await getUserId()
  userId && updateJob(userId, job)
}