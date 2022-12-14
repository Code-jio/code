
const os = require("os");
// nodejs的核心模块，专门用来处理文件路径
const path = require("path");
const ESlintWebpackPlugin = require("eslint-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");


// cpu核数
const threads = os.cpus().length;

module.exports = {
    // 入口
    // 相对路径和绝对路径都行
    entry: "./src/main.js",
    // 输出
    output: {
        // path：文件输出目录，必须是绝对路径
        // path.resolve()方法返回一个绝对路径
        // __dirname 当前文件的文件夹绝对路径
        path: undefined, // 开发模式没有输出，不需要指定输出目录
        // filename: 入口文件打包输出文件名
        filename: "static/js/main.js",
        // 清空上次打包的内容
        // 原理：再打包前，将path整个目录内容清空，在进行打包 
        // clean: true // 开发模式没有输出，不需要清空输出结果
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
                        use: [ // 执行顺序，从右到左，从下到上
                            "style-loader", // 将js中css通过style标签添加到html文件中生效
                            "css-loader"  // 将css资源编译成conmonjs的模块到js中
                        ],
                    },
                    // less
                    {
                        test: /\.less$/,
                        // loader:"xxx",  // 只能使用一个loader
                        use: [ // 使用多个loader
                            "style-loader",
                            "css-loader",
                            "less-loader"
                        ]
                    },

                    // scss sass
                    {
                        test: /\.s[ac]ss$/,
                        use: [{
                            loader: "style-loader" // 将 JS 字符串生成为 style 节点
                        }, {
                            loader: "css-loader" // 将 CSS 转化成 CommonJS 模块
                        }, {
                            loader: "sass-loader" // 将 Sass 编译成 CSS
                        }]
                    },
                    // stylus
                    {
                        test: /\.styl$/,
                        use: [
                            "style-loader",
                            "css-loader",
                            "stylus-loader" // 处理styl资源
                        ],
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
                        generator: {
                            // 将图片文件输出到 static/imgs目录中
                            // 将图片文件命名为 [hash:8][ext][query]
                            // [hash:8]:hash值取8位
                            // [ext]：使用之前的文件扩展名
                            // [query]：添加之前的query参数(可写可不写)
                            filename: "static/imgs/[hash:10][ext][query]"
                        }
                    },
                    // 字体图标
                    {
                        test: /\.(ttf|woff2?|map4|map3|avi)$/,// 处理字体图标等等资源
                        type: "asset/resource",
                        generator: {
                            // 输出名称
                            filename: "static/media/[hash:10][ext][query]"
                        }
                    },
                    // bable
                    {
                        test: /\.js$/,
                        exclude: /node_modules/, // 排除node_modules代码不编译
                        // loader: "babel-loader",
                        // // 可以在这里写预设  也可以在外面写
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
    ],
    // 开发服务器
    devServer: {
        host: "localhost", // 启动服务器域名
        port: "3000", // 启动服务器端口号
        open: true,  // 是否自动打开浏览器
        hot: true  // 模块热替换 修改文件时，无需重新编译即可实现最新效果（实际开发可用vue-loader或者react-hot-loader替换）
    },
    // 模式
    mode: "development",//  开发模式
    // 开发模式：cheap-module-source-map
    // 优点：打包编译速度快，只包含行映射(出现bug时 会提示哪一个文件哪一行出错)
    // 缺点：没有列映射
    devtool: "cheap-module-source-map",
}