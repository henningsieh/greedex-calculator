/**
 * Workshops Configuration
 *
 * Metadata configuration for workshops (static data only - no i18n content)
 * All translatable content is in messages/[locale].json under landingPage.workshops
 */

/**
 * External link URLs (not internal routes, those are handled by next-intl)
 */
export const WORKSHOP_LINKS = {
  erasmusCalculator:
    "https://erasmus-plus.ec.europa.eu/resources-and-tools/distance-calculator",
  googleMaps: "https://www.google.com/maps",
  eForest: "https://greendex.world/e-forest",
  challengesDescription:
    "https://greendex.world/wp-content/uploads/2023/05/02-Challenges-Description.pdf",
  challengesPresentation:
    "https://greendex.world/wp-content/uploads/2023/05/02-Challenges-Presentation.pdf",
  greendexWebsite: "https://www.greendex.world/",
} as const;

/**
 * Workshop metadata (images and structure)
 */
const WORKSHOP_CONFIGS = [
  {
    id: "moment",
    name: "Greendex Moment",
    image: "/workshops/workshop-moment.jpg",
  },
  { id: "deal", name: "Greendex Deal", image: "/workshops/workshop-deal.jpg" },
  { id: "day", name: "Greendex Day", image: "/workshops/workshop-day.jpg" },
] as const;

type WorkshopId = (typeof WORKSHOP_CONFIGS)[number]["id"];

interface Workshop {
  id: WorkshopId;
  name: string;
  image: string;
}

class WorkshopArray extends Array<Workshop> {
  MOMENT: Workshop;
  DEAL: Workshop;
  DAY: Workshop;

  constructor() {
    super();
    for (const config of WORKSHOP_CONFIGS) {
      this.push(config);
    }
    this.MOMENT = this[0];
    this.DEAL = this[1];
    this.DAY = this[2];
  }
}

export const WORKSHOPS = new WorkshopArray();
