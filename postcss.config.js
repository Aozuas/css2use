export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
    "postcss-rem-to-pixel": {
      rootValue: 16,
      propList: ["*"],
    },
  },
}
