// js/.eslintrc.js
module.exports = {
    env: {
        browser: true,
        es2022:  true
    },
    parserOptions: {
        ecmaVersion: 2022
    },
    globals: {
        // Globais do projeto — definidas em outros arquivos carregados antes
        navigate:                  'readonly',
        getFuncionarios:           'readonly',
        getFuncionarioById:        'readonly',
        addFuncionario:            'readonly',
        editFuncionario:           'readonly',
        removeFuncionario:         'readonly',
        bulkAddFuncionarios:       'readonly',
        getEmpresas:               'readonly',
        getEmpresaById:            'readonly',
        addEmpresa:                'readonly',
        removeEmpresa:             'readonly',
        getEquipamentos:           'readonly',
        getEquipamentoById:        'readonly',
        addEquipamento:            'readonly',
        editEquipamento:           'readonly',
        removeEquipamento:         'readonly',
        getHistorico:              'readonly',
        addHistorico:              'readonly',
        removeHistoricoEntry:      'readonly',
        clearHistorico:            'readonly',
        showModal:                 'readonly',
        hideModal:                 'readonly',
        showToast:                 'readonly',
        showConfirm:               'readonly',
        formatInputDate:           'readonly',
        formatCNPJ:                'readonly',
        debounce:                  'readonly',
        generateAndPrintTermo:     'readonly',
        renderFuncionarioPerfil:   'readonly',
        renderFuncionarios:        'readonly',
        renderEquipamentos:        'readonly',
        lucide:                    'readonly',
        XLSX:                      'readonly'
    },
    rules: {
        // Erros reais
        'no-unused-vars':    ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
        'no-undef':          'error',
        'eqeqeq':            ['error', 'always'],
        'no-eval':           'error',
        'no-implied-eval':   'error',

        // Estilo — alinhado com código existente
        'quotes':            ['error', 'single', { avoidEscape: true }],
        'semi':              ['error', 'always'],
        'indent':            ['error', 4, { SwitchCase: 1 }],
        'no-trailing-spaces':'error',

        // Desativado no frontend — template literals com HTML tornam isso impossível
        'no-multi-str':      'off',
        'max-len':           'off'
    }
};
