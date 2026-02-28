module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Bebas Neue"', 'sans-serif'],
        sans: ['Nunito', 'system-ui', 'sans-serif'],
      },
      colors: {
        primary: {
          DEFAULT: '#15803d', // green-700
          hover: '#166534',   // green-800
        },
        positive: {
          DEFAULT: '#16a34a', // green-600
          hover: '#15803d',   // green-700
        },
        muted: {
          DEFAULT: '#cbd5e1', // slate-300
          hover: '#94a3b8',   // slate-400
        },
        accent: {
          DEFAULT: '#f59e0b', // amber-500
          light: '#fffbeb',   // amber-50
          border: '#fbbf24',  // amber-400
        },
        surface: '#ffffff',
        field: '#f8fafc',     // slate-50
        danger: {
          DEFAULT: '#dc2626', // red-600
          light: '#fef2f2',   // red-50
          border: '#fecaca',  // red-200
        },
      },
    },
  },
  safelist: [],
};
