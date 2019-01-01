module.exports = {
    "env": {
      "node": true,
      "browser": true,
      "commonjs": true,
      "es6": true
    },
    "extends": "eslint:recommended",
    "parserOptions": {
        "ecmaVersion": 2018
    },
    "rules": {
      "no-console": [2, { "allow": ["info", "error"] }],
      "indent": [
        "error",
        2
      ],
      "linebreak-style": [
        "error",
        "unix"
      ],
      "quotes": [
        "error",
        "single"
      ],
      "semi": [
        "error",
        "always"
      ]
    }
};
