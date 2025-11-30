// Single source of truth for activity types
export const activityTypeValues = ["boat", "bus", "train", "car"] as const;
export type ActivityType = (typeof activityTypeValues)[number];
