module.exports = {
  ...require('gts/.prettierrc.json'),
  printWidth: 100,
  overrides: [
    {
      files: '*.html',
      options: {parser: 'angular'},
    },
  ],
};
