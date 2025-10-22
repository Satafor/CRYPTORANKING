(function () {
    const boardEl = document.getElementById('board');
    const poolEl = document.getElementById('exchangePool');
    const langZhBtn = document.getElementById('langZhBtn');
    const langEnBtn = document.getElementById('langEnBtn');
    const themeToggleBtn = document.getElementById('themeToggle');
    const themeIcon = document.getElementById('themeIcon');
    const resetBtn = document.getElementById('resetBtn');
    const copyImageBtn = document.getElementById('copyImageBtn');
    const saveBtn = document.getElementById('saveBtn');
    const poolTitle = document.getElementById('poolTitle');

    function init() {
        console.log('App initializing...');
        console.log('html2canvas available:', !!window.html2canvas);
        
        // 初始化 SaveController
        if (window.SaveController) {
            try {
                SaveController.init({ getState: AppState.getState });
            } catch (error) {
                console.error('SaveController init failed:', error);
            }
        }

        // 绑定复制图片按钮
        if (copyImageBtn) {
            console.log('Binding copy image button');
            copyImageBtn.addEventListener('click', async (event) => {
                event.preventDefault();
                event.stopPropagation();
                console.log('Copy image clicked');
                try {
                    await handleCopyImage();
                } catch (error) {
                    console.error('Copy image failed', error);
                    alert('复制图片失败: ' + error.message);
                }
            });
        } else {
            console.error('Copy image button not found');
        }

        // 绑定保存图片按钮
        if (saveBtn) {
            console.log('Binding save image button');
            saveBtn.addEventListener('click', async (event) => {
                event.preventDefault();
                event.stopPropagation();
                console.log('Save image clicked');
                try {
                    await handleSaveImage();
                } catch (error) {
                    console.error('Download PNG failed', error);
                    alert('保存图片失败: ' + error.message);
                }
            });
        } else {
            console.error('Save image button not found');
        }

        langZhBtn.addEventListener('click', () => changeLanguage('zh'));
        langEnBtn.addEventListener('click', () => changeLanguage('en'));
        themeToggleBtn.addEventListener('click', toggleTheme);
        resetBtn.addEventListener('click', handleReset);
        Drag.bindDropzone(poolEl, handlePoolDrop);

        renderAll();
    }

    function renderAll() {
        renderLanguage();
        renderTheme();
        renderBoard();
        renderPool();
    }

    function getDict() {
        const state = AppState.getState();
        return I18N.translations[state.lang] || I18N.translations.zh;
    }

    function getValue(dict, key, fallback = '') {
        const value = dict[key];
        if (typeof value === 'function') {
            try {
                return value(AppState.getState()?.user?.id) ?? fallback;
            } catch (error) {
                return fallback;
            }
        }
        return value ?? fallback;
    }

    function renderLanguage() {
        const dict = getDict();
        resetBtn.textContent = getValue(dict, 'reset', '重置');
        if (copyImageBtn) copyImageBtn.textContent = getValue(dict, 'copyImage', '复制图片');
        if (saveBtn) saveBtn.textContent = getValue(dict, 'downloadPng', '保存为 PNG 图片');

        const saveDialogTitle = document.getElementById('saveDialogTitle');
        const downloadPngBtn = document.getElementById('downloadPngBtn');
        const shareToXBtn = document.getElementById('shareToXBtn');

        if (saveDialogTitle) saveDialogTitle.textContent = getValue(dict, 'saveDialogTitle', '保存 / 分享');
        if (downloadPngBtn) downloadPngBtn.textContent = getValue(dict, 'downloadPng', '保存为 PNG 图片');
        if (shareToXBtn) shareToXBtn.textContent = getValue(dict, 'shareToX', '发布到 X');

        poolTitle.textContent = getValue(dict, 'poolTitle', '候选交易所');
        langZhBtn.classList.toggle('active', AppState.getState().lang === 'zh');
        langEnBtn.classList.toggle('active', AppState.getState().lang === 'en');
    }

    function renderTheme() {
        const state = AppState.getState();
        const isDark = state.theme === 'dark';
        document.body.classList.toggle('dark', isDark);
        themeIcon.textContent = isDark ? '🌙' : '☀';
    }

    function renderBoard() {
        const state = AppState.getState();
        const dict = getDict();
        boardEl.innerHTML = '';
        I18N.tiers.forEach((tier) => {
            const row = document.createElement('div');
            row.className = 'tier-row';

            const label = document.createElement('div');
            label.className = 'tier-label';
            label.style.background = `var(${tier.colorVar})`;
            label.textContent = getValue(dict.tiers, tier.id, tier.id.toUpperCase ? tier.id.toUpperCase() : tier.id);

            const dropzone = document.createElement('div');
            dropzone.className = 'tier-dropzone';
            dropzone.dataset.tier = tier.id;
            dropzone.dataset.placeholder = getValue(dict.placeholders, tier.id, '');

            const items = state.placements[tier.id] || [];
            items.forEach((exchangeId) => {
                const card = createExchangeCard(exchangeId, tier.id);
                dropzone.appendChild(card);
            });
            dropzone.classList.toggle('filled', items.length > 0);

            Drag.bindDropzone(dropzone, ({ id, position }) => {
                AppState.placeExchange(id, tier.id, position);
                renderBoard();
                renderPool();
            });

            row.appendChild(label);
            row.appendChild(dropzone);
            boardEl.appendChild(row);
        });
    }

    function renderPool() {
        const state = AppState.getState();
        poolEl.innerHTML = '';
        state.poolOrder.forEach((exchangeId) => {
            const card = createExchangeCard(exchangeId, 'pool');
            poolEl.appendChild(card);
        });
    }

    function createExchangeCard(exchangeId, origin) {
        const exchange = AppState.getExchangeById(exchangeId);
        const card = document.createElement('div');
        card.className = 'exchange-card';
        card.dataset.id = exchangeId;
        card.dataset.origin = origin;
        const img = document.createElement('img');
        img.src = exchange.icon;
        img.alt = exchange.name;
        card.appendChild(img);
        Drag.makeCardDraggable(card);
        return card;
    }

    function changeLanguage(lang) {
        AppState.setLanguage(lang);
        renderAll();
    }

    function toggleTheme() {
        const state = AppState.getState();
        const next = state.theme === 'dark' ? 'light' : 'dark';
        AppState.setTheme(next);
        renderTheme();
    }

    function handleReset() {
        AppState.resetPlacements();
        renderBoard();
        renderPool();
        if (window.SaveController?.showToast) {
            window.SaveController.showToast(getValue(getDict(), 'toastReset', '已恢复初始状态。'));
        }
    }

    function handlePoolDrop({ id, position }) {
        AppState.placeExchange(id, 'pool', position);
        renderBoard();
        renderPool();
    }

    function getCopy(key) {
        const dict = getDict();
        return getValue(dict, key, key);
    }

    async function handleCopyImage() {
        console.log('handleCopyImage called');
        
        if (!window.html2canvas) {
            alert('截图库未加载，请刷新页面重试');
            return;
        }
        
        const boardElement = document.getElementById('board');
        if (!boardElement) {
            alert('找不到排行榜元素');
            return;
        }

        // 显示加载提示
        if (window.SaveController?.showToast) {
            window.SaveController.showToast('正在生成图片...');
        }

        try {
            console.log('Starting html2canvas capture...');
            const canvas = await html2canvas(boardElement, {
                scale: 2,
                logging: true,
                useCORS: true,
                allowTaint: true,
                backgroundColor: window.getComputedStyle(boardElement).backgroundColor
            });
            console.log('Canvas generated:', canvas);

            const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/png'));
            console.log('Blob created:', blob);
            
            if (!blob) {
                alert('生成图片失败');
                return;
            }

            // 尝试复制到剪贴板
            try {
                if (navigator.clipboard && window.ClipboardItem) {
                    console.log('Attempting clipboard copy...');
                    const item = new ClipboardItem({ 'image/png': blob });
                    await navigator.clipboard.write([item]);
                    console.log('Clipboard copy successful');
                    if (window.SaveController?.showToast) {
                        window.SaveController.showToast('✅ 图片已复制到剪贴板');
                    } else {
                        alert('✅ 图片已复制到剪贴板');
                    }
                    return;
                }
            } catch (error) {
                console.warn('Clipboard copy failed:', error);
            }

            // 降级方案：在新窗口打开
            console.log('Opening image in new tab...');
            const url = URL.createObjectURL(blob);
            window.open(url, '_blank');
            setTimeout(() => URL.revokeObjectURL(url), 30000);
            if (window.SaveController?.showToast) {
                window.SaveController.showToast('图片已在新标签页打开');
            } else {
                alert('图片已在新标签页打开');
            }
        } catch (error) {
            console.error('Screenshot error:', error);
            if (window.SaveController?.showToast) {
                window.SaveController.showToast('❌ 截图失败: ' + error.message);
            }
            throw error;
        }
    }

    async function handleSaveImage() {
        console.log('handleSaveImage called');
        
        if (!window.html2canvas) {
            alert('截图库未加载，请刷新页面重试');
            return;
        }

        const boardElement = document.getElementById('board');
        if (!boardElement) {
            alert('找不到排行榜元素');
            return;
        }

        // 显示加载提示
        if (window.SaveController?.showToast) {
            window.SaveController.showToast('正在生成图片...');
        }

        try {
            console.log('Starting html2canvas capture for save...');
            const canvas = await html2canvas(boardElement, {
                scale: 2,
                logging: true,
                useCORS: true,
                allowTaint: true,
                backgroundColor: window.getComputedStyle(boardElement).backgroundColor
            });
            console.log('Canvas generated:', canvas);

            const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/png'));
            console.log('Blob created:', blob);
            
            if (!blob) {
                alert('生成图片失败');
                return;
            }

            const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
            const filename = `exchange-ranking-${timestamp}.png`;
            console.log('Downloading as:', filename);

            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = filename;
            link.style.display = 'none';

            document.body.appendChild(link);
            link.click();
            console.log('Download triggered');

            setTimeout(() => {
                document.body.removeChild(link);
                URL.revokeObjectURL(url);
            }, 100);

            if (window.SaveController?.showToast) {
                window.SaveController.showToast('✅ 图片已保存');
            } else {
                alert('✅ 图片已保存');
            }
        } catch (error) {
            console.error('Save error:', error);
            if (window.SaveController?.showToast) {
                window.SaveController.showToast('❌ 保存失败: ' + error.message);
            }
            throw error;
        }
    }

    document.addEventListener('DOMContentLoaded', init);
})();
