/**
 * Geocoding utility to convert addresses to coordinates using Mapbox Geocoding API
 */

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export const geocodeAddress = async (
  address: string,
  mapboxToken: string
): Promise<Coordinates | null> => {
  try {
    const response = await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
        address
      )}.json?access_token=${mapboxToken}&country=DZ&limit=1`
    );

    if (!response.ok) {
      console.error('Geocoding request failed:', response.statusText);
      return null;
    }

    const data = await response.json();

    if (data.features && data.features.length > 0) {
      const [longitude, latitude] = data.features[0].center;
      return { latitude, longitude };
    }

    return null;
  } catch (error) {
    console.error('Geocoding failed:', error);
    return null;
  }
};

/**
 * Cache for geocoded addresses to avoid repeated API calls
 */
const geocodeCache = new Map<string, Coordinates>();

export const geocodeAddressWithCache = async (
  address: string,
  mapboxToken: string
): Promise<Coordinates | null> => {
  const cacheKey = address.toLowerCase().trim();
  
  if (geocodeCache.has(cacheKey)) {
    return geocodeCache.get(cacheKey)!;
  }

  const coords = await geocodeAddress(address, mapboxToken);
  
  if (coords) {
    geocodeCache.set(cacheKey, coords);
  }

  return coords;
};
