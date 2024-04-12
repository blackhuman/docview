"use client";
import { useEffect, useRef } from 'react';
import PSPDFKit from 'pspdfkit'

const PdfViewerComponent: React.FC = () => {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const container = containerRef.current;

    if (container && typeof window !== 'undefined') {
      PSPDFKit.unload(container)
      PSPDFKit.load({
        container,
        document: '/dummy.pdf',
        baseUrl: `${window.location.protocol}//${window.location.host}/`,
      })
    }

    // if (container && typeof window !== 'undefined') {
    //   import('pspdfkit').then((PSPDFKit) => {
    //     if (PSPDFKit) {
    //       PSPDFKit.unload(container);
    //     }

    //     PSPDFKit.load({
    //       container,
    //       document: '/dummy.pdf',
    //       baseUrl: `${window.location.protocol}//${window.location.host}/`,
    //     });
    //   });
    // }
  }, []);

  return <div ref={containerRef} style={{ height: '100vh' }} />;
};

export default PdfViewerComponent;