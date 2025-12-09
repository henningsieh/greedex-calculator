# Country Selection Utilities

This document describes the country selection utilities available in `src/lib/i18n/countries.ts`.

## Overview

The countries utilities provide functions to:
- List EU countries with their flags and localized names
- Get flag components for any country code
- Check if a country is an EU member state
- Get all available countries (not just EU)

All utilities use the `i18n-iso-countries` and `country-flag-icons` libraries for accurate, localized country data and high-quality SVG flags.

## Available Functions

### `getEUCountries(locale?: string): CountryData[]`

Returns a list of all 27 EU member states with their flags and localized names.

**Parameters:**
- `locale` (optional): The locale code for country names (default: "en"). Supports "en", "de", etc.

**Returns:** Array of `CountryData` objects, sorted alphabetically by country name.

**Example:**
```tsx
import { getEUCountries } from '@/lib/i18n/countries';

const countries = getEUCountries('en');
// Returns:
// [
//   { code: 'AT', name: 'Austria', nativeName: 'Austria', Flag: AustriaFlag },
//   { code: 'BE', name: 'Belgium', nativeName: 'Belgium', Flag: BelgiumFlag },
//   ...
// ]
```

### `getCountryFlag(countryCode: string): FlagComponent | undefined`

Returns the flag component for a given country code.

**Parameters:**
- `countryCode`: ISO 3166-1 alpha-2 country code (e.g., "DE", "FR"). Case-insensitive.

**Returns:** React SVG component for the flag, or `undefined` if not found.

**Example:**
```tsx
import { getCountryFlag } from '@/lib/i18n/countries';

const GermanyFlag = getCountryFlag('DE');
if (GermanyFlag) {
  return <GermanyFlag className="w-6 h-4" />;
}
```

### `getCountryData(countryCode: string, locale?: string): CountryData | undefined`

Returns detailed country information for a specific country code.

**Parameters:**
- `countryCode`: ISO 3166-1 alpha-2 country code. Case-insensitive.
- `locale` (optional): Locale for country name (default: "en")

**Returns:** `CountryData` object or `undefined` if not found.

**Example:**
```tsx
import { getCountryData } from '@/lib/i18n/countries';

const germany = getCountryData('DE', 'en');
// Returns:
// { code: 'DE', name: 'Germany', nativeName: 'Germany', Flag: GermanyFlag }
```

### `isEUCountry(countryCode: string): boolean`

Checks if a country code represents an EU member state.

**Parameters:**
- `countryCode`: ISO 3166-1 alpha-2 country code. Case-insensitive.

**Returns:** `true` if the country is an EU member state, `false` otherwise.

**Example:**
```tsx
import { isEUCountry } from '@/lib/i18n/countries';

isEUCountry('DE'); // true
isEUCountry('US'); // false
isEUCountry('GB'); // false (post-Brexit)
```

### `getAllCountries(locale?: string): CountryData[]`

Returns all available countries (not just EU) with their flags and localized names.

**Parameters:**
- `locale` (optional): Locale for country names (default: "en")

**Returns:** Array of all `CountryData` objects, sorted alphabetically.

**Example:**
```tsx
import { getAllCountries } from '@/lib/i18n/countries';

const allCountries = getAllCountries('en');
// Returns 200+ countries including US, GB, CH, etc.
```

## TypeScript Types

### `CountryData`

```typescript
interface CountryData {
  code: string;                                    // ISO 3166-1 alpha-2 code
  name: string;                                    // Country name in requested locale
  nativeName: string;                              // Country name in native language
  Flag?: ComponentType<SVGProps<SVGSVGElement>>;  // Flag SVG component
}
```

### `EUCountryCode`

```typescript
type EUCountryCode = 
  | "AT" | "BE" | "BG" | "HR" | "CY" | "CZ" | "DK" | "EE" | "FI" 
  | "FR" | "DE" | "GR" | "HU" | "IE" | "IT" | "LV" | "LT" | "LU" 
  | "MT" | "NL" | "PL" | "PT" | "RO" | "SK" | "SI" | "ES" | "SE";
```

## Usage in Forms

### Example: Country Select Dropdown with Flags

```tsx
'use client';

import { useLocale } from 'next-intl';
import { getEUCountries } from '@/lib/i18n/countries';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export function CountrySelect({ 
  value, 
  onValueChange 
}: { 
  value?: string; 
  onValueChange: (value: string) => void;
}) {
  const locale = useLocale();
  const countries = getEUCountries(locale);

  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger className="w-full">
        <SelectValue placeholder="Select a country" />
      </SelectTrigger>
      <SelectContent>
        {countries.map((country) => (
          <SelectItem key={country.code} value={country.code}>
            <div className="flex items-center gap-2">
              {country.Flag && (
                <country.Flag className="w-6 h-4 rounded-sm border border-border/20" />
              )}
              <span>{country.name}</span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
```

### Example: Country Select with Custom Display

```tsx
'use client';

import { useLocale } from 'next-intl';
import { useState } from 'react';
import { getEUCountries, getCountryData } from '@/lib/i18n/countries';

export function CountryPicker() {
  const locale = useLocale();
  const [selectedCountry, setSelectedCountry] = useState<string>('');
  const countries = getEUCountries(locale);

  const selectedData = selectedCountry 
    ? getCountryData(selectedCountry, locale) 
    : null;

  return (
    <div className="space-y-4">
      <select 
        value={selectedCountry} 
        onChange={(e) => setSelectedCountry(e.target.value)}
        className="w-full p-2 border rounded"
      >
        <option value="">Select a country</option>
        {countries.map((country) => (
          <option key={country.code} value={country.code}>
            {country.name}
          </option>
        ))}
      </select>

      {selectedData?.Flag && (
        <div className="flex items-center gap-2">
          <selectedData.Flag className="w-12 h-8" />
          <div>
            <p className="font-semibold">{selectedData.name}</p>
            <p className="text-sm text-muted-foreground">{selectedData.code}</p>
          </div>
        </div>
      )}
    </div>
  );
}
```

### Example: Using in create-project-form.tsx

```tsx
import { useLocale } from 'next-intl';
import { getEUCountries } from '@/lib/i18n/countries';

export function CreateProjectForm() {
  const locale = useLocale();
  const euCountries = getEUCountries(locale);

  return (
    <form>
      {/* ... other fields ... */}
      
      <div className="space-y-2">
        <label htmlFor="country">Project Country</label>
        <select id="country" name="country" required>
          <option value="">Select country...</option>
          {euCountries.map((country) => (
            <option key={country.code} value={country.code}>
              {country.name}
            </option>
          ))}
        </select>
      </div>

      {/* ... other fields ... */}
    </form>
  );
}
```

## EU Member States (as of 2024)

The utility includes all 27 EU member states:

Austria, Belgium, Bulgaria, Croatia, Cyprus, Czech Republic, Denmark, Estonia, Finland, France, Germany, Greece, Hungary, Ireland, Italy, Latvia, Lithuania, Luxembourg, Malta, Netherlands, Poland, Portugal, Romania, Slovakia, Slovenia, Spain, Sweden

## Benefits

✅ **Type-safe** - Full TypeScript support  
✅ **Localized** - Country names in user's language  
✅ **High-quality flags** - SVG flags from `country-flag-icons`  
✅ **Sorted** - Countries sorted alphabetically by name  
✅ **Flexible** - Support for EU-only or all countries  
✅ **Accessible** - Works with form libraries and accessibility tools  

## Related Files

- Implementation: `src/lib/i18n/countries.ts`
- Tests: `src/lib/i18n/countries.test.ts`
- Locale utilities: `src/lib/i18n/locales.ts`
- Locale switcher example: `src/components/locale-switcher.tsx`
