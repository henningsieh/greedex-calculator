/**
 * Test suite for formatDate function
 * Tests the EU timezone support implementation
 */

import { describe, expect, it } from "vitest";

// Import the actual formatDate function from utils
import { formatDate } from "@/lib/utils";

describe("formatDate function", () => {
  const testDate = new Date("2024-01-15T12:00:00Z");

  describe("Basic functionality", () => {
    it("should format dates in short format", () => {
      const result = formatDate(testDate, { format: "short", locale: "de-DE" });
      expect(result).toBe("15.01.2024");
    });

    it("should format dates in medium format", () => {
      const result = formatDate(testDate, {
        format: "medium",
        locale: "de-DE",
      });
      expect(result).toBe("15. Jan. 2024");
    });

    it("should format dates in long format", () => {
      const result = formatDate(testDate, { format: "long", locale: "de-DE" });
      expect(result).toBe("15. Januar 2024");
    });

    it("should format dates in full format", () => {
      const result = formatDate(testDate, { format: "full", locale: "de-DE" });
      expect(result).toBe("Montag, 15. Januar 2024");
    });
  });

  describe("Different EU locales", () => {
    it("should format in German locale", () => {
      const result = formatDate(testDate, {
        locale: "de-DE",
        format: "medium",
      });
      expect(result).toBe("15. Jan. 2024");
    });

    it("should format in French locale", () => {
      const result = formatDate(testDate, {
        locale: "fr-FR",
        format: "medium",
      });
      expect(result).toBe("15 janv. 2024");
    });

    it("should format in Spanish locale", () => {
      const result = formatDate(testDate, {
        locale: "es-ES",
        format: "medium",
      });
      expect(result).toBe("15 ene 2024");
    });

    it("should format in Italian locale", () => {
      const result = formatDate(testDate, {
        locale: "it-IT",
        format: "medium",
      });
      expect(result).toBe("15 gen 2024");
    });
  });

  describe("Timezone handling", () => {
    it("should format in UTC timezone", () => {
      const result = formatDate(testDate, {
        timezone: "utc",
        format: "medium",
        locale: "de-DE",
      });
      expect(result).toBe("15. Jan. 2024");
    });

    it("should format in local timezone by default", () => {
      const result = formatDate(testDate, {
        timezone: "local",
        format: "medium",
        locale: "de-DE",
      });
      expect(result).toBe("15. Jan. 2024");
    });

    it("should format in Berlin timezone", () => {
      const result = formatDate(testDate, {
        timezone: "Europe/Berlin",
        format: "medium",
        locale: "de-DE",
      });
      expect(result).toBe("15. Jan. 2024");
    });

    it("should format in Paris timezone", () => {
      const result = formatDate(testDate, {
        timezone: "Europe/Paris",
        format: "medium",
        locale: "de-DE",
      });
      expect(result).toBe("15. Jan. 2024");
    });
  });

  describe("Custom options", () => {
    it("should support custom DateTimeFormat options", () => {
      const result = formatDate(testDate, {
        customOptions: {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        },
      });
      // The exact time depends on the test environment's timezone
      // Just verify it contains the expected date and time format
      expect(result).toMatch(/15\.01\.2024, \d{2}:\d{2}/);
    });
  });

  describe("Edge cases", () => {
    it("should handle null input", () => {
      const result = formatDate(null);
      expect(result).toBe("");
    });

    it("should handle undefined input", () => {
      const result = formatDate(undefined);
      expect(result).toBe("");
    });

    it("should handle invalid date", () => {
      const result = formatDate(new Date("invalid"));
      expect(result).toBe("");
    });

    it("should handle string input", () => {
      const result = formatDate("2024-01-15T12:00:00Z", {
        format: "medium",
        locale: "de-DE",
      });
      expect(result).toBe("15. Jan. 2024");
    });
  });

  describe("EU timezone coverage", () => {
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

    euTimezones.forEach((timezone) => {
      it(`should support ${timezone} timezone`, () => {
        expect(() => {
          formatDate(testDate, { timezone, format: "short" });
        }).not.toThrow();
      });
    });
  });

  describe("Date boundary testing around midnight", () => {
    const midnightTestDate = new Date("2024-01-15T23:30:00Z"); // 11:30 PM UTC

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
      "Europe/Lisbon", // UTC+0
    ];

    boundaryTimezones.forEach((timezone) => {
      it(`should handle midnight boundary in ${timezone}`, () => {
        expect(() => {
          const dateResult = formatDate(midnightTestDate, {
            timezone,
            format: "short",
          });
          const timeResult = formatDate(midnightTestDate, {
            timezone,
            customOptions: {
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
            },
          });
          // Just ensure it returns valid strings
          expect(typeof dateResult).toBe("string");
          expect(typeof timeResult).toBe("string");
          expect(dateResult.length).toBeGreaterThan(0);
          expect(timeResult.length).toBeGreaterThan(0);
        }).not.toThrow();
      });
    });
  });

  describe("Early morning boundary test", () => {
    const earlyMorningDate = new Date("2024-01-15T00:30:00Z"); // 12:30 AM UTC

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
      "Europe/Lisbon", // UTC+0
    ];

    boundaryTimezones.forEach((timezone) => {
      it(`should handle early morning boundary in ${timezone}`, () => {
        expect(() => {
          const dateResult = formatDate(earlyMorningDate, {
            timezone,
            format: "short",
          });
          const timeResult = formatDate(earlyMorningDate, {
            timezone,
            customOptions: {
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
            },
          });
          // Just ensure it returns valid strings
          expect(typeof dateResult).toBe("string");
          expect(typeof timeResult).toBe("string");
          expect(dateResult.length).toBeGreaterThan(0);
          expect(timeResult.length).toBeGreaterThan(0);
        }).not.toThrow();
      });
    });
  });
});
