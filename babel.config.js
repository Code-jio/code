module.exports = {
    // 预设
    presets: [
        [
            "@babel/preset-env",
            // 按需加载core-js的polyfill
            {
                useBuiltIns: "usage", // 按需引用
                corejs: { version: "3", proposals: true }
            },
        ],
    ],
};