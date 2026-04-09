/**
 * PostCSS plugin that adds @tailwind directives to CSS files that use
 * @layer base/components/utilities without a matching @tailwind directive.
 * This is needed because nextra-theme-docs ships pre-compiled CSS that uses
 * @layer but no @tailwind directives, causing Tailwind's PostCSS plugin to throw.
 */
const plugin = () => ({
  postcssPlugin: "postcss-nextra-compat",
  Once(root) {
    let hasTailwindDirective = false;
    let hasLayerDirective = false;

    root.walkAtRules((atRule) => {
      if (atRule.name === "tailwind") hasTailwindDirective = true;
      if (
        atRule.name === "layer" &&
        ["base", "components", "utilities"].includes(
          atRule.params.split(",")[0].trim()
        )
      ) {
        hasLayerDirective = true;
      }
    });

    if (hasLayerDirective && !hasTailwindDirective) {
      const postcss = require("postcss");
      root.prepend(
        postcss.atRule({ name: "tailwind", params: "utilities" }),
        postcss.atRule({ name: "tailwind", params: "components" }),
        postcss.atRule({ name: "tailwind", params: "base" })
      );
    }
  },
});

plugin.postcss = true;
module.exports = plugin;
