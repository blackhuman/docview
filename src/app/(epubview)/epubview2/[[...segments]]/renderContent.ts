import { createElement } from 'react';
import { JSDOM } from 'jsdom';

function kebabToCamelCase(str: string): string {
  return str.replace(/-([a-z])/g, (match, letter) => letter.toUpperCase());
}

interface RenderedContent {
  head: React.ReactNode[];
  body: React.ReactNode[];
}

export async function renderContent(content: string): Promise<RenderedContent> {
  const dom = new JSDOM(content);
  const document = dom.window.document;
  
  function convertAttributes(element: Element): Record<string, any> {
    const attrs: Record<string, any> = {};
    for (const attr of element.attributes) {
      // Convert class to className for React
      if (attr.name === 'class') {
        attrs['className'] = attr.value;
      } else {
        // Convert attribute name from kebab-case to camelCase
        const attrName = kebabToCamelCase(attr.name);
        attrs[attrName] = attr.value;
      }
    }
    return attrs;
  }

  function convertNode(node: Element): React.ReactNode {
    // Skip script tags
    if (node.tagName.toLowerCase() === 'script') {
      return null;
    }

    const attrs = convertAttributes(node);
    
    // Handle children
    const children: React.ReactNode[] = Array.from(node.childNodes).map((child) => {
      if (child.nodeType === dom.window.Node.TEXT_NODE) {
        return child.textContent;
      } else if (child.nodeType === dom.window.Node.ELEMENT_NODE) {
        return convertNode(child as Element);
      }
      return null;
    }).filter(Boolean);

    // Create React element with proper key
    return createElement(
      node.tagName.toLowerCase(),
      { ...attrs, key: Math.random().toString(36).substring(2, 9) },
      children.length > 0 ? children : undefined
    );
  }

  // Convert both head and body content
  const headComponents = Array.from(document.head.children).map(convertNode);
  const bodyComponents = Array.from(document.body.children).map(convertNode);

  return {
    head: headComponents,
    body: bodyComponents,
  };
}
