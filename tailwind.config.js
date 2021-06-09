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
        inputBg: colors.gray['100'],
        inputText: '#374151',
        hoverGray: '#F3F4F6',
        buttonBg: '#10B981',
        buttonText: '#F9FAFB',
        greenLight: '#00C08B',
        greenOpacity100: 'rgba(2, 109, 97, 1)',
        whiteOpacity85: 'rgba(255, 255, 255, 0.85)',
        blackLight: '#003648',
      },
    },
    plugins: [],
  },
  variants: {
    extend: {
      opacity: ['disabled'],
      borderWidth: ['hover'],
      cursor: ['disabled'],
      padding: ['last'],
    },
  },
};
