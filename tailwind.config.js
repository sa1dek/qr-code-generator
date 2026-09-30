/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        // Brand Colors
        brand: {
          DEFAULT: "#f15827",
          hover: "#e04d1f",
          light: "#ff6b3a",
          muted: "#f1582733",
        },
        // Solid action colors for destructive / positive CTAs
        danger: {
          DEFAULT: "#e11d48",
          hover: "#be123c",
        },
        success: {
          DEFAULT: "#059669",
          hover: "#047857",
        },
        // Dark Theme Surface Colors (slate/zinc rich dark, no pitch black)
        surface: {
          950: "#060a12",  // Deepest background
          900: "#090d16",  // Main background
          850: "#0f172a",  // Card/surface background
          800: "#1e293b",  // Elevated surface
          750: "#263244",  // Hover states
          700: "#334155",  // Borders, dividers
          600: "#475569",  // Muted borders
        },
        // Page background aliases (bg-bg-primary, bg-bg-secondary, ...)
        bg: {
          primary: "#090d16",
          secondary: "#0f172a",
          tertiary: "#1e293b",
          hover: "#263244",
        },
        // Border aliases (border-border-subtle, border-border-muted, ...)
        border: {
          DEFAULT: "#334155",
          subtle: "#1e293b",   // Hairline card outlines
          muted: "#334155",    // Dividers
          secondary: "#475569", // Hover emphasis
        },
        // Text Colors (polished off-whites, never pure white)
        text: {
          primary: "#f1f5f9",    // High emphasis (slate-100 off-white)
          secondary: "#cbd5e1",  // Medium emphasis
          muted: "#94a3b8",      // Low emphasis
          disabled: "#64748b",   // Disabled
          inverse: "#0f172a",    // On brand color
          "on-accent": "#fff1f2", // On solid danger / success fills
        },
        // Status Colors (Premium translucent)
        status: {
          active: {
            bg: "#064e3b20",      // Emerald 900 @ 12%
            text: "#34d399",      // Emerald 400
            border: "#065f4640",  // Emerald 800 @ 25%
            icon: "#34d399",
          },
          unassigned: {
            bg: "#78350f20",      // Amber 900 @ 12%
            text: "#fbbf24",      // Amber 400
            border: "#92400e40",  // Amber 800 @ 25%
            icon: "#fbbf24",
          },
          inactive: {
            bg: "#1e293b20",      // Slate 800 @ 12%
            text: "#94a3b8",      // Slate 400
            border: "#33415540",  // Slate 700 @ 25%
            icon: "#94a3b8",
          },
          danger: {
            bg: "#7f1d1d20",      // Rose 900 @ 12%
            text: "#fb7185",      // Rose 400
            border: "#9f123940",  // Rose 800 @ 25%
            icon: "#fb7185",
          },
          info: {
            bg: "#1e3a5f20",      // Blue 900 @ 12%
            text: "#60a5fa",      // Blue 400
            border: "#1e40af40",  // Blue 800 @ 25%
            icon: "#60a5fa",
          },
          warning: {
            bg: "#78350f20",      // Amber 900 @ 12%
            text: "#fbbf24",      // Amber 400
            border: "#92400e40",  // Amber 800 @ 25%
            icon: "#fbbf24",
          },
        },
        // Overlay
        overlay: {
          light: "#00000066",
          medium: "#00000080",
          heavy: "#000000cc",
        },
      },
      borderRadius: {
        none: "0",
        sm: "6px",
        DEFAULT: "8px",
        md: "10px",
        lg: "12px",
        xl: "14px",
        "2xl": "16px",
        "3xl": "20px",
        full: "9999px",
      },
      boxShadow: {
        "2xs": "0 1px 2px 0 rgb(2 6 23 / 0.4)",
        xs: "0 1px 3px 0 rgb(2 6 23 / 0.45), 0 1px 2px -1px rgb(2 6 23 / 0.35)",
        sm: "0 3px 6px -1px rgb(2 6 23 / 0.5), 0 2px 4px -2px rgb(2 6 23 / 0.35)",
        DEFAULT:
          "0 6px 12px -2px rgb(2 6 23 / 0.55), 0 3px 7px -3px rgb(2 6 23 / 0.4)",
        md: "0 10px 20px -3px rgb(2 6 23 / 0.6), 0 4px 6px -4px rgb(2 6 23 / 0.4)",
        lg: "0 20px 25px -5px rgb(2 6 23 / 0.65), 0 8px 10px -6px rgb(2 6 23 / 0.45)",
        xl: "0 25px 50px -12px rgb(2 6 23 / 0.7)",
        "inner-sm": "inset 0 2px 4px 0 rgb(2 6 23 / 0.45)",
        inner: "inset 0 4px 8px 0 rgb(2 6 23 / 0.5)",
        
      },
      borderWidth: {
        "0": "0",
        "hairline": "0.5px",
        DEFAULT: "1px",
        "2": "2px",
      },
      spacing: {
        "0": "0",
        "0.5": "0.125rem",
        "1": "0.25rem",
        "1.5": "0.375rem",
        "2": "0.5rem",
        "2.5": "0.625rem",
        "3": "0.75rem",
        "3.5": "0.875rem",
        "4": "1rem",
        "5": "1.25rem",
        "6": "1.5rem",
        "7": "1.75rem",
        "8": "2rem",
        "9": "2.25rem",
        "10": "2.5rem",
        "12": "3rem",
        "14": "3.5rem",
        "16": "4rem",
        "20": "5rem",
        "24": "6rem",
      },
      fontSize: {
        "2xs": ["0.625rem", { lineHeight: "0.875rem" }],
        xs: ["0.75rem", { lineHeight: "1rem" }],
        sm: ["0.875rem", { lineHeight: "1.25rem" }],
        base: ["1rem", { lineHeight: "1.5rem" }],
        lg: ["1.125rem", { lineHeight: "1.75rem" }],
        xl: ["1.25rem", { lineHeight: "1.75rem" }],
        "2xl": ["1.5rem", { lineHeight: "2rem" }],
        "3xl": ["1.875rem", { lineHeight: "2.25rem" }],
        "4xl": ["2.25rem", { lineHeight: "2.5rem" }],
      },
      transitionDuration: {
        "0": "0ms",
        "50": "50ms",
        "75": "75ms",
        "100": "100ms",
        "150": "150ms",
        "200": "200ms",
        "250": "250ms",
        "300": "300ms",
        "400": "400ms",
        "500": "500ms",
        "700": "700ms",
        "1000": "1000ms",
      },
      transitionTimingFunction: {
        "ease-in-expo": "cubic-bezier(0.95, 0.05, 0.795, 0.035)",
        "ease-out-expo": "cubic-bezier(0.19, 1, 0.22, 1)",
        "ease-in-out-expo": "cubic-bezier(1, 0, 0, 1)",
        "spring": "cubic-bezier(0.34, 1.56, 0.64, 1)",
      },
      zIndex: {
        "0": "0",
        "10": "10",
        "20": "20",
        "30": "30",
        "40": "40",
        "50": "50",
        "60": "60",
        "70": "70",
        "80": "80",
        "90": "90",
        "100": "100",
        dropdown: "1000",
        sticky: "1100",
        modal: "1300",
        popover: "1400",
        tooltip: "1500",
        toast: "1700",
      },
    },
  },
  plugins: [],
};