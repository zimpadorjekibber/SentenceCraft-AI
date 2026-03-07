import { NextRequest, NextResponse } from 'next/server';

const GOOGLE_INPUT_TOOLS_URL = 'https://inputtools.google.com/request';

// Language codes for Google Input Tools transliteration
const LANG_ITC_MAP: Record<string, string> = {
  hi: 'hi-t-i0-und',
  bo: 'bo-t-i0-und',
};

export async function GET(req: NextRequest) {
  const text = req.nextUrl.searchParams.get('text');
  const lang = req.nextUrl.searchParams.get('lang') || 'hi';

  if (!text) {
    return NextResponse.json({ error: 'Missing text parameter' }, { status: 400 });
  }

  const itc = LANG_ITC_MAP[lang] || LANG_ITC_MAP['hi'];

  try {
    const url = `${GOOGLE_INPUT_TOOLS_URL}?itc=${itc}&num=5&text=${encodeURIComponent(text)}`;
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
