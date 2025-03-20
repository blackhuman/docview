import { NextResponse } from 'next/dist/server/web/spec-extension/response';

export async function GET(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const pathname = url.pathname;
  
  // Extract the path from the pathname (removing '/api/file/')
  const pathSegments = pathname.split('/').slice(3);
  const filePath = pathSegments.join('/');
  
  // Replace "file" prefix with the blob storage URL
  const blobStorageUrl = "https://qokvogozqtkoq9ng.public.blob.vercel-storage.com";
  const targetUrl = `${blobStorageUrl}/${filePath}`;
  
  // Preserve any query parameters from the original request
  const targetUrlWithQuery = new URL(targetUrl);
  url.searchParams.forEach((value, key) => {
    targetUrlWithQuery.searchParams.append(key, value);
  });

  console.log('targetUrlWithQuery', targetUrlWithQuery.toString());
  
  try {
    // Fetch the content from the target URL
    const response = await fetch(targetUrlWithQuery.toString());
    
    if (!response.ok) {
      return new Response(`Failed to fetch: ${response.statusText}`, {
        status: response.status,
      });
    }
    
    // Get the response data
    const data = await response.blob();
    
    // Create a new response with the same data and headers
    const nextResponse = new NextResponse(data, {
      status: response.status,
      headers: {
        'content-type': response.headers.get('content-type') || 'application/octet-stream',
        'content-length': response.headers.get('content-length')!
      }
    })
    
    return nextResponse;
  } catch (error) {
    console.error('Error fetching content:', error);
    return new Response('Error fetching content', { status: 500 });
  }
}