const path = require('path');
const glob = require('glob');

// Get the supported languages by looking for translations in the `lang/` dir.
module.exports = [
  'en', // Ensure English is always first in the list
  ...glob
    .sync(path.join(__dirname, '../lang/*.json'))
    .map(f => path.basename(f, '.json'))
    .filter(locale => locale !== 'en'),
];
