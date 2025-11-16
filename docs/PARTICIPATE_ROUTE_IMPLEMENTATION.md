# Public Participation Route Implementation

## Overview
This document describes the implementation of the public participant interface for the Greendex 2.0 CO₂ Calculator at `/project/[id]/participate`.

## Route Location
```
src/app/[locale]/(app)/(public participation)/project/[id]/participate/
├── layout.tsx  (Fixed to properly return children)
└── page.tsx    (Main route entry point)
```

## Components Structure

### Main Components
```
src/components/participate/
├── participate-form.tsx          (Main orchestrator component)
└── steps/
    ├── welcome-step.tsx          (Step 1: Welcome and participant info)
    ├── transport-step.tsx        (Step 2: Transport mode selection)
    ├── accommodation-step.tsx    (Step 3: Accommodation details)
    └── review-step.tsx           (Step 4: Review and submit)
```

## Features Implemented

### 1. Multi-Step Form Flow
- **Progress Bar**: Visual indicator showing completion percentage
- **Step Indicators**: Numbered badges with check marks for completed steps
- **Navigation**: Back/Continue buttons with proper state management
- **Form State**: Centralized state management for all form data

### 2. Welcome Step
**Purpose**: Introduce the project and collect basic participant information

**Features**:
- Project details display:
  - Project name
  - Location with icon
  - Date range formatted nicely
  - Country
  - Optional welcome message
- Participant form:
  - Name input (required)
  - Country input (required)
- "Start Greendex" CTA button
- Greendex branding with leaf icon

**Design Elements**:
- Gradient badges (emerald/teal theme)
- Project detail cards with icons
- Form validation
- Disabled state for incomplete forms

### 3. Transport Step
**Purpose**: Collect all transportation modes used to reach the project

**Features**:
- Transport mode selection:
  - Car (with Car icon)
  - Bus (with Bus icon)
  - Train (with Train icon)
  - Boat/Ferry (with Ship icon)
- Distance input in kilometers
- Add multiple transport entries
- Remove transport entries
- Total distance calculation
- Visual list of added journeys

**Design Elements**:
- Icon-based transport selection buttons
- Active state highlighting (teal border and background)
- Dynamic list with delete buttons
- Summary panel showing total distance
- Helper text for using distance calculators

### 4. Accommodation Step
**Purpose**: Collect accommodation details for full carbon footprint calculation

**Features**:
- Accommodation type selection:
  - Hotel
  - Hostel
  - Airbnb/Apartment
  - Camping
- Number of nights input
- Energy source selection:
  - Conventional Energy
  - Green Energy
- Summary panel showing selections

**Design Elements**:
- Icon-based accommodation type buttons
- Radio group for energy selection
- Form validation
- Helper text for uncertain data

### 5. Review Step
**Purpose**: Display summary and calculate CO₂ emissions

**Features**:
- Participant information summary
- Transport breakdown with individual CO₂ calculations
- Accommodation details
- **Total CO₂ calculation** using emission factors:
  - Car: 0.192 kg CO₂/km
  - Bus: 0.089 kg CO₂/km
  - Train: 0.041 kg CO₂/km
  - Boat: 0.115 kg CO₂/km
- **Trees needed calculation**: Based on 22kg CO₂/year absorption
- Submit button

**Design Elements**:
- Gradient summary cards
- Icon-based information display
- Large, prominent CO₂ and tree statistics
- Info box with context
- Professional review layout

## Styling & Design

### Color Scheme
- **Primary gradient**: Teal (500) to Emerald (500)
- **Accent colors**: Cyan, Green variants
- **Background**: Semi-transparent cards with backdrop blur
- **Borders**: Primary color with low opacity (20-30%)

### Typography
- **Headers**: Bold, large text (2xl-4xl)
- **Body**: Muted foreground for secondary text
- **Numbers**: Large, bold, colored (teal/emerald/green)

### Components Used
- shadcn/ui components:
  - Button (with variants)
  - Card
  - Input
  - Label
  - RadioGroup
  - Skeleton (for loading states)
- Lucide React icons
- Tailwind CSS for styling

## Technical Implementation

### Type Safety
```typescript
interface TransportData {
  type: ActivityType; // "car" | "bus" | "train" | "boat"
  distanceKm: number;
}

interface AccommodationData {
  type: string;
  nights: number;
  energyType: string;
}

interface ParticipantFormData {
  participantName: string;
  participantCountry: string;
  transports: TransportData[];
  accommodation: AccommodationData | null;
}
```

### State Management
- React `useState` for form state
- Step-based navigation with array indexing
- Forward/backward navigation support
- Form validation at each step

### CO₂ Calculation
```typescript
const totalCO2 = transports.reduce((sum, transport) => {
  const co2Factor = CO2_FACTORS[transport.type];
  return sum + transport.distanceKm * co2Factor;
}, 0);

const treesNeeded = Math.ceil(totalCO2 / 22);
```

## Testing the Route

### Access URL
Once the dev server is running with proper environment variables:
```
http://localhost:3000/en/project/[any-project-id]/participate
```

Example:
```
http://localhost:3000/en/project/test-project-123/participate
```

### Test Flow
1. **Welcome Step**:
   - See project details
   - Enter name and country
   - Click "Start Greendex"

2. **Transport Step**:
   - Select a transport mode
   - Enter distance
   - Click + to add
   - Add multiple transports
   - Click Continue

3. **Accommodation Step**:
   - Select accommodation type
   - Enter number of nights
   - Select energy type
   - Click Continue

4. **Review Step**:
   - Review all information
   - See calculated CO₂ emissions
   - See trees needed
   - Click Submit (logs to console for now)

### Current Limitations (As Designed)
- **Mock Project Data**: Page uses hardcoded project data (TODO: fetch from database)
- **No Backend Integration**: Submit button logs to console (TODO: integrate with backend/socket.io)
- **No Authentication Check**: Public route, no auth required (layout prepared for future auth)
- **No Error Handling**: Basic validation only (TODO: add comprehensive error handling)

## Future Enhancements
1. Connect to actual project database
2. Implement real-time submission via socket.io
3. Add participant authentication/session
4. Display live leaderboard after submission
5. Add success screen with certificate/badge
6. Implement email notifications
7. Add multi-language support via next-intl
8. Add analytics tracking
9. Implement error boundaries
10. Add loading states for async operations

## Files Modified/Created

### New Files (7)
1. `src/app/[locale]/(app)/(public participation)/project/[id]/participate/page.tsx`
2. `src/components/participate/participate-form.tsx`
3. `src/components/participate/steps/welcome-step.tsx`
4. `src/components/participate/steps/transport-step.tsx`
5. `src/components/participate/steps/accommodation-step.tsx`
6. `src/components/participate/steps/review-step.tsx`
7. `docs/PARTICIPATE_ROUTE_IMPLEMENTATION.md` (this file)

### Modified Files (1)
1. `src/app/[locale]/(app)/(public participation)/project/[id]/participate/layout.tsx`
   - Fixed to properly return children
   - Renamed function to `PublicParticipateLayout`
   - Added params destructuring

## Compliance

### Code Quality
- ✅ TypeScript strict mode compliant
- ✅ Biome linting passes
- ✅ No unused imports or variables
- ✅ Proper type annotations
- ✅ Consistent naming conventions

### Accessibility
- ✅ Semantic HTML
- ✅ Label associations
- ✅ ARIA attributes where needed
- ✅ Keyboard navigation support
- ✅ Focus management

### Responsive Design
- ✅ Mobile-first approach
- ✅ Responsive grid layouts
- ✅ Flexible card layouts
- ✅ Touch-friendly buttons
- ✅ Readable text at all sizes

## Screenshots
(Screenshots would be added here after testing with dev server)

## Related Components
- `src/components/participate/types.ts` - Type definitions and CO₂ factors
- `src/components/participate/transport-icon.tsx` - Transport mode icons
- `src/components/participate/leaderboard.tsx` - For future integration
- `src/components/participate/stats-overview.tsx` - For future integration
