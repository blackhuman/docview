import { getPrisma } from '@/app/utils/prisma'
import { CallbackUrl, createClient } from '@deepgram/sdk'
import { uploadBlobToRemote } from '@/app/utils/vercel/blob/server'

export async function processAudioFileForUser(userId: string, entryId: string) {
  const prisma = await getPrisma()
  const entry = await prisma.entry.findFirst({where: {id: entryId, authorId: userId}})
  if (!entry || entry.entryType !== 'AUDIO' || entry.originalFile === null) {
    throw new Error('Entry not found')
  }

  const remoteDirPath = entry.id
  const deepgramApiKey = process.env.DEEPGRAM_API_KEY
  if (!deepgramApiKey) {
    throw new Error('Deepgram API key not found')
  }
  const deepgram = createClient(deepgramApiKey)
  const { result, error } = await deepgram.listen.prerecorded.transcribeUrl(
    { url: entry.originalFile },
    {
      model: 'nova-2',
      language: 'en',
      smart_format: true,
    },
  )

  if (error) {
    console.log('processAudioFileForUser error', error)
    throw new Error()
  }

  console.log('processAudioFileForUser success.')

  await uploadBlobToRemote(
    JSON.stringify(result),
    remoteDirPath + '/manifest.json'
  )
}
