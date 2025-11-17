import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const osmType = searchParams.get("osm_type");
  const osmId = searchParams.get("osm_id");

  if (!osmType || !osmId) {
    return NextResponse.json(
      { error: "Missing osm_type or osm_id parameter" },
      { status: 400 }
    );
  }

  try {

    const typePrefix = osmType[0].toUpperCase();
    const osmIds = `${typePrefix}${osmId}`;

    const response = await fetch(
      `https://us1.locationiq.com/v1/lookup?` +
      `key=${process.env.LOCATIONIQ_API_KEY}&` +
      `osm_ids=${encodeURIComponent(osmIds)}&` +
      `format=json`
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("LocationIQ API error:", {
        status: response.status,
        body: errorText
      });
      throw new Error("LocationIQ API request failed");
    }

    const data = await response.json();
    const place = data[0]; // Lookup returns an array

    const result = {
      result: {
        formatted_address: place.display_name,
        geometry: {
          location: {
            lat: parseFloat(place.lat),
            lng: parseFloat(place.lon),
          },
        },
      },
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error("Place details error:", error);
    return NextResponse.json(
      { error: "Failed to fetch place details" },
      { status: 500 }
    );
  }
}
