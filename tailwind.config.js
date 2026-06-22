export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        apple: {
          primary: "#0066cc",
          "primary-focus": "#0071e3",
          "primary-on-dark": "#2997ff",
          ink: "#1d1d1f",
          body: "#1d1d1f",
          "body-on-dark": "#ffffff",
          "body-muted": "#cccccc",
          "ink-muted-80": "#333333",
          "ink-muted-48": "#7a7a7a",
          "divider-soft": "#f0f0f0",
          hairline: "#e0e0e0",
          canvas: "#ffffff",
          "canvas-parchment": "#f5f5f7",
          "surface-pearl": "#fafafc",
          "surface-tile-1": "#272729",
          "surface-tile-2": "#2a2a2c",
          "surface-tile-3": "#252527",
          "surface-black": "#000000",
          "surface-chip-translucent": "rgba(210, 210, 215, 0.64)",
        },
      },
      fontFamily: {
        sans: ["SF Pro Text", "Inter", "system-ui", "-apple-system", "BlinkMacSystemFont", "sans-serif"],
        display: ["SF Pro Display", "Inter", "system-ui", "-apple-system", "BlinkMacSystemFont", "sans-serif"],
      },
      borderRadius: {
        apple: {
          xs: "5px",
          sm: "8px",
          md: "11px",
          lg: "18px",
        },
      },
    },
  },
  plugins: [],
};

