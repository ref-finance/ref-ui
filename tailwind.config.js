const colors = require('tailwindcss/colors');

module.exports = {
  purge: [],
  darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {
      colors: {
        backgroundGray: '#F4F5F7',
        disabled: '#E6E7EB',
        primary: '#10B981',
        secondary: '#0072CE',
      },
    },
    plugins: [],
  },
};
