// tailwind.config.js
module.exports = {
  purge: [],
  darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {
      fontFamily: {
        inter: ["inter", "sans-serif"],
      },
      borderColor: {
        borderGray: "#D3D6DB",
      },
      colors: {
        backgroundGray: "#F4F5F7",
        disabledGray: "#E6E7EB",
      },
      keyframes: {
        float: {
          "50%": { transform: "translate(0, 20px)" },
        },
      },
      animation: {
        float: "float 7.5s ease-in-out infinite",
      },
      minWidth: {
        25: "25rem",
      },
    },
  },
  variants: {
    extend: {
      backgroundColor: ["#F4F5F7"],
      textColor: ["disabled"],
    },
  },
  plugins: [],
};
