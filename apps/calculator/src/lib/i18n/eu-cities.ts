import { EU_COUNTRIES } from "@greendex/config/eu-countries";

/**
 * EU Capital Cities with coordinates
 * Used for the Globe component to highlight EU member states
 *
 * This is now derived from the central EU_COUNTRIES configuration
 * to maintain a single source of truth.
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
 *
 * Derived from the central EU_COUNTRIES configuration
 */
export const EU_CAPITAL_CITIES: CityLocation[] = EU_COUNTRIES.map((country) => ({
  name: country.capital,
  countryCode: country.code,
  latitude: country.latitude,
  longitude: country.longitude,
  size: country.markerSize,
}));
