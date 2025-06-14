export default {
  "*.{ts,tsx}": [
    "prettier --write",
    "eslint --fix --max-warnings 0"
  ],
  "*.{js,jsx}": [
    "prettier --write",
    "eslint --fix --max-warnings 0"
  ],
  "*.{json,md,yml,yaml}": [
    "prettier --write"
  ],
  "*.{css,scss}": [
    "prettier --write"
  ]
};