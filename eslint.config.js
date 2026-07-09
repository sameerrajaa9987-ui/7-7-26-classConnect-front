// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require("eslint/config");
const expoConfig = require("eslint-config-expo/flat");

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ["dist/*"],
  },
  {
    rules: {
      // The app uses a deliberate, app-wide pattern of resetting/pre-filling
      // form state when a modal opens or its `editX` prop changes
      //   useEffect(() => { if (!visible) return; setForm(prefill); }, [visible, editX])
      // which this (opinionated, recently-added) rule flags. It's a perf hint,
      // not a correctness issue, and the effects are guarded by their deps so
      // they don't loop. Disabled project-wide to match the established pattern.
      "react-hooks/set-state-in-effect": "off",
    },
  },
]);
