const colors = require('tailwindcss/colors');

module.exports = {
  purge: [],
  darkMode: false, // or 'media' or 'class'
  theme: {
    screens: {
      xs: { min: '300px', max: '500px' },
      md: { min: '500px', max: '1024px' },
      lg: { min: '1024px' },
      xl: { min: '1028px' },
      '2xl': { min: '1536px' },
    },
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
