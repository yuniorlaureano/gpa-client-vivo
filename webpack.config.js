// webpack.config.js
const purgecss = require("@fullhuman/postcss-purgecss");
const cssnano = require("cssnano");

module.exports = {
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [
          "style-loader",
          "css-loader",
          {
            loader: "postcss-loader",
            options: {
              postcssOptions: {
                plugins: [
                  purgecss({
                    content: ["./src/**/*.html", "./src/**/*.ts"],
                    defaultExtractor: (content) =>
                      content.match(/[\w-/:]+(?<!:)/g) || [],
                  }),
                  cssnano({
                    preset: "default",
                  }),
                ],
              },
            },
          },
        ],
      },
    ],
  },
};
