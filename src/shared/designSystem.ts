/**
 * ClassConnect Pro Design System — "Cobalt Core" (2026 edition).
 *
 * A confident cobalt/indigo brand on elevated warm-slate neutrals, built for an
 * education operating system used all day by admins & teachers and on the go by
 * parents & students: bento layout, soft low-opacity elevation (hairline border
 * + blur, not heavy drop shadows), large rounded corners, and gradients/glow
 * reserved for the AI-insight layer and login/marketing. Same token *structure*
 * as the reference system so the shared/ui kit ports cleanly — only values change.
 *
 * `teal` is kept as an alias mapped to the cobalt brand so ported components
 * that reference palette.teal.* render on-brand without a rename sweep.
 */

// Cobalt Core — brand + action.
const cobaltRamp = {
  900: "#1A2A6E",
  800: "#1B2F8C",
  700: "#1D36B4",
  600: "#2544DB", // primary button / active nav
  500: "#3A5BF0", // brand base / logo
  400: "#5C7CFB",
  300: "#93AEFF",
  200: "#BFD0FF",
  100: "#DDE7FF",
  50: "#EEF3FF",
} as const;

// Aurora Violet — AI/insight layer only.
const violetRamp = {
  900: "#4C1D95",
  800: "#5B21B6",
  700: "#6D28D9",
  600: "#7C3AED",
  500: "#8B5CF6",
  400: "#A78BFA",
  300: "#C4B5FD",
  200: "#DDD6FE",
  100: "#EDE9FE",
  50: "#F5F3FF",
} as const;

export const palette = {
  // Primary ink — elevated warm-slate (cool-warm balanced, calm all-day text)
  ink: {
    900: "#0E121A",
    800: "#161B24",
    700: "#232A36",
    600: "#343C4B",
    500: "#4B5566",
    400: "#6B7688",
    300: "#9AA4B8",
    200: "#CBD3E1",
    100: "#E1E6EF",
    50: "#EEF1F6",
  },

  // Primary brand — cobalt. `teal` is an alias so ported UI stays on-brand.
  cobalt: cobaltRamp,
  teal: cobaltRamp,

  // Accent — aurora violet (AI insights, secondary highlights)
  violet: violetRamp,

  // Elevated warm-slate surfaces
  neutral: {
    0: "#FFFFFF",
    50: "#F6F8FB",
    100: "#EEF1F6",
    200: "#E1E6EF",
    300: "#CBD3E1",
    400: "#9AA4B8",
    500: "#6B7688",
    600: "#4B5566",
    700: "#343C4B",
    800: "#161B24",
    900: "#0E121A",
  },

  surface: {
    primary: "#FFFFFF",
    secondary: "#F6F8FB",
    tertiary: "#EEF1F6",
    raised: "#FFFFFF",
    sunken: "#E9EDF4",
    dark: "#0E121A",
    darkRaised: "#161B24",
  },

  text: {
    primary: "#0E121A",
    secondary: "#343C4B",
    tertiary: "#6B7688",
    disabled: "#9AA4B8",
    inverse: "#FFFFFF",
    accent: "#2544DB",
    link: "#2544DB",
  },

  border: {
    subtle: "#EEF1F6",
    default: "#E1E6EF",
    strong: "#CBD3E1",
    focus: "#5C7CFB",
    dark: "#343C4B",
  },

  // Semantic — attendance / fees / exam states (icon + label always paired)
  success: { bg: "#ECFDF5", text: "#059669", border: "#A7F3D0" }, // present / paid / pass
  warning: { bg: "#FFFBEB", text: "#D97706", border: "#FDE68A" }, // low attendance / due soon
  danger: { bg: "#FEF2F2", text: "#DC2626", border: "#FECACA" }, // absent / overdue / fail
  info: { bg: "#F0F9FF", text: "#0284C7", border: "#BAE6FD" }, // announcement / notice
} as const;

export const spacing = {
  "0": 0,
  px: 1,
  "0.5": 2,
  "1": 4,
  "1.5": 6,
  "2": 8,
  "2.5": 10,
  "3": 12,
  "3.5": 14,
  "4": 16,
  "5": 20,
  "6": 24,
  "7": 28,
  "8": 32,
  "9": 36,
  "10": 40,
  "12": 48,
  "14": 56,
  "16": 64,
  "20": 80,
} as const;

// Soft, rounded corners for the clinical / minimal language.
export const radius = {
  xs: 6,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  "2xl": 24,
  "3xl": 28,
  full: 9999,
} as const;

// Thin, light hairline outline (replaces the farm's heavy 2px black outline).
export const outline = { width: 1, color: "#E2E8F0" } as const;

export const typography = {
  display: {
    large: {
      fontSize: 40,
      lineHeight: 48,
      fontWeight: "700" as const,
      letterSpacing: -0.5,
    },
    medium: {
      fontSize: 32,
      lineHeight: 40,
      fontWeight: "700" as const,
      letterSpacing: -0.4,
    },
    small: {
      fontSize: 28,
      lineHeight: 36,
      fontWeight: "700" as const,
      letterSpacing: -0.3,
    },
  },
  heading: {
    h1: {
      fontSize: 24,
      lineHeight: 30,
      fontWeight: "700" as const,
      letterSpacing: -0.4,
    },
    h2: {
      fontSize: 20,
      lineHeight: 26,
      fontWeight: "600" as const,
      letterSpacing: -0.3,
    },
    h3: {
      fontSize: 17,
      lineHeight: 22,
      fontWeight: "600" as const,
      letterSpacing: -0.2,
    },
    h4: {
      fontSize: 15,
      lineHeight: 20,
      fontWeight: "600" as const,
      letterSpacing: -0.1,
    },
  },
  body: {
    large: { fontSize: 17, lineHeight: 26, fontWeight: "400" as const },
    default: { fontSize: 15, lineHeight: 22, fontWeight: "400" as const },
    small: { fontSize: 13, lineHeight: 18, fontWeight: "400" as const },
  },
  label: {
    large: {
      fontSize: 15,
      lineHeight: 20,
      fontWeight: "600" as const,
      letterSpacing: -0.1,
    },
    medium: {
      fontSize: 13,
      lineHeight: 18,
      fontWeight: "600" as const,
      letterSpacing: 0,
    },
    small: {
      fontSize: 11,
      lineHeight: 16,
      fontWeight: "600" as const,
      letterSpacing: 0.2,
    },
  },
  caption: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "500" as const,
    letterSpacing: 0.1,
  },
  overline: {
    fontSize: 11,
    lineHeight: 16,
    fontWeight: "700" as const,
    letterSpacing: 1.2,
    textTransform: "uppercase" as const,
  },
} as const;

// Soft, blurred elevation (clinical depth) — replaces the farm's hard offsets.
const soft = (y: number, radius: number, opacity: number, elev: number) => ({
  shadowColor: "#0F172A",
  shadowOffset: { width: 0, height: y },
  shadowOpacity: opacity,
  shadowRadius: radius,
  elevation: elev,
});

export const shadows = {
  none: {},
  xs: soft(1, 2, 0.05, 1),
  sm: soft(2, 6, 0.07, 2),
  md: soft(4, 12, 0.09, 4),
  lg: soft(8, 22, 0.11, 8),
  xl: soft(14, 34, 0.14, 14),
} as const;

export const elevation = {
  base: shadows.xs,
  raised: shadows.sm,
  floating: shadows.md,
  overlay: shadows.lg,
} as const;

export const motion = {
  duration: { fast: 150, medium: 250, slow: 400 },
  spring: {
    gentle: { damping: 18, stiffness: 180 },
    default: { damping: 20, stiffness: 220 },
    bouncy: { damping: 12, stiffness: 200 },
    crisp: { damping: 25, stiffness: 300 },
  },
} as const;

/** Gradients — cobalt sweeps + the AI (cobalt→violet) allowance. */
export const gradients = {
  hero: ["#2544DB", "#1D36B4", "#1A2A6E"] as const, // cobalt hero
  teal: ["#3A5BF0", "#2544DB"] as const, // brand alias (kept for ported UI)
  cobalt: ["#3A5BF0", "#2544DB", "#1D36B4"] as const,
  ai: ["#3A5BF0", "#8B5CF6"] as const, // AI-insight layer only
  light: ["#FFFFFF", "#F6F8FB"] as const,
  mist: ["#EEF3FF", "#F5F3FF"] as const,
} as const;

/** Glass — translucent frosted panels for overlays over gradients/imagery. */
export const glass = {
  light: {
    backgroundColor: "rgba(255,255,255,0.16)",
    borderColor: "rgba(255,255,255,0.28)",
    borderWidth: 1,
  },
  lighter: {
    backgroundColor: "rgba(255,255,255,0.10)",
    borderColor: "rgba(255,255,255,0.18)",
    borderWidth: 1,
  },
  dark: {
    backgroundColor: "rgba(15,23,42,0.30)",
    borderColor: "rgba(255,255,255,0.12)",
    borderWidth: 1,
  },
} as const;

export const layout = {
  screenPadding: 20,
  cardPadding: 20,
  sectionGap: 28,
  itemGap: 12,
  sidebarWidth: 264,
  sidebarCollapsedWidth: 76,
  tabBarHeight: 72,
  tabBarClearance: 96,
  chipHeight: 36,
  chipRowHeight: 44,
  contentMaxWidth: 1200,
  // Width at/above which the layout switches to the desktop sidebar shell.
  wideBreakpoint: 900,
} as const;
