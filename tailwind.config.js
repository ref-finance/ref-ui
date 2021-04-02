const colors = require('tailwindcss/colors');

module.exports = {
  purge: [],
  darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {
      colors: {
        primary: '#10B981',
        primaryScale: colors.green,
        secondary: '#F9FAFB',
        secondaryScale: colors.gray,
        darkText: colors.gray['600'],
        inputBg: '#F9FAFB',
        inputText: '#374151',
        hoverGray: '#F3F4F6',
        buttonBg: '#10B981',
        buttonText: '#F9FAFB',
      },
    },
    plugins: [],
  },
  variants: {
    extend: {
      opacity: ['disabled'],
      borderWidth: ['hover'],
      cursor: ['disabled'],
    },
  },
};
