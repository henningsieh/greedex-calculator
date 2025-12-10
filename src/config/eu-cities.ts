/**
 * EU Capital Cities with coordinates
 * Used for the Globe component to highlight EU member states
 */

export interface CityLocation {
  name: string;
  countryCode: string;
  latitude: number;
  longitude: number;
  size?: number; // Optional size for marker differentiation
}

/**
 * Capital cities of EU member states with their coordinates
 * Coordinates are in decimal degrees format
 */
export const EU_CAPITAL_CITIES: CityLocation[] = [
  { name: "Vienna", countryCode: "AT", latitude: 48.2082, longitude: 16.3738 },
  { name: "Brussels", countryCode: "BE", latitude: 50.8503, longitude: 4.3517 },
  { name: "Sofia", countryCode: "BG", latitude: 42.6977, longitude: 23.3219 },
  { name: "Zagreb", countryCode: "HR", latitude: 45.815, longitude: 15.9819 },
  { name: "Nicosia", countryCode: "CY", latitude: 35.1856, longitude: 33.3823 },
  { name: "Prague", countryCode: "CZ", latitude: 50.0755, longitude: 14.4378 },
  {
    name: "Copenhagen",
    countryCode: "DK",
    latitude: 55.6761,
    longitude: 12.5683,
  },
  { name: "Tallinn", countryCode: "EE", latitude: 59.437, longitude: 24.7536 },
  { name: "Helsinki", countryCode: "FI", latitude: 60.1699, longitude: 24.9384 },
  {
    name: "Paris",
    countryCode: "FR",
    latitude: 48.8566,
    longitude: 2.3522,
    size: 1.2,
  },
  {
    name: "Berlin",
    countryCode: "DE",
    latitude: 52.52,
    longitude: 13.405,
    size: 1.2,
  },
  { name: "Athens", countryCode: "GR", latitude: 37.9838, longitude: 23.7275 },
  { name: "Budapest", countryCode: "HU", latitude: 47.4979, longitude: 19.0402 },
  { name: "Dublin", countryCode: "IE", latitude: 53.3498, longitude: -6.2603 },
  {
    name: "Rome",
    countryCode: "IT",
    latitude: 41.9028,
    longitude: 12.4964,
    size: 1.2,
  },
  { name: "Riga", countryCode: "LV", latitude: 56.9496, longitude: 24.1052 },
  { name: "Vilnius", countryCode: "LT", latitude: 54.6872, longitude: 25.2797 },
  { name: "Luxembourg", countryCode: "LU", latitude: 49.6116, longitude: 6.1319 },
  { name: "Valletta", countryCode: "MT", latitude: 35.8989, longitude: 14.5146 },
  { name: "Amsterdam", countryCode: "NL", latitude: 52.3676, longitude: 4.9041 },
  { name: "Warsaw", countryCode: "PL", latitude: 52.2297, longitude: 21.0122 },
  { name: "Lisbon", countryCode: "PT", latitude: 38.7223, longitude: -9.1393 },
  { name: "Bucharest", countryCode: "RO", latitude: 44.4268, longitude: 26.1025 },
  {
    name: "Bratislava",
    countryCode: "SK",
    latitude: 48.1486,
    longitude: 17.1077,
  },
  { name: "Ljubljana", countryCode: "SI", latitude: 46.0569, longitude: 14.5058 },
  {
    name: "Madrid",
    countryCode: "ES",
    latitude: 40.4168,
    longitude: -3.7038,
    size: 1.2,
  },
  { name: "Stockholm", countryCode: "SE", latitude: 59.3293, longitude: 18.0686 },
];

/**
 * Get a subset of cities for testing or different views
 */
export function getEUCitiesSubset(limit?: number): CityLocation[] {
  if (limit && limit > 0) {
    return EU_CAPITAL_CITIES.slice(0, limit);
  }
  return EU_CAPITAL_CITIES;
}

/**
 * Get cities by region (approximation based on longitude)
 */
export function getEUCitiesByRegion(
  region: "west" | "central" | "east",
): CityLocation[] {
  switch (region) {
    case "west":
      return EU_CAPITAL_CITIES.filter((city) => city.longitude < 5);
    case "central":
      return EU_CAPITAL_CITIES.filter(
        (city) => city.longitude >= 5 && city.longitude < 20,
      );
    case "east":
      return EU_CAPITAL_CITIES.filter((city) => city.longitude >= 20);
    default:
      return EU_CAPITAL_CITIES;
  }
}
