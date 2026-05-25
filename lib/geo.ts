/** Cached IP geolocation — calls ipapi.co at most once per page load */

interface GeoResult {
  latitude: number;
  longitude: number;
  city: string;
}

let _cache: Promise<GeoResult> | null = null;

export function getGeo(): Promise<GeoResult> {
  if (!_cache) {
    _cache = fetch("https://ipapi.co/json/")
      .then((r) => r.json())
      .catch(() => ({ latitude: 51.5, longitude: -0.12, city: "" })); // fallback: London
  }
  return _cache;
}
