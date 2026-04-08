/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        primary: {
          main: "#135BEC",
          light: "#4A7EF0",
          dark: "#0D47B8",
        },
        background: {
          primary: "var(--color-bg-primary)",
          secondary: "var(--color-bg-secondary)",
          tertiary: "var(--color-bg-tertiary)",
        },
        text: {
          primary: "var(--color-text-primary)",
          secondary: "var(--color-text-secondary)",
          tertiary: "var(--color-text-tertiary)",
        },
        surface: {
          card: "var(--color-surface-card)",
          hover: "var(--color-surface-hover)",
        },
        status: {
          success: "#10B981",
          error: "#EF4444",
          warning: "#F59E0B",
          info: "#3B82F6",
        },
        ui: {
          border: "var(--color-ui-border)",
          divider: "var(--color-ui-divider)",
          overlay: "rgba(0, 0, 0, 0.5)",
        },
        accent: {
          orange: "#F97316",
          green: "#22C55E",
        },
        border: {
          primary: "var(--color-ui-border)",
          subtle: "var(--color-ui-border)",
        },
      },
      spacing: {
        xs: "4px",
        sm: "8px",
        md: "16px",
        lg: "24px",
        xl: "32px",
        xxl: "48px",
        xxxl: "64px",
      },
      borderRadius: {
        sm: "4px",
        md: "8px",
        lg: "12px",
        xl: "16px",
        xxl: "24px",
        full: "9999px",
      },
      fontSize: {
        xs: "12px",
        sm: "14px",
        md: "16px",
        lg: "18px",
        xl: "20px",
        xxl: "24px",
        xxxl: "32px",
      },
    },
  },
  plugins: [],
};
