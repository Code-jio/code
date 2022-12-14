// nodejs核心模块，直接使用
const os = require("os");
// nodejs的核心模块，专门用来处理文件路径
const path = require("path");
const ESlintWebpackPlugin = require("eslint-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");
const TerserPlugin = require("terser-webpack-plugin");
const ImageMinimizerPlugin = require("image-minimizer-webpack-plugin");
const PreloadWebpackPlugin = require("@vue/preload-webpack-plugin")
const WorkboxPlugin = require("workbox-webpack-plugin");

// cpu核数
const threads = os.cpus().length


// 获取处理样式的Loaders
const getStyleLoaders = (preProcessor) => {
    return [
        MiniCssExtractPlugin.loader,
        "css-loader",
        {
            loader: "postcss-loader",
            options: {
                postcssOptions: {
                    plugins: [
                        "postcss-preset-env", // 能解决大多数样式兼容性问题
                    ],
                },
            },
        },
        preProcessor,
    ].filter(Boolean);
}

module.exports = {
    // 入口
    // 相对路径和绝对路径都行
    entry: "./src/main.js",
    // 输出
    output: {
        // path：文件输出目录，必须是绝对路径
        // path.resolve()方法返回一个绝对路径
        // __dirname 当前文件的文件夹绝对路径
        path: path.resolve(__dirname, "../dist"), // 生产模式需要输出
        // filename: 入口文件打包输出文件名
        filename: "static/js/[name].[contenthash:8].js",
        // 清空上次打包的内容
        // 原理：再打包前，将path整个目录内容清空，在进行打包 
        chunkFilename: "static/js/[name].[contenthash:8].chunk.js",
        assetModuleFilename: "static/media/[hash:10][ext]",
        clean: true // 开发模式没有输出，不需要清空输出结果
    },
    // 加载器
    module: {
        rules: [
            {
                // 每个文件只能被其中一个loader配置处理
                oneOf: [
                    // css
                    {
                        test: /\.css$/i,
                        // 执行顺序，从右到左，从下到上
                        use: getStyleLoaders(),
                    },
                    // less
                    {
                        test: /\.less$/,
                        // loader:"xxx",  // 只能使用一个loader
                        use: getStyleLoaders("less-loader"),
                    },

                    // scss sass
                    {
                        test: /\.s[ac]ss$/,
                        use: getStyleLoaders("sass-loader"),
                    },
                    // stylus
                    {
                        test: /\.styl$/,
                        use: getStyleLoaders("stylus-loader"),
                    },
                    // 静态文件
                    {
                        test: /\.(png|jpe?g|gif|webp|svg)$/,
                        type: "asset",
                        parser: {
                            dataUrlCondition: {
                                // 小于10kb的图片转化为base64
                                // 优点：减少请求数量  缺点：体积变大约30%
                                maxSize: 10 * 1024 // 10kb
                            }
                        },
                        // generator: {
                        //     // 将图片文件输出到 static/imgs目录中
                        //     // 将图片文件命名为 [hash:8][ext][query]
                        //     // [hash:8]:hash值取8位
                        //     // [ext]：使用之前的文件扩展名
                        //     // [query]：添加之前的query参数(可写可不写)
                        //     filename: "static/imgs/[hash:10][ext][query]"
                        // }
                    },
                    // 字体图标
                    {
                        test: /\.(ttf|woff2?|map4|map3|avi)$/,// 处理字体图标等等资源
                        type: "asset/resource",
                        // generator: {
                        //     // 输出名称
                        //     filename: "static/media/[hash:10][ext][query]"
                        // }
                    },
                    // bable
                    {
                        test: /\.js$/,
                        exclude: /node_modules/, // 排除node_modules代码不编译
                        // loader: "babel-loader",
                        // 可以在这里写预设  也可以在外面写
                        // options: {
                        //     // presets: ['@babel/preset-env']
                        //     cacheDirectory: true, // 开启babel编译缓存
                        //     cacheCompression: false // 缓存文件不要压缩
                        // }
                        use: [
                            {
                                loader: "thread-loader",
                                options: {
                                    workers: threads, // 数量
                                },
                            },
                            {
                                loader: "babel-loader",
                                options: {
                                    cacheDirectory: true, // 开启babel编译缓存
                                    cacheCompression: false, // 缓存文件不要压缩
                                    plugins: ["@babel/plugin-transform-runtime"]  // 减少代码体积
                                },
                            },
                        ],
                    },
                ]
            }
        ],
    },
    // 插件
    plugins: [
        new ESlintWebpackPlugin({
            // 指定检查文件的根目录
            context: path.resolve(__dirname, "../src"),
            exclude: "node_modules", // 默认值
            cache: true, // 开启缓存
            // 缓存目录
            cacheLocation: path.resolve(
                __dirname,
                "../node_modules/.cache/.eslintcache"
            ),
            threads, // 开启多进程
        }),
        new HtmlWebpackPlugin({
            // 以public/index.html 为模板创建的文件
            // 新的html文件有两个特点：1.内容和源文件一致  2.自动引入打包生成的js等资源
            template: path.resolve(__dirname, "../public/index.html"),
        }),
        // 提取css成单独文件
        new MiniCssExtractPlugin({
            // 定义输出文件名和目录
            filename: "static/css/[name].[contenthash:8].css",
            chunkFilename: "static/css/[name].[contenthash:8].chunk.css",
        }),
        // css压缩
        // new CssMinimizerPlugin(),
        new PreloadWebpackPlugin({
            rel: "preload", // preload兼容性更好
            as: "script",
            // rel :"prefetch"  // 兼容性更差
        }),
        new WorkboxPlugin.GenerateSW({
            // 这些选项帮助快速启用 ServiceWorkers
            // 不允许遗留任何"旧的" ServiceWorkers
            clientsClaim: true,
            skipWaiting: true,
        }),
    ],
    optimization: {
        minimize: true,
        minimizer: [
            // css压缩也可以写到optimization.minimizer里面，效果一样的
            new CssMinimizerPlugin(),
            // 当生产模式会默认开启TerserPlugin，但是我们需要进行其他配置，就要重新写了
            new TerserPlugin({
                parallel: threads, // 开启多线程
            }),
            // 压缩图片
            new ImageMinimizerPlugin({
                minimizer: {
                    implementation: ImageMinimizerPlugin.imageminGenerate,
                    options: {
                        plugins: [
                            ["gifsicle", { interlaced: true }],
                            ["jpegtran", { progressive: true }],
                            ["optipng", { optimizationLevel: 5 }],
                            [
                                "svgo",
                                {
                                    plugins: [
                                        "preset-default",
                                        "prefixIds",
                                        {
                                            name: "sortAttrs",
                                            params: {
                                                xmlnsOrder: "alphabetical",
                                            },
                                        },
                                    ],
                                },
                            ],
                        ],
                    },
                },
            }),
        ],
        // 代码分割配置
        splitChunks: {
            chunks: "all", // 对所有的模块进行 分割
        }, // 其他内容用默认配置即可
        runtimeChunk: {
            name: (entrypoint) => {
                `runtime~${entrypoint.name}.js`
            }
        }
    },
    // 开发服务器
    // devServer: {
    //     host: "localhost", // 启动服务器域名
    //     port: "3000", // 启动服务器端口号
    //     open: "true"  // 是否自动打开浏览器
    // },
    // 模式
    mode: "production",//  开发模式  
    // 打包文件的大小限制  避免报警告
    performance: {
        maxEntrypointSize: 100000000,
        maxAssetSize: 300000000
    },
    //     生产模式：source-map
    // 优点：包含行/列映射
    // 缺点：打包编译速度更慢
    devtool: "source-map",
}