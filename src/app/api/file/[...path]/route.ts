import { NextResponse } from 'next/dist/server/web/spec-extension/response';

export async function GET(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const pathname = url.pathname;
  
  
  try {
    console.log('api/file pathname', pathname)
  
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

    // Fetch the content from the target URL
    const response = await fetch(targetUrlWithQuery.toString());
    
    if (!response.ok) {
      return new Response(`Failed to fetch: ${response.statusText}`, {
        status: response.status,
      });
    }
    
    // Get the response data
    const data = await response.blob();

    // Determine content type, ensuring HTML is properly set
    const contentType = response.headers.get('content-type') || 'text/html';
    
    // Create a new response with the same data but with enhanced headers
    const nextResponse = new NextResponse(data, {
      status: response.status,
      headers: {
        'content-type': contentType,
        
        // Comprehensive CORS headers
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS, HEAD',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
        'Access-Control-Allow-Credentials': 'true',
        
        // Explicitly allow iframe embedding
        'X-Frame-Options': 'ALLOWALL',
        
        // Set permissive Content-Security-Policy
        'Content-Security-Policy': "frame-ancestors *",
        
        // Remove any potential cache-related issues
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      },
    });

    return nextResponse;
  } catch (error) {
    console.error('Error fetching content:', error);
    return new Response('Error fetching content', { status: 500 });
  }
}

// Add OPTIONS handler for CORS preflight requests
export async function OPTIONS(request: Request) {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS, HEAD',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
      'Access-Control-Max-Age': '86400',
    },
  });
}