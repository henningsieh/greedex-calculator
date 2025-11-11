// Test the actual formatDate function from utils
// Run with: npx tsx test-formatdate-function.ts

import { formatDate } from "./src/lib/utils";

console.log("🧪 TESTING formatDate FUNCTION FROM UTILS");
console.log("========================================");

// Test basic functionality
const testDate = "2025-11-10T12:00:00.000Z";

console.log(`\n📅 Test Date: ${testDate}`);
console.log(`Expected: Noon UTC on November 10, 2025`);

console.log(`\n🧪 Basic Tests:`);
console.log(`formatDate(testDate): "${formatDate(testDate)}"`);
console.log(`formatDate(null): "${formatDate(null)}"`);
console.log(`formatDate(undefined): "${formatDate(undefined)}"`);
console.log(`formatDate(""): "${formatDate("")}"`);
console.log(`formatDate(new Date()): "${formatDate(new Date())}"`);

console.log(`\n🧪 Format Options:`);
console.log(`Short: "${formatDate(testDate, { format: "short" })}"`);
console.log(`Medium: "${formatDate(testDate, { format: "medium" })}"`);
console.log(`Long: "${formatDate(testDate, { format: "long" })}"`);
console.log(`Full: "${formatDate(testDate, { format: "full" })}"`);

console.log(`\n🧪 Timezone Options:`);
console.log(`UTC: "${formatDate(testDate, { timezone: "utc" })}"`);
console.log(`Local: "${formatDate(testDate, { timezone: "local" })}"`);

console.log(`\n🧪 Locale Options:`);
console.log(`German: "${formatDate(testDate, { locale: "de-DE" })}"`);
console.log(`French: "${formatDate(testDate, { locale: "fr-FR" })}"`);
console.log(`Portuguese: "${formatDate(testDate, { locale: "pt-PT" })}"`);
console.log(`Bulgarian: "${formatDate(testDate, { locale: "bg-BG" })}"`);

console.log(`\n🧪 Custom Options:`);
console.log(
  `Custom (weekday): "${formatDate(testDate, {
    customOptions: {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    },
  })}"`,
);

console.log(`\n✅ formatDate function test completed!`);
console.log(`If you see formatted dates above, the function works correctly.`);
