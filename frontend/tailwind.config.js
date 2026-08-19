/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}", "./public/index.html"],
  theme: {
    extend: {
      colors: {
        ink: "#1B1B1F",
        "ink-soft": "#4A4842",
        paper: "#EFEDE4",
        "paper-raised": "#F7F5EE",
        "paper-dim": "#E4E0D2",
        line: "#CAC4B1",
        brick: {
          DEFAULT: "#A5372A",
          dark: "#7E2A20",
          light: "#C25A46",
        },
        mustard: {
          DEFAULT: "#C9971E",
          dark: "#9C7515",
          light: "#E3B646",
        },
        denim: {
          DEFAULT: "#2B4570",
          dark: "#1E3253",
          light: "#5D7BAA",
        },
        olive: "#4C6444",
      },
      fontFamily: {
        display: ["Fraunces", "ui-serif", "Georgia", "serif"],
        body: ["'Source Serif 4'", "ui-serif", "Georgia", "serif"],
        mono: ["'IBM Plex Mono'", "ui-monospace", "monospace"],
      },
      backgroundImage: {
        noise: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.035'/%3E%3C/svg%3E\")",
      },
      boxShadow: {
        clip: "2px 3px 0 0 rgba(27,27,31,0.15)",
        card: "0 1px 0 0 rgba(27,27,31,0.08)",
      },
    },
  },
  plugins: [],
};
