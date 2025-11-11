/**
 * Standalone test for formatDate function
 * Tests the EU timezone support implementation
 */

// Copy the formatDate function here to avoid importing env.ts
function formatDate(
  date: Date | string | number | undefined | null,
  options?: {
    locale?: string | string[];
    format?: "short" | "medium" | "long" | "full" | "custom";
    customOptions?: Intl.DateTimeFormatOptions;
    timezone?: "local" | "utc" | string;
  },
): string {
  if (!date) return "";

  let dateObj: Date;

  if (typeof date === "string" || typeof date === "number") {
    // Assume database timestamps are in UTC
    dateObj = new Date(date);
  } else {
    dateObj = date;
  }

  if (!dateObj || Number.isNaN(dateObj.getTime())) return "";

  const {
    locale = "de-DE",
    format = "short",
    customOptions,
    timezone = "local",
  } = options || {};

  let dateTimeFormatOptions: Intl.DateTimeFormatOptions;

  if (customOptions) {
    dateTimeFormatOptions = { ...customOptions };
  } else {
    switch (format) {
      case "short":
        dateTimeFormatOptions = {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        };
        break;
      case "medium":
        dateTimeFormatOptions = {
          day: "2-digit",
          month: "short",
          year: "numeric",
        };
        break;
      case "long":
        dateTimeFormatOptions = {
          day: "2-digit",
          month: "long",
          year: "numeric",
        };
        break;
      case "full":
        dateTimeFormatOptions = {
          weekday: "long",
          day: "2-digit",
          month: "long",
          year: "numeric",
        };
        break;
      default:
        dateTimeFormatOptions = {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        };
    }
  }

  // Handle timezone settings
  if (timezone === "utc") {
    dateTimeFormatOptions.timeZone = "UTC";
  } else if (timezone === "local") {
    // Use browser's local timezone (default behavior)
    // Don't set timeZone to let browser use its local timezone
  } else if (typeof timezone === "string") {
    dateTimeFormatOptions.timeZone = timezone;
  }

  // Use browser's locale if available, fallback to German
  const resolvedLocale =
    typeof window !== "undefined" ? navigator.language || locale : locale;

  return new Intl.DateTimeFormat(resolvedLocale, dateTimeFormatOptions).format(
    dateObj,
  );
}

// Test cases
console.log("Testing formatDate function...\n");

// Test 1: Basic functionality
console.log("1. Basic functionality:");
const testDate = new Date("2024-01-15T12:00:00Z");
console.log(`Input: ${testDate.toISOString()}`);
console.log(`Short format: ${formatDate(testDate, { format: "short" })}`);
console.log(`Medium format: ${formatDate(testDate, { format: "medium" })}`);
console.log(`Long format: ${formatDate(testDate, { format: "long" })}`);
console.log(`Full format: ${formatDate(testDate, { format: "full" })}`);
console.log();

// Test 2: Different locales
console.log("2. Different EU locales:");
console.log(
  `German (de-DE): ${formatDate(testDate, { locale: "de-DE", format: "medium" })}`,
);
console.log(
  `French (fr-FR): ${formatDate(testDate, { locale: "fr-FR", format: "medium" })}`,
);
console.log(
  `Spanish (es-ES): ${formatDate(testDate, { locale: "es-ES", format: "medium" })}`,
);
console.log(
  `Italian (it-IT): ${formatDate(testDate, { locale: "it-IT", format: "medium" })}`,
);
console.log();

// Test 3: Timezone handling
console.log("3. Timezone handling:");
console.log(
  `UTC: ${formatDate(testDate, { timezone: "utc", format: "medium" })}`,
);
console.log(
  `Local (default): ${formatDate(testDate, { timezone: "local", format: "medium" })}`,
);
console.log(
  `Berlin (Europe/Berlin): ${formatDate(testDate, { timezone: "Europe/Berlin", format: "medium" })}`,
);
console.log(
  `Paris (Europe/Paris): ${formatDate(testDate, { timezone: "Europe/Paris", format: "medium" })}`,
);
console.log();

// Test 4: Custom options
console.log("4. Custom options:");
console.log(
  `With time: ${formatDate(testDate, {
    customOptions: {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    },
  })}`,
);
console.log();

// Test 5: Edge cases
console.log("5. Edge cases:");
console.log(`Null input: "${formatDate(null)}"`);
console.log(`Undefined input: "${formatDate(undefined)}"`);
console.log(`Invalid date: "${formatDate(new Date("invalid"))}"`);
console.log(
  `String input: "${formatDate("2024-01-15T12:00:00Z", { format: "medium" })}"`,
);
console.log();

// Test 6: EU timezone coverage
console.log("6. EU timezone coverage test:");
const euTimezones = [
  "Europe/London",
  "Europe/Berlin",
  "Europe/Paris",
  "Europe/Rome",
  "Europe/Madrid",
  "Europe/Amsterdam",
  "Europe/Brussels",
  "Europe/Vienna",
  "Europe/Prague",
  "Europe/Warsaw",
  "Europe/Budapest",
  "Europe/Bucharest",
  "Europe/Sofia",
  "Europe/Athens",
  "Europe/Helsinki",
  "Europe/Stockholm",
  "Europe/Copenhagen",
  "Europe/Oslo",
  "Europe/Lisbon",
  "Europe/Dublin",
];

euTimezones.forEach((tz) => {
  try {
    const result = formatDate(testDate, { timezone: tz, format: "short" });
    console.log(`${tz}: ${result}`);
  } catch (error) {
    if (error instanceof Error) {
      console.log(`${tz}: Error - ${error.message}`);
    } else {
      console.log(`${tz}: Error - ${String(error)}`);
    }
  }
});

console.log();

// Test 7: Date boundary testing around midnight
console.log("7. Date boundary testing around midnight:");
const midnightTestDate = new Date("2024-01-15T23:30:00Z"); // 11:30 PM UTC
console.log(`UTC Input: ${midnightTestDate.toISOString()} (11:30 PM UTC)`);
console.log();

const boundaryTimezones = [
  "Europe/London", // UTC+0
  "Europe/Berlin", // UTC+1
  "Europe/Paris", // UTC+1
  "Europe/Rome", // UTC+1
  "Europe/Madrid", // UTC+1
  "Europe/Amsterdam", // UTC+1
  "Europe/Stockholm", // UTC+1
  "Europe/Athens", // UTC+2
  "Europe/Helsinki", // UTC+2
  "Europe/Lisbon", // UTC+0 (but might be +1 during DST)
];

boundaryTimezones.forEach((tz) => {
  try {
    const dateResult = formatDate(midnightTestDate, {
      timezone: tz,
      format: "short",
    });
    const timeResult = formatDate(midnightTestDate, {
      timezone: tz,
      customOptions: {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      },
    });
    console.log(`${tz.padEnd(18)}: ${dateResult} at ${timeResult}`);
  } catch (error) {
    if (error instanceof Error) {
      console.log(`${tz}: Error - ${error.message}`);
    } else {
      console.log(`${tz}: Error - ${String(error)}`);
    }
  }
});

console.log();
console.log("8. Early morning boundary test (12:30 AM UTC):");
const earlyMorningDate = new Date("2024-01-15T00:30:00Z"); // 12:30 AM UTC
console.log(`UTC Input: ${earlyMorningDate.toISOString()} (12:30 AM UTC)`);
console.log();

boundaryTimezones.forEach((tz) => {
  try {
    const dateResult = formatDate(earlyMorningDate, {
      timezone: tz,
      format: "short",
    });
    const timeResult = formatDate(earlyMorningDate, {
      timezone: tz,
      customOptions: {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      },
    });
    console.log(`${tz.padEnd(18)}: ${dateResult} at ${timeResult}`);
  } catch (error) {
    if (error instanceof Error) {
      console.log(`${tz}: Error - ${error.message}`);
    } else {
      console.log(`${tz}: Error - ${String(error)}`);
    }
  }
});

console.log("\n✅ All tests completed!");
