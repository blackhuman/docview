"use client";
import { MutableRefObject, useEffect, useRef } from 'react';
import PSPDFKit, { Instance, ToolbarItem } from 'pspdfkit'
import { useParams, useRouter } from 'next/navigation';

type Params = {
  id: string
}

async function loadPDF(fileName: string, container: HTMLDivElement, pdfInstanceRef: MutableRefObject<Instance | null>): Promise<Instance> {
  const rootDir = await navigator.storage.getDirectory()
  const fileHandle = await rootDir.getFileHandle(fileName, { create: false })
  const file = await fileHandle.getFile()
  const content = await file.arrayBuffer()

  // load PDF
  const enablesItems = new Set<string>(['pager', 'zoom-mode', 'search'])
  const toolbarItems = PSPDFKit.defaultToolbarItems.filter((item) => enablesItems.has(item.type))
  const unloadResult = PSPDFKit.unload(container)
  console.log('unloadResult before PDFView loading', unloadResult)
  console.log('PDFView loading')
  const pdfInstance = await PSPDFKit.load({
    container,
    document: content,
    baseUrl: `${window.location.protocol}//${window.location.host}/`,
    licenseKey: 'jgQ8JoOsV19biuvHtDFnJYxq6qLkJMbweGK2-i3ITRo5_oolYMPuQ0TcAQ9WFgmuoqi3iOC69SRf14qPBd_jDDsS51-EOfTD-2p5MB2ihHBpjr8y3KTcAwzBhgR3P60nFNsobnzGlwi8ejUsKEEylpWbCq_n1mGoYyq5iXH6qmhKWiUuihFWB1cJZXBkYnE6qC2a7vcSbRyhXg',
    inlineTextSelectionToolbarItems: () => [],
    toolbarItems,
  })
  pdfInstanceRef.current = pdfInstance
  console.log('PDFView loaded')

  // subscribe selection chage
  pdfInstance.addEventListener("textSelection.change", async textSelection => {
    if (!textSelection) return
    const text = await textSelection.getText()
    const lines = await textSelection.getSelectedTextLines()
    const firstLineId = lines.get(0)!.id!
    const pageLines = await pdfInstance.textLinesForPageIndex(textSelection.startPageIndex)
    pageLines.filter(line => line.id === firstLineId)
  });
  return pdfInstance
}

const PDFViewer: React.FC = () => {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const pdfInstanceRef = useRef<Instance | null>(null)
  const {id: fileName} = useParams<Params>()
  const router = useRouter()

  useEffect(() => {
    console.log('PDFView init, fileName:', fileName)
    const container = containerRef.current;
    
    if (container !== null && pdfInstanceRef.current === null) {
      loadPDF(fileName, container, pdfInstanceRef).then(instance => {
        const item: ToolbarItem = {
          type: "custom",
          id: "home",
          title: "Home",
          onPress: () => {
            router.push('/')
          }
        };
        instance.setToolbarItems(items => [item, ...items])
      })
    }
    return () => {
      const unloadResult = PSPDFKit.unload(container)
      console.log('PDFView unload', unloadResult)
    }
  }, [fileName, router]);

  return <div id={fileName} ref={containerRef} className='h-full w-full'/>;
};

export default PDFViewer;