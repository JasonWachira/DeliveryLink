import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const input = searchParams.get("input");

  if (!input) {
    return NextResponse.json(
      { error: "Missing input parameter" },
      { status: 400 }
    );
  }

  try {
    const response = await fetch(
      `https://api.locationiq.com/v1/autocomplete?` +
      `key=${process.env.LOCATIONIQ_API_KEY}&` +
      `q=${encodeURIComponent(input)}&` +
      `countrycodes=ke&` +
      `limit=5&` +
      `format=json`
    );

    if (!response.ok) {
      throw new Error("LocationIQ API request failed");
    }

    const data = await response.json();
    console.log(data)

    const predictions = data.map((place: any) => ({
      place_id: place.place_id,
      osm_type: place.osm_type,
      osm_id: place.osm_id,
      description: place.display_name,
      main_text: place.display_name.split(',')[0],
      secondary_text: place.display_name.substring(
        place.display_name.indexOf(',') + 2
      ),
      lat: parseFloat(place.lat),
      lon: parseFloat(place.lon),
    }));

    return NextResponse.json({ predictions });
  } catch (error) {
    console.error("Autocomplete error:", error);
    return NextResponse.json(
      { error: "Failed to fetch suggestions" },
      { status: 500 }
    );
  }
}
