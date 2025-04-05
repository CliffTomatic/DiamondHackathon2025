// tailwind.config.js
module.exports = {
    darkMode: 'class', // or 'media' if you prefer auto-detection
    content: [
      "./app/**/*.{js,ts,jsx,tsx}",
      "./components/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
      extend: {
        // extend your theme here
        colors: {
          primary: "#1E40AF",
          secondary: "#F97316",
          accent: "#10B981",
        },
      },
    },
    plugins: [],
  }
  