import { NextRequest, NextResponse } from 'next/server';

const GOOGLE_INPUT_TOOLS_URL = 'https://inputtools.google.com/request';

export async function GET(req: NextRequest) {
  const text = req.nextUrl.searchParams.get('text');

  if (!text) {
    return NextResponse.json({ error: 'Missing text parameter' }, { status: 400 });
  }

  try {
    const url = `${GOOGLE_INPUT_TOOLS_URL}?itc=hi-t-i0-und&num=5&text=${encodeURIComponent(text)}`;
    const res = await fetch(url);
    const data = await res.json();
    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Transliteration failed' },
      { status: 500 }
    );
  }
}
