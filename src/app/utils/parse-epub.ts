import { DOMParser } from '@xmldom/xmldom'
import fs from 'fs/promises'
import path from 'path'


// @ts-ignore
globalThis.DOMParser = DOMParser;
import EpubParser, { Section } from '@relba/epubparser';
import { Manifest } from '@/manifest';
import { minBy } from 'es-toolkit'

// outputPath中必须存在解压后的文件
export async function processEpub(epubPath: string, outputPath: string) {
  const parser = new EpubParser(epubPath, false);
  await parser.init(outputPath)
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
  }

  formatPrint('manifest', manifest)

  return manifest

}

function formatPrint(header: string, content: any) {
  console.log(`======= ${header} ====================`)
  console.log(content)
}