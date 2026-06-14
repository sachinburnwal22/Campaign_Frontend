import { NextRequest, NextResponse } from 'next/server'

const BACKEND_URL = process.env.BACKEND_URL || 'http://127.0.0.1:8000'

async function handleProxy(request: NextRequest) {
  // Build target URL
  const targetUrl = new URL(request.nextUrl.pathname + request.nextUrl.search, BACKEND_URL)

  const headers = new Headers(request.headers)
  // Update Host header for target backend
  headers.set('host', '127.0.0.1:8000')

  const fetchOptions: RequestInit = {
    method: request.method,
    headers: headers,
  };

  // Extract body for mutative requests
  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(request.method)) {
    try {
      const text = await request.text()
      if (text && text.length > 0) {
        fetchOptions.body = text
      }
    } catch (e) {
      // Body reading skipped if empty or failed
    }
  }

  try {
    const response = await fetch(targetUrl.toString(), fetchOptions)
    
    // Read response body as blob to handle all media/content types
    const body = await response.blob()
    
    const responseHeaders = new Headers()
    response.headers.forEach((value, key) => {
      const lowerKey = key.toLowerCase();
      if (lowerKey !== 'content-encoding' && lowerKey !== 'content-length' && lowerKey !== 'transfer-encoding') {
        responseHeaders.set(key, value)
      }
    })

    return new Response(body, {
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders,
    })
  } catch (error: any) {
    console.error('API Proxy Error:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Laravel backend server is unreachable at ' + BACKEND_URL,
      details: error.message 
    }, { status: 502 })
  }
}

export async function GET(request: NextRequest) { return handleProxy(request) }
export async function POST(request: NextRequest) { return handleProxy(request) }
export async function PUT(request: NextRequest) { return handleProxy(request) }
export async function PATCH(request: NextRequest) { return handleProxy(request) }
export async function DELETE(request: NextRequest) { return handleProxy(request) }
