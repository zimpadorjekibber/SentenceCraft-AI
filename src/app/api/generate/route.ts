
import { NextRequest, NextResponse } from "next/server";
import { generateSentenceAction } from "@/ai/flows/sentence-generator";

export async function POST(req: NextRequest) {
  try {
    const input = await req.json();

    if (!input.apiKey) {
      return NextResponse.json({ error: "API Key is required" }, { status: 400 });
    }

    const result = await generateSentenceAction(input);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: error.message || "An error occurred during generation" },
      { status: 500 }
    );
  }
}
