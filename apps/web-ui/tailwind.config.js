module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#2563eb', // blue-600
          hover: '#1d4ed8',   // blue-700
        },
        positive: {
          DEFAULT: '#16a34a', // green-600
          hover: '#15803d',   // green-700
        },
        muted: {
          DEFAULT: '#cbd5e1', // slate-300
          hover: '#94a3b8',   // slate-400
        },
      },
    },
  },
  safelist: [
    // RosterPage dynamic position preference buttons
    'bg-blue-600',
    'text-blue-600',
    'border-blue-600',
    'hover:bg-blue-100',
    'bg-red-600',
    'text-red-600',
    'border-red-600',
    'hover:bg-red-100',
    'text-white',
    // Lineup color-coding
    'bg-red-100',
    'bg-blue-100',
    'bg-green-100',
    'bg-yellow-100',
    'bg-slate-100',
  ],
};
