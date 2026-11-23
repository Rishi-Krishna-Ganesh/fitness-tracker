import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { scriptUrl, action, data } = body;

    const targetUrl = scriptUrl || process.env.NEXT_PUBLIC_SHEETS_API_URL;
    if (!targetUrl) {
      return NextResponse.json(
        { status: 'error', message: 'No Google Apps Script URL provided' },
        { status: 400 }
      );
    }

    // Google Apps Script redirects with 302 on POST.
    // Fetch from server handles redirects automatically without CORS blockage!
    const response = await fetch(targetUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
      body: JSON.stringify({ action, data }),
      redirect: 'follow',
    });

    const text = await response.text();
    let jsonResult;
    try {
      jsonResult = JSON.parse(text);
    } catch {
      jsonResult = { status: 'success', raw: text };
    }

    return NextResponse.json(jsonResult);
  } catch (error: any) {
    console.error('API route sheet sync error:', error);
    return NextResponse.json(
      { status: 'error', message: error.message || 'Internal proxy error' },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const scriptUrl = searchParams.get('scriptUrl') || process.env.NEXT_PUBLIC_SHEETS_API_URL;
    const action = searchParams.get('action') || 'getAll';

    if (!scriptUrl) {
      return NextResponse.json(
        { status: 'error', message: 'No scriptUrl provided' },
        { status: 400 }
      );
    }

    const response = await fetch(`${scriptUrl}?action=${encodeURIComponent(action)}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
      redirect: 'follow',
    });

    const text = await response.text();
    let jsonResult;
    try {
      jsonResult = JSON.parse(text);
    } catch {
      jsonResult = { status: 'success', raw: text };
    }

    return NextResponse.json(jsonResult);
  } catch (error: any) {
    console.error('API route sheet get error:', error);
    return NextResponse.json(
      { status: 'error', message: error.message || 'Internal proxy error' },
      { status: 500 }
    );
  }
}
