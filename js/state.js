(function () {
    const exchanges = [
        { id: 'binance', name: 'Binance', icon: 'data:image/png;base64,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', handle: '@binance' },
        { id: 'okx', name: 'OKX', icon: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAABa0lEQVR4Xu2QMYoEQQzEZv7/6NtcCyeqAgdrC5QYRLv9/C3n4WAbdwAOtnEH4GAbdwAOtnEH4GAbdwAOtnEH4GAb9QGe54lMYW+21CUXMFPYmy11yQXMFPZmS11yATOFvdlSl1zATGFvttQlFzBT2JstdckFzBT2ZktdcgEzhb3ZUpdcwExhb7bUJRcwU9ibLXXJBcwU9mZLXXIBM4W92dKXIe/7fi39n1OMvcQPmlOMvcQPmlOMvcQPmlOMvcQPmlOMvcQPmlOMvcQPmlOMvcQPmlOMvcQPmlOMvcQPmlOMvcQPmlOMvcQPmlPUL3FhM4W92VKXXMBMYW+21CUXMFPYmy11yQXMFPZmS11yATOFvdlSl1zATGFvttQlFzBT2JstdckFzBT2ZktdcgEzhb3ZUpdcwExhb7bUJRcwU9ibLXXJBcwU9mZLX/4IdwAOtnEH4GAbdwAOtnEH4GAbdwAOtnEH4GAb6w/wAb8fW63HyJ7RAAAAAElFTkSuQmCC', handle: '@okx' },
        { id: 'bybit', name: 'Bybit', icon: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAABaUlEQVR4Xu2WMU7EQBAE/QOefk9wxjcc8AA/wTGRQyIEcuDTUMywtkG6Rd0lTXC1nj1TQoLhQ5yBQg0HoFDDASjUcAAKNRyAQg0HoFDDASjUcAAKNRyAQg0HoFDDASjUcAAKNf5NgLfnp/v8JQ5A0SsPCzBNUzoZ+9k8zzz6ths/8ywjC8DdbFo0AwzD8ONUz0a2F6HnPRySBeBONi2aT/DCbHbiDxp/C7JneUc2kS4CkMxnz/NzdPTxLJIFiGQ7R2hunH3RZVm++Gq/8vEs0l2AyvPsyDNHfBcBsqloPcdzDuk2QPWlZ86riXQRgFR+I/vTF6nuXdc19V0HyP7huBognsV7319f7pNR3dWiuVG96DiOqd+5GuB2u6W+xZWdjeZGfNFqMs4EqOYMV3Y2mht8KU7FbwOc5fIehRoOQKGGA1Co4QAUajgAhRoOQKGGA1Co4QAUajgAhRoOQKGGA1Co4QAUasgH+AQp8JuhMwlDYwAAAABJRU5ErkJggg==', handle: '@Bybit_Official' },
        { id: 'bitget', name: 'Bitget', icon: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAB1ElEQVR4XuXXy61TURBEUUeACJwcyII0kIiADAjhoTuz9tbrvp/zaejBmpRV0qmWB/br9fvjozUF3SjoRkE3CrpR0I2CbhR0o6AbBbO8XtewP4uCGTguw/5MCkbjuAz7sykYieMy7K+gYBSOy7C/ioIROC7D/koKnuK4DPurKXiC4zLs76DgLo7LsL+Lgjs4LsP+Tgqu4rgM+7spuILjMuxXoOAsjsuwX4WCMzguw34lCjIcl2G/GgURjot8+ep+RQoiHPmZf2X8QUGEQyPfvrv/7tcfdyLsj6Igw4dFfvx0/12FIyg4gw+LVD+CgrP4sEjlIyi4gg+LVD2Cgqv4sEh2hONzdiLs36HgDj4sUu0ICu7iwyLH1539dyuPoOAJPixS5QgKnuLDIhWOoGAEPiyy+wgKRuHDItkRjp/V7ETYjyio6viDxaGfYTeioKIr4/+7A3Bchv2Mgko4LsP+GQqq4LgM+2cpqIDjMuxfoWA3jsuwf5WCnTguw/4dCnbhuAz7dynYgeMy7D+hYDWOy7D/lIKVOC7D/ggKVuG4DPujKFiB4zLsj6RgNo7LsD+agpk4LsP+DApm4bgM+7Mo6EZBNwq6UdCNgm4UdKOgGwXdKGjmL2Oz9mNmEogRAAAAAElFTkSuQmCC', handle: '@bitgetglobal' },
        { id: 'coinbase', name: 'Coinbase', icon: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAABz0lEQVR4Xt2a200DMRBFUwIlUEJKSAmbCP7phHRICZRACYYVEojjkPW8bM8e6fw49r3jj40UZQ+HXlxKEZkeXshqCpZyqgb3dilH1o5nKa/VoNGunVPAwXo7DA4y2q6wfBbDuZT3qnQ2z18zhsCi2XWF4Vl0gaHZNJHhmd/yXN54rXYYllUVDMmuCB7ei83w4F5sgoe83YL7vb1L1K86Lczx8cqaX+rNNr1grtWbPJdjtdGiN8y3uJQHxvsWRMEeixXcoDUa9mmNDw2EvTo/fAN7sj7D7Nf4Az/Q2Bv2a3QLGwXnkOoSsjoKzqGxWtA4Cs6hsVqQOhrOI7VakJoeXkhqenghqenhhaSmhxeSmh5eSGp6eCGpo+E8UqsFjaPgHBqrBY2j4BwaXYJGwTmkugWt9ob9GmPCOsF+ja5hq71gr9b40ADYp7WCGyxGwR6LFd5veXrDfItLeWT8N9xo1QvmWv2X9Y9DbvZQC3M8XMoLa/7CA95uwf3eNsFDe7EZHtyLIng4uyoYklU1+3hR8p3XksHAbLrA0Cy6wvDZDSHDd4L5mW+BpbPYFZaPdhgcpLdTEPUr8r5XjjEe77dNb/lUTqydEw5uNT280Jad+ARTN/5LEYj5RgAAAABJRU5ErkJggg==', handle: '@coinbase' },
        { id: 'gate', name: 'Gate.io', icon: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAIa0lEQVR4Xu1bSW8cVRDmNyBQTBzbmTXjJCQQIkBiueQQSJRZPLttxUjABW6IG3CAP4A4wJWcEMsZIS4gsYhFsQmIOCJesB1n7PF4GdvjbbaPquqxPelluts9wWM5n/RZ7Y77vVffe69eVXXnIRxyPKS+cdjwQAD1jcOGBwKobzhGZecHUFUuS7VLFKH8Ul6mH3PYwpjc2k80XwAybFuEMnELS9gsA88Ff4K3ZwHeaA6uxBQ60yPoiudQFGX2D00XoCxzWsQyGdYdG4c7PQd/ehYnEvPwRTPwxqdIgGl0JTLoSORACu0rHAlQxaYy2xW+5hkno0N5uKK34Q3TbMcyDdmVGkOFH9pHOBKAlziqJWzQ9Wdf53Hk6m0EYrfgo6XujuU0Bqt5cAWQfVvAJi2ADdrg519d1hhnhQdXAF76tNVpB9P+XoGLnZuOgWY80AKk3xrC2dA4jpFT80ZnNMZZ4cESQJb9pvBC+ju4ExMag+zyYAlAe56XPc88G+9KjmsMsssDIQAfdeztyyVlz3teuqkxxBajWbjiM+ikGKCz929s1KJF26zKlCiRpQOYCqB0VsIWhWzeZB7tsUmtUXZIPsMdz0g02B1co0W1yeepba7x2KrKpDiBJQHWqaPHr+bE2/v26PC26YrdwdnoXTwVGsTZ5LccOBOrtjlJ0nH84TSSNBWAI7zPv1nRGGKZkTkc7fsT/sg4ZmjaCrJkizuT+UjmUxzJXLPNS9evyep3aL+5AFs0yraBEa1hFuhLzuOZgQLNFEeMRV6xOxmi4ltaVQDe97TQOLEJBJckvFUbZ8Su9C10h3MI9I1gZBriP5T2tGhdAXjEMugSjsdGJLZXG2rEbkqCOijVLdCzRRleha44ftCihQUgVMuS0rqCWUuJzTY9iWExvioeqjFaV4AqD64CX/i2xkBD0ungTy1gNEOxIgcNFtC6AlS44WW4UlmtoQb09WTF4Um4LN7OYOPXoWUFkIZp/Cd6rQvQ3k9RHT9Z5eetVfpaVgDGs1d+gD86pzHUiL7gqOLxbaB1BaAJdEcX4O/RGmpErvPaResKQC1z9ZbjdrWh95ASG/4bT+Iu1msJih20rgCVFUlWuHqrMbqOnNVxYnM6PAVZNuZ+7x60rgAUBUrdPqE1up6c0rJQ58NDYoxUiW2gdQUo5+CPjVEA1Djz80UWSYQZnEndULdgCRwrnb79KdruXrPNC4NfQSoCrEIjssoMA6WaIsDJ2HV1C9ZAg1tQ37OIUXrwWGqUVuqgpNhG9MZG4SFnbtSPrgBVzMObGKM9rjW6nsoWmMYz0aGa/7O3BZzgwy/IUcem0dn7l2Zc90yS1C+msWngn3QFANYpBmAHaOYEM+IET4UpBmAnaPMUcIKT0e+VMZjUJjlC9ffMyG7Qg74ApBZndb6Y2TGYkxyAj0GZewOV7wdc8ay8bDWrUPkjlJqTLVWD4pm+ALQ3XVGuAjVeAfXkLOD/WABVKYZaD9E5k+2IVnadoQr6AtB0nkv+Dk/SRkeXBqkTazmAE7Adb7xvozBLK8QXXkNlXd2SAl0B+MTIzFIyFJ/VNmjAtvivtALqd5rRrnMIavaxuPV3kT4K1s7HfqZVs6puSaArAC+BDUzA12t9Cxy/kofrwm/YLdzfH7z7MeUpL61q+jfi8dQd2f1VgyHpC0BZHc+fJ2RdACmIpOcURyDO4P6sgEcv/0ue33qRtiOY5UPNng+Q8VOYdn2av/LI01FnXQjP1QyK1QWpKDULJWTIgE0ELvPZr+1TjzxmPsWe6x3ardHoQFcA7lJ5YB1d0RFbaTF/IeINsfH6e25PqFTgeRk4Ex/W9GfE7uAGfKmVnVdvtgQoyaG2LPvmdIQ/e7H+YuSRBHAqWIDvlQl1s3uGn2b+ifgkHk4vafozYiA6js6I8gmPbEY7W+BeFHAkwTG1thMzBgbyePLin5grKKMoK68zG4LPeRkrHUXvfQIcDWvbtcL2vlsWerMiAB3tFwcGNR1YYaCHQ9UFtF9cxAuvDEu0WCw2jhVWMYs3P5hAV98GvJdW4Ur9o2nXCl+MzRou+3qYC1ArcraFJyn7mzUPj03o7l3AU/1/4e0P13F9ErhJB8dHXwJn4z/AE7deg9RjIJKlNubh7smL2CULjthUgC1uqqTk7u7+KbiTNqIwHfopOeH43UfJFidc20kXf0No5w2UHtvTU5KeD5GwylFunp2aCiAikjesbBVxhy5PRhY1Hdti6oZkcB2pCTldmJzSuhPjpomNGTmBS73zD00Yf6GqfNFiBnMBamDnxGI88fIv6EpOSBqsHsB+8XRkDF2JaRy/PAx+nW8nCLMsgBJOceM5nL80IiKoB7JfZOPPRNbI7CXjA98ANgTYBVeMng7dgD82QmnzbG0fawd2PxmIzNCen5BX8Z4rY7TkjYpejbEnAWqHOobmgY5e2schZ3t3L+wMkcfvW0T6nVFUdvIP+9ijAAUlWCEnkwcHK///CugMzeEP9sqlUl0CZh97FECBuJpa/2cu/oy2vnH4w3lZlmYVZTvkxIZjew5vj/YP4/kY/2cLyFEn3t4BHAnAK2CTnON2rM0xw6mBVZzsLzkOmOrJbbnjSzgWWt/5PI77lHPewlHXCM4E0IFUhWiAr73/L04kFnGMAidPellqc1xC9/VwITVb44xSsuLgiKu3EV45SqG1MzgBV5oCpeQKngz/tPtBZZPRdAE4aNr2D5TC08G0hejrNxEIrVFqvYYAbRFJr+PjkiswORLk0jVXb7mAyTW8cz0/KnVcXus8y9tZXZPRdAFkkNs5uDin2rA5Ki3zPy2JQGtl5StPJr+04L8qI6vMcpG/BC0oZSx5pubjDFJaJ2i6AAcNDwRQ3zhseCCA+sZhw3+Q2GCocoanKAAAAABJRU5ErkJggg==', handle: '@gate_io' },
        { id: 'htx', name: 'HTX', icon: 'data:image/png;base64,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', handle: '@HTX_Global' },
        { id: 'mexc', name: 'MEXC', icon: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAACC0lEQVR4Xu2Y7W0CMQyGGaEjdISOgOAq9ScjdJRuUDagG3QERukIjJAS6IHzJiHxxfmQ6kd6JJBzSeDsXHKrlaIoiqIoiqIoilLA1pzOmqhc8HrXH2zej515CkwwZP6k/WvDDgFO6rHpPyGVSWhX7A/CCaV8NS/YzY2Neffap5zMJ3bTDpxMrjGwXa5d4KYqdWM+sLsL2C7fdGmJsiT10cmsnT7td2zDsWkp4OBLpazNsxfn2oQ3gYnOYilgnGsTcNBSZfs+Of2Js+QxlZJSug5YcW0RBQeT0V3B/TjfKmzNwRtISrudnllnb63j4tpSTI3URynDlQJ2XsdBS6Fm6qO0FEp2mrMipYCd1lZ67CIktrx8d7fxJ3MMxLkeyS9iILnj40rB2BJpaWWDnbRWei4set79WYpEKbDAi3uIKzjG+bqP2SgtNj25Ss/LZnYSvKiv7grux/k+pOWmJ1f3nFC+NtlMCiKRYrWUnmewFLDRWFYuBYnTV22lzwnO5kjiOVvf++suiXcGdr274QfHlJ7xy28aeX8okVKtpGCMK+no2wuOKt0hTufPGM8XTol+g3GlLC0Fjz5n/2Xi+z6Mp42cC/yGo0pW8Mu8d4E2caPIPF7qixlgyV0P7HY6yejlEGNrvry2dyNpH8Nmw/VfPQzkHqcZ5LqzPfwtkPu8u64oiqIoiqIoivKP+AXWi/JrzeckmQAAAABJRU5ErkJggg==', handle: '@MEXC_Global' },
        { id: 'kucoin', name: 'KuCoin', icon: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAADLklEQVR4Xu2ZPYvVQBhG96/cZKwExQ+srbTxR/i5dhbW/gY3E8HSxsLGTXLFQhBsbMXGQkVtBBsLBRFbnewXc09mMpnJJGicA6dJ3ud5Z3bvwrK7tZVIJBKJxF9FXssfyt8HbvP9YskaeUW7+IacXSS8NOX8Ysjr8jIva5PZ2cmr8pao5G0+D0XUxTVe0iU7ZkEt/saDKH9xzhdD5yDZMylq4VceQPM754di6PKSfZPBxZTzLkI+9jbZPQlcSjnvgvmxsj86XEg53wezseSeqHAZ5byJmB97m9wZDS6inCeikdeZcdnmsvW9s3zukrujwCWU84TzLvXsqi7P8b1LPR8FLqCcP8TnN7y+LrG7c5pzLtkxCpZTzrdkVXmVcy7ZobNaFyc475IdwbCYcr6FMy6ZNyHW5Snm+mQ+GBZTfTb2d55kj+Ux5vtkPgiW0qO5qrjBdy71PUPx+SQwGwRL6dA5qu/wRdRlzj6a1fIhc0GwmIqmuMhnLrkjhFVVnmRv7B17sHis7B+D6jvD/tg7on4B2B2LvJGP9neUd/huNLxEqOw1wUyr+nm/wLlZ4YFCZKcJZnzzk8HD+Mo+G8xRzs8GD+Iju2yISj5gljIzGzyIj+yyIeriPrOUmdngQXxlnw3mKOdngwcJkZ0mmPHNTwYPEyp7TTAzNDcpPNAY2R0D8eTu8Ul38BJjZf8YVN8r9re2f0/kbDAsp0NmKHeEoH7t/cze2Dv2YDEdOkf1Hb6IRr5ln8H3zAVhKLZehO9c6tmhqNwX9thkNgiWUt95ynwfav4d8zazWv5kPggWU863cMYl8ybU3Gvm+mQ+GBZTzh/COZfM66j3Hznvkh3BsJhyXoezLplvUc/fcM4lO0bBcsp5wnmXyH7i+14r+ULPR6GzBHLeBDMu9zPlBz53yb1R4BLKeRvMxZb7osFFlPN9MBvFRj7lnqh0FkLOu2B+nMUu+6PTXbop54fAjlDZOwlq0TYXH9mUNzk/lE6Xp+ybFFHvnOcBsqq4xDlf2DnM8hl7/mm6F+yX+UXAS9pkblHwspsu7GNvo3vx/+A7Tw7+7/9S+ZzvEolEIpGIxx8OlLjcRMoO5QAAAABJRU5ErkJggg==', handle: '@kucoincom' }
    ];

    const defaultState = {
        lang: 'zh',
        theme: 'dark',
        user: {
            id: 'UserID',
            avatar: '',
            handle: ''
        },
        placements: I18N.tiers.reduce((acc, tier) => {
            acc[tier.id] = [];
            return acc;
        }, {}),
        poolOrder: exchanges.map((item) => item.id)
    };

    function loadState() {
        try {
            const raw = window.localStorage.getItem('h2l-state');
            if (!raw) return { ...defaultState };
            const parsed = JSON.parse(raw);
            const merged = {
                ...defaultState,
                ...parsed,
                placements: { ...defaultState.placements, ...(parsed.placements || {}) }
            };
            merged.poolOrder = sanitizePool(merged.poolOrder, merged.placements);
            return merged;
        } catch (error) {
            console.warn('Failed to load state', error);
            return { ...defaultState };
        }
    }

    function sanitizePool(poolOrder, placements) {
        const used = new Set();
        I18N.tiers.forEach((tier) => {
            placements[tier.id] = (placements[tier.id] || []).filter((id) => {
                const exists = exchanges.find((ex) => ex.id === id);
                if (!exists || used.has(id)) return false;
                used.add(id);
                return true;
            });
        });
        const available = exchanges
            .map((ex) => ex.id)
            .filter((id) => !used.has(id));
        const pool = [];
        poolOrder.forEach((id) => {
            if (available.includes(id) && !pool.includes(id)) {
                pool.push(id);
            }
        });
        available.forEach((id) => {
            if (!pool.includes(id)) pool.push(id);
        });
        return pool;
    }

    let state = loadState();

    function persist() {
        window.localStorage.setItem('h2l-state', JSON.stringify(state));
    }

    function setLanguage(lang) {
        state.lang = lang;
        persist();
    }

    function setTheme(theme) {
        state.theme = theme;
        persist();
    }

    function setUser(user) {
        state.user = { ...state.user, ...user };
        persist();
    }

    function resetPlacements() {
        state.placements = I18N.tiers.reduce((acc, tier) => {
            acc[tier.id] = [];
            return acc;
        }, {});
        state.poolOrder = exchanges.map((item) => item.id);
        persist();
    }

    function placeExchange(exchangeId, targetTierId, position) {
        // Remove from pool and tiers
        state.poolOrder = state.poolOrder.filter((id) => id !== exchangeId);
        I18N.tiers.forEach((tier) => {
            state.placements[tier.id] = state.placements[tier.id].filter((id) => id !== exchangeId);
        });
        if (targetTierId === 'pool') {
            if (typeof position === 'number') {
                state.poolOrder.splice(position, 0, exchangeId);
            } else {
                state.poolOrder.push(exchangeId);
            }
        } else {
            const tierArray = state.placements[targetTierId] || [];
            if (typeof position === 'number') {
                tierArray.splice(position, 0, exchangeId);
            } else {
                tierArray.push(exchangeId);
            }
            state.placements[targetTierId] = tierArray;
        }
        persist();
    }

    function getExchangeById(id) {
        return exchanges.find((item) => item.id === id);
    }

    window.AppState = {
        getState: () => state,
        exchanges,
        setLanguage,
        setTheme,
        setUser,
        resetPlacements,
        placeExchange,
        getExchangeById,
        persist,
        sanitizePool
    };
})();
