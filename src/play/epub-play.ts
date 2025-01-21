import { DOMParser } from '@xmldom/xmldom'
import fs from 'fs/promises'
import path from 'path'
import { mkdir } from "node:fs/promises"
import process from 'process'
import AdmZip from 'adm-zip';


// @ts-ignore
globalThis.DOMParser = DOMParser;
import EpubParser, { Section } from '@relba/epubparser';
import { Manifest } from '@/manifest';
import { minBy } from 'es-toolkit'
import { processEpub } from '@/app/utils/parse-epub'

/*
{
  title: "Daisy Jones & the Six: A Novel",
  publisher: "Random House Publishing Group",
  language: "en",
  author: "\"Taylor Jenkins Reid\"",
  bookName: "Daisy Jones & the Six_ A Novel - Taylor Jenkins Reid",
}
  */

function formatPrint(header: string, content: any) {
  console.log(`======= ${header} ====================`)
  console.log(content)
}

const epubPath = '/Users/august/Documents/Calibre Library/Taylor Jenkins Reid/Daisy Jones & the Six_ A Novel (121)/Daisy Jones & the Six_ A Novel - Taylor Jenkins Reid.epub'
const outputPath = './src/play/output'

const glob = new Bun.Glob(outputPath + '/*')
for await (const file of glob.scan(".")) {
  console.log(file); // => "index.ts"
  // @ts-ignore
  await Bun.file(file).remove()
}

const zip = new AdmZip(epubPath);
zip.extractAllTo(outputPath, true);

await processEpub(epubPath, outputPath)