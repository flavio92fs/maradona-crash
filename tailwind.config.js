/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx,vue}"],
  theme: {
    extend: {
      screens: {
        xs: "500px",
        "3xl": "2053px",
      },
      colors: {
        background: "#181818",
        primary: {
          DEFAULT: "#1b1c1d",
          dark: "#121212",
        },
        secondary: "#3a3b3c",
      },
    },
  },
  plugins: [require("@tailwindcss/container-queries")],
};
