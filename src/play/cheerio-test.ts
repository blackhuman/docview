import * as cheerio from 'cheerio'

const file = Bun.file('src/play/output/Daisy Jones & the Six/titlepage.xhtml')
const $ = cheerio.load(await file.text())
console.log('$.html()', $.html())
Bun.write('src/play/output/output.html', $.html())