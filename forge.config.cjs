module.exports = {
    packagerConfig: {
        asar: true,
        icon: './public/logo-corteva.ico',
        ignore: [
            /^\/src/,
            /^\/public(?!\/logo-corteva\.(ico|png)|favicon\.svg|icons\.svg|manifest\.json)/,
            /^\/\.git/,
            /^\/tsconfig/,
            /^\/eslint/,
            /^\/\.env/,
            /^\/convert-icon\.js/,
            /^\/vite\.config\.ts/,
            /^\/package-lock\.json/,
            /^\/node_modules/, // We only need the bundled dist
        ],
    },
    rebuildConfig: {},
    makers: [
        {
            name: '@electron-forge/maker-squirrel',
            config: {
                name: 'ValerioApp',
                setupIcon: './public/logo-corteva.ico',
            },
        },
        {
            name: '@electron-forge/maker-zip',
            platforms: ['win32'],
        },
    ],
};
