/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: {
          main: "#135BEC",
          light: "#4A7EF0",
          dark: "#0D47B8",
        },
        background: {
          primary: "#0A1628",
          secondary: "#0F1F38",
          tertiary: "#152840",
        },
        text: {
          primary: "#FFFFFF",
          secondary: "#94A3B8",
          tertiary: "#64748B",
        },
        status: {
          success: "#10B981",
          error: "#EF4444",
          warning: "#F59E0B",
          info: "#3B82F6",
        },
        ui: {
          border: "#1E293B",
          divider: "#334155",
          overlay: "rgba(0, 0, 0, 0.5)",
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
