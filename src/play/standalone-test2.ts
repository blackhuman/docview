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

/*
{
  title: "Daisy Jones & the Six: A Novel",
  publisher: "Random House Publishing Group",
  language: "en",
  author: "\"Taylor Jenkins Reid\"",
  bookName: "Daisy Jones & the Six_ A Novel - Taylor Jenkins Reid",
}
  */

async function processEpub({epubPath, outputPath}: {epubPath: string, outputPath: string}) {
  const parser = new EpubParser(epubPath, false);
  await parser.init()
  formatPrint('parser.meta', parser.meta)
  formatPrint('parser.toc', parser.toc.map(v => v.name))
  // formatPrint('parser.toc child', parser.toc.map(v => v.subItems))
  formatPrint('parser.sections', parser.sections.map(v => ({
    name: v.name, 
    url: v.url, 
    urlPath: v.urlPath,
    urlHref: v.urlHref,
    html: ''
  })))
  // formatPrint('parser.chapters names', parser.chapters.map(v => v.name))
  // formatPrint('parser.ncxFilePath', parser.ncxFilePath)
  // formatPrint('parser.opfFilePath', parser.opfFilePath)
  formatPrint('parser.tmpPath', parser.tmpPath)

  function getSectionIndex(section: Section) {
    return parser.sections.findIndex(v => v.url === section.url)
  }

  function getOutputRelativePath(url: string) {
    return path.relative(parser.tmpPath, url)
  }

  // process.chdir(outputPath)
  const manifest = new Manifest()
  // @ts-ignore
  manifest.meta = parser.meta
  manifest.cover = getOutputRelativePath(parser.coverPath)
  manifest.spineFiles = parser.sections.map(v => getOutputRelativePath(v.url))

  for (const [xml, chapter] of parser.toc.entries()) {
    const indices = chapter.sections.map(v => getSectionIndex(v))
    const minIndex = minBy(indices, v => v)!
    const maxIndex = Math.max(...indices)
    manifest.toc.push({
      name: chapter.name,
      index: minIndex,
      indexRange: [minIndex, maxIndex]
    })
    // if (chapter.name === 'Contents') {
    //   formatPrint('section count', chapter.sections.length)
    //   const html = chapter.sections.map(v => v.html).join('\n')
    //   console.log(html)
    // }
  }

  formatPrint('manifest', manifest)

  outputPath = path.resolve(outputPath, manifest.meta!.title)
  await fs.rm(outputPath, {recursive: true, force: true})
  await fs.mkdir(outputPath, {recursive: true})

  // for (const file of manifest.spineFiles) {
  //   const source = path.resolve(parser.tmpPath, file)
  //   const target = path.resolve(outputPath, file)
  //   // console.log('target', target, path.dirname(target))
  //   await fs.mkdir(path.dirname(target), {recursive: true})
  //   await fs.copyFile(source, target)
  // }

  const zip = new AdmZip(epubPath);
  zip.extractAllTo(outputPath, true);

  await fs.writeFile(
    path.resolve(outputPath, 'manifest.json'),
    JSON.stringify(manifest, null, 2)
  )

}

function formatPrint(header: string, content: any) {
  console.log(`======= ${header} ====================`)
  console.log(content)
}

processEpub({
  epubPath: '/Users/august/Documents/Calibre Library/Taylor Jenkins Reid/Daisy Jones & the Six_ A Novel (121)/Daisy Jones & the Six_ A Novel - Taylor Jenkins Reid.epub',
  outputPath: './src/play/output'
})