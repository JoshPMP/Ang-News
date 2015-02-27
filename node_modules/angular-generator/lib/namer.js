var changeCase = require('change-case');

module.exports = {
  controller: function (name) {
    return changeCase.pascalCase(name)
      .replace(/Ctrl$/,'')
      .replace(/Controller$/,'') + 'Ctrl';
  },
  directive: function (name) {
    return changeCase.camelCase(name);
  },
  filter: function (name) {
    return changeCase.camelCase(name);
  },
  model: function (name) {
    return changeCase.pascalCase(name);
  },
  service: function (name) {
    return changeCase.camelCase(name);
  },
  file: function (name) {
    return changeCase.camelCase(name);
  }
};