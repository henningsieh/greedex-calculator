/**
 * Number of steps in the project creation/editing form.
 * Step 1: Project details, Step 2: Project Shared Travel
 */
export const PROJECT_FORM_STEPS = {
  PROJECT_DETAILS: 1,
  PROJECT_SHARED_TRAVEL: 2,
} as const;

/**
 * Constants for project form configuration
 */
export const PROJECT_FORM_TOTAL_STEPS = Object.keys(PROJECT_FORM_STEPS).length;
