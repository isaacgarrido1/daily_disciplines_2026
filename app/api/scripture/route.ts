import { NextRequest, NextResponse } from "next/server";

const ESV_BASE = "https://api.esv.org/v3/passage/text/";

// Deterministic "verse of the day" by day of year (no verse-of-the-day endpoint in ESV API)
const VERSE_OF_DAY_REFERENCES: string[] = [
  "Psalm 23:1",
  "John 3:16",
  "Philippians 4:13",
  "Proverbs 3:5-6",
  "Romans 8:28",
  "Isaiah 41:10",
  "Matthew 11:28",
  "Joshua 1:9",
  "Psalm 46:1",
  "Romans 12:2",
  "2 Timothy 1:7",
  "Psalm 119:105",
  "Jeremiah 29:11",
  "Isaiah 40:31",
  "Psalm 27:1",
  "Matthew 6:33",
  "Colossians 3:23",
  "Hebrews 11:1",
  "Psalm 34:4",
  "Romans 5:8",
  "1 Corinthians 16:14",
  "Galatians 5:22-23",
  "Ephesians 6:10",
  "Psalm 91:1-2",
  "James 1:12",
  "1 Peter 5:7",
  "Psalm 121:1-2",
  "Isaiah 43:2",
  "John 14:27",
  "Romans 15:13"
];

function getVerseOfDayRef(): string {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const diff = now.getTime() - start.getTime();
  const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24));
  const index = dayOfYear % VERSE_OF_DAY_REFERENCES.length;
  return VERSE_OF_DAY_REFERENCES[index];
}

export async function GET(request: NextRequest) {
  const token = process.env.ESV_API_TOKEN;
  if (!token) {
    return NextResponse.json(
      { error: "Scripture API is not configured." },
      { status: 503 }
    );
  }

  const ref = request.nextUrl.searchParams.get("q") ?? getVerseOfDayRef();

  try {
    const url = new URL(ESV_BASE);
    url.searchParams.set("q", ref);
    url.searchParams.set("include-footnotes", "false");
    url.searchParams.set("include-headings", "false");

    const res = await fetch(url.toString(), {
      headers: {
        Authorization: `Token ${token}`,
        "Content-Type": "application/json"
      },
      next: { revalidate: 3600 }
    });

    if (!res.ok) {
      const text = await res.text();
      return NextResponse.json(
        { error: "Could not fetch passage.", details: text.slice(0, 200) },
        { status: res.status >= 500 ? 502 : 400 }
      );
    }

    const data = (await res.json()) as {
      query?: string;
      canonical?: string;
      passages?: string[];
    };
    const passage = data.passages?.[0]?.trim() ?? "";
    const canonical = data.canonical ?? data.query ?? ref;

    return NextResponse.json({
      reference: canonical,
      text: passage,
      query: ref
    });
  } catch (err) {
    console.error("ESV API error:", err);
    return NextResponse.json(
      { error: "Failed to load scripture." },
      { status: 502 }
    );
  }
}
