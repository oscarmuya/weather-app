import { NextResponse } from "next/server";

const UNSPLASH_ACCESS_KEY = process.env.UNSPLASH_ACCESS_KEY!;

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const city = searchParams.get("city");

  if (typeof city !== "string") {
    return NextResponse.json(
      { error: "City parameter is required" },
      { status: 400 }
    );
  }

  const url = new URL("https://api.unsplash.com/search/photos");
  url.searchParams.set("query", `${city} landmark`);
  url.searchParams.set("per_page", "1");
  url.searchParams.set("client_id", UNSPLASH_ACCESS_KEY);

  const response = await fetch(url.toString());
  if (!response.ok) {
    return NextResponse.json(
      { error: "Unsplash search failed" },
      { status: 400 }
    );
  }

  const data = await response.json();
  const first = data.results[0];
  if (!first) {
    return NextResponse.json({ error: "No landmark found" }, { status: 400 });
  }

  return NextResponse.json({ imageUrl: first.urls.regular }, { status: 200 });
}
