export const KanaMap = {
    // ka
    'か': {
        tenten: 'が'
    },
    'き': {
        tenten: 'ぎ'
    },
    'く': {
        tenten: 'ぐ'
    },
    'け': {
        tenten: 'げ'
    },
    'こ': {
        tenten: 'ご'
    },

    // sa
    'さ': {
        tenten: 'ざ'
    },
    'し': {
        tenten: 'じ'
    },
    'す': {
        tenten: 'ず'
    },
    'せ': {
        tenten: 'ぜ'
    },
    'そ': {
        tenten: 'ぞ'
    },

    // ta
    'た': {
        tenten: 'だ'
    },
    'ち': {
    },
    'つ': {
    },
    'て': {
        tenten: 'で'
    },
    'と': {
        tenten: 'ど'
    },

    // na (nada)

    // ha
    'は': {
        tenten: 'ば',
        maru: 'ぱ'
    },
    'ひ': {
        tenten: 'び',
        maru: 'ぴ'
    },
    'ふ': {
        tenten: 'ぶ',
        maru: 'ぷ'
    },
    'へ': {
        tenten: 'べ',
        maru: 'ぺ'
    },
    'ほ': {
        tenten: 'ぼ',
        maru: 'ぽ'
    },

    // ma - nada
    // ya - nada
    // ra - nada
    // wa - nada
    // a - nada
    // n - nada
}

export const baify = (kana) => kana.map(k => KanaMap[k]?.tenten ?? k)
export const paify = (kana) => kana.map(k => KanaMap[k]?.maru ?? k)