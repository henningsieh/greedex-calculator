/**
 * Landing Page Types
 *
 * Type definitions for landing page components and features
 */

import { WORKSHOPS } from "@greendex/config/workshops";

/**
 * Navigation item for header menu
 */
export interface NavItem {
  href: string;
  label: string;
}

/**
 * Logo customer/partner
 */
export interface LogoCustomer {
  alt: string;
  src: string;
  width: number;
  height: number;
  className?: string;
}

/**
 * Partner organization/institution
 */
export interface Partner {
  id: string;
  name: string;
  countryCode?: string; // ISO 3166-1 alpha-2 country code (e.g., "SI", "CY")
  website?: string;
  logo: string; // path under /about
  description?: string;
}

/**
 * Greendex Workshop types
 */
export type WorkshopType = (typeof WORKSHOPS)[number]["id"];
