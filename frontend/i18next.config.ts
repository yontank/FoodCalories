export default {
  locales: [
    "en",
    "he"
  ],
  extract: {
    input: "src/**/!(ui)/*.{ts,tsx,js,jsx}",
    output: "public/locales/{{language}}/{{namespace}}.json"
  }
}