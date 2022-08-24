// const CracoAntDesignPlugin = require("craco-antd");
const CracoLessPlugin = require('craco-less');

process.env.BROWSER = "none";

module.exports = {
    // webpack: {
    //     alias: {
    //         "react": "preact/compat",
    //         "react-dom/test-utils": "preact/test-utils",
    //         "react-dom": "preact/compat",     // Must be below test-utils
    //         "react/jsx-runtime": "preact/jsx-runtime"
    //     }
    // },
    plugins: [
        // {
        //     plugin: CracoAntDesignPlugin,
        //     options: {
        //         lessLoaderOptions: {
        //             lessOptions: {
        //                 modifyVars: {
        //                     '@primary-color': '#ff7b53',
        //                     '@border-radius-base': '5px',
        //                 },
        //                 javascriptEnabled: true,
        //             },
        //         },
        //     },
        // },
        {
            plugin: CracoLessPlugin,
            options: {
                lessLoaderOptions: {
                    lessOptions: {
                        modifyVars: {
                            '@primary-color': '#ff7b53',
                            '@border-radius-base': '5px',
                        },
                        javascriptEnabled: true,
                    },
                },
            },
        },
    ],
};
