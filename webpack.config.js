var webpack = require("webpack");
var path = require("path");

module.exports = {
    cache: true,
    entry: "./index.js",

    output: {
        path: path.resolve(__dirname, 'lib'),
        filename: "fluxxor.js",
        library: "Fluxxor",
        libraryTarget: "umd"
    },

    devtool: "source-map",

    module: {
        rules: [
            {
                test: /\.js$/,
                loader: 'babel-loader',
            },
            {
                test: /\.json$/,
                loader: "json-loader"
            },
            {
                test: /\.jsx$/,
                loader: "jsx-loader"
            }
        ]
    },

    plugins: [
        new webpack.optimize.OccurrenceOrderPlugin(),
        new webpack.optimize.ModuleConcatenationPlugin()
    ]
};
