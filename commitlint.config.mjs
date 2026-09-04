export default {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'header-max-length': [2, 'always', 100],
    'scope-enum': [
      2,
      'always',
      ['app', 'ci', 'deps', 'design', 'docs', 'protocol', 'security', 'tooling'],
    ],
  },
};
