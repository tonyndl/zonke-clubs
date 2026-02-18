module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      [
        "babel-preset-expo",
        {
          jsxRuntime: "automatic",
          unstable_transformProfile: "hermes-stable",
        },
      ],
    ],
    plugins: ["babel-plugin-react-compiler", "react-native-reanimated/plugin"],
  };
};
