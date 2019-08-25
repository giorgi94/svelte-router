module.exports = {
    'presets': [
        [
            '@babel/preset-env',
            {
                'targets': {
                    'chrome': '58',
                    'ie': '10'
                }
            },
            '@babel/preset-stage-3'
        ]
    ],
    'plugins': [
        '@babel/plugin-syntax-dynamic-import'
    ]
};