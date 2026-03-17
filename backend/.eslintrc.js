// backend/.eslintrc.js
module.exports = {
    env: {
        node: true,
        es2022: true,
        jest: true
    },
    parserOptions: {
        ecmaVersion: 2022
    },
    rules: {
        // Erros reais — bloqueiam commit
        'no-unused-vars':        ['error', { argsIgnorePattern: '^_' }],
        'no-undef':              'error',
        'no-console':            ['warn', { allow: ['error', 'warn', 'log'] }],
        'eqeqeq':                ['error', 'always'],
        'no-eval':               'error',
        'no-implied-eval':       'error',
        'no-prototype-builtins': 'error',

        // Estilo — alinhado com o código existente
        'quotes':                ['error', 'single', { avoidEscape: true }],
        'semi':                  ['error', 'always'],
        'indent':                ['error', 4, { SwitchCase: 1 }],
        'no-trailing-spaces':    'error',
        'eol-last':              ['error', 'always'],
        'no-multiple-empty-lines': ['error', { max: 2, maxEOF: 1 }],

        // Boas práticas Node/Express
        'handle-callback-err':   'error',
        'no-path-concat':        'error'
    }
};
