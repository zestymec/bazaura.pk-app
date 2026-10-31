module.exports = {
  presets: ['module:@react-native/babel-preset'],
  env: {
    production: {
      // Strip console.* from release bundles (keeps console.error for crash reporting).
      plugins: [['transform-remove-console', { exclude: ['error'] }]],
    },
  },
};
