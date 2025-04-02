import { Readability } from '@mozilla/readability'
import { JSDOM } from 'jsdom'
import * as fs from 'fs';
const html = fs.readFileSync('./data/article1.html', 'utf8');
const doc = new JSDOM(html);
const reader = new Readability(doc.window.document, {
  serializer: (rootNode: Node) => {
    const rootElement = rootNode as HTMLElement
    const document = rootElement.ownerDocument
    rootElement.querySelectorAll('img').forEach(img => img.remove());
    rootElement.querySelectorAll('hr').forEach(hr => hr.remove());
    rootElement.querySelectorAll('a').forEach(a => {
      const span = document.createElement('span');
      span.innerHTML = a.innerHTML;
      a.parentNode?.replaceChild(span, a);
    });
    return rootElement.innerHTML;
  }
});
const article = reader.parse()
const content = article?.content || ''

const fullHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${article?.title || 'Article'}</title>
    <style>
        .page {
            font-size: larger;
            width: 80%;
        }
    </style>

</head>
<body>
    ${content}
</body>
</html>
`;

fs.writeFileSync('./data/output.html', fullHtml, 'utf8');
