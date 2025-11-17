import { NextRequest, NextResponse } from "next/server";

const LOCATIONIQ_API_KEY = process.env.LOCATIONIQ_API_KEY;
const LOCATIONIQ_BASE_URL = "https://us1.locationiq.com/v1";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const pickupLat = searchParams.get("pickupLat");
    const pickupLng = searchParams.get("pickupLng");
    const dropoffLat = searchParams.get("dropoffLat");
    const dropoffLng = searchParams.get("dropoffLng");

    if (!pickupLat || !pickupLng || !dropoffLat || !dropoffLng) {
      return NextResponse.json(
        { error: "Missing required coordinates" },
        { status: 400 }
      );
    }

    if (!LOCATIONIQ_API_KEY) {
      return NextResponse.json(
        { error: "LocationIQ API key not configured" },
        { status: 500 }
      );
    }

    const coordinates = `${pickupLng},${pickupLat};${dropoffLng},${dropoffLat}`;
    const url = `${LOCATIONIQ_BASE_URL}/directions/driving/${coordinates}?key=${LOCATIONIQ_API_KEY}&overview=full&geometries=geojson`;

    const response = await fetch(url);

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(
        { error: errorData.error || "Failed to calculate distance" },
        { status: response.status }
      );
    }

    const data = await response.json();

    if (data.routes && data.routes.length > 0) {
      const route = data.routes[0];
      const distanceInMeters = route.distance;
      const distanceInKm = distanceInMeters / 1000;
      const durationInSeconds = route.duration;
      const durationInMinutes = Math.ceil(durationInSeconds / 60);

      return NextResponse.json({
        distance: distanceInKm,
        distanceInMeters: distanceInMeters,
        duration: durationInMinutes,
        durationInSeconds: durationInSeconds,
        geometry: route.geometry,
      });
    }

    return NextResponse.json(
      { error: "No route found" },
      { status: 404 }
    );
  } catch (error) {
    console.error("Distance calculation error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
