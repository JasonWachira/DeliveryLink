import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const lat = searchParams.get("lat");
  const lng = searchParams.get("lng");

  if (!lat || !lng) {
    return NextResponse.json(
      { error: "Missing latitude or longitude" },
      { status: 400 }
    );
  }

  try {
    const response = await fetch(
      `https://us1.locationiq.com/v1/reverse?` +
      `key=${process.env.LOCATIONIQ_API_KEY}&` +
      `lat=${lat}&` +
      `lon=${lng}&` +
      `format=json`
    );

    if (!response.ok) {
      throw new Error("LocationIQ API request failed");
    }

    const data = await response.json();

    const results = [
      {
        formatted_address: data.display_name,
      },
    ];

    return NextResponse.json({ results });
  } catch (error) {
    console.error("Reverse geocoding error:", error);
    return NextResponse.json(
      { error: "Failed to fetch address" },
      { status: 500 }
    );
  }
}
