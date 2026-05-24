module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      ['feat', 'fix', 'chore', 'docs', 'test', 'refactor', 'style', 'ci'],
    ],
    'subject-max-length': [2, 'always', 100],
    'subject-empty': [2, 'never'],
  },
};
