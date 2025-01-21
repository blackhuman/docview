import { Entry, PrismaClient } from '@prisma/client';
import { globalPrisma } from '@/app/utils/singleton';

const prisma = globalPrisma

const result = await prisma.entry.create({
  data: {
    title: 'test',
    authorId: 'dc9c7e0c-34be-4759-9009-121d574ee71d',
    entryType: 'epub',
    originalFile: 'test',
    processed: false
  },
  select: {
    id: true
  }
})

console.log('result', result)
