module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      ['babel-preset-expo', {
        unstable_transformImportMeta: true
      }]
    ],
    plugins: [
      'react-native-reanimated/plugin',
      [
        'module-resolver',
        {
          alias: {
            '@/hooks/*': './app/hooks/*', // Ensure wildcard matching for hooks
            '@/hooks': './app/hooks', // Keep the directory alias for direct folder imports
            stream: 'stream-browserify',
            'react-dom/server': './emptyModule.js', // Alias react-dom/server to an empty module
          },
        },
      ],
    ],
  };
}; 