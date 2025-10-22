(function () {
    const TIER_META = [
        { id: 'god', color: '#ef4444' },
        { id: 'elite', color: '#f97316' },
        { id: 'pro', color: '#fbbf24' },
        { id: 'npc', color: '#fde68a' },
        { id: 'low', color: '#e5e7eb' }
    ];

    const THEMES = {
        light: {
            background: '#f4f6fb',
            panel: '#ffffff',
            rightPanel: '#f1f3f8',
            text: '#1b1e2c',
            textSecondary: '#5c6178',
            placeholder: '#9aa5b7',
            divider: 'rgba(148, 163, 184, 0.35)',
            avatarGradient: ['#72a0fe', '#9aa9ff'],
            avatarInitial: '#ffffff'
        },
        dark: {
            background: '#0c1220',
            panel: '#10172a',
            rightPanel: '#1a2338',
            text: '#f8fafc',
            textSecondary: '#94a3b8',
            placeholder: '#6d7a95',
            divider: 'rgba(71, 85, 105, 0.55)',
            avatarGradient: ['#3b82f6', '#6366f1'],
            avatarInitial: '#f8fafc'
        }
    };

    const iconCache = new Map();

    function drawRoundedRect(ctx, x, y, width, height, radius) {
        const r = typeof radius === 'number'
            ? { tl: radius, tr: radius, br: radius, bl: radius }
            : { tl: 0, tr: 0, br: 0, bl: 0, ...radius };
        ctx.beginPath();
        ctx.moveTo(x + r.tl, y);
        ctx.lineTo(x + width - r.tr, y);
        ctx.quadraticCurveTo(x + width, y, x + width, y + r.tr);
        ctx.lineTo(x + width, y + height - r.br);
        ctx.quadraticCurveTo(x + width, y + height, x + width - r.br, y + height);
        ctx.lineTo(x + r.bl, y + height);
        ctx.quadraticCurveTo(x, y + height, x, y + height - r.bl);
        ctx.lineTo(x, y + r.tl);
        ctx.quadraticCurveTo(x, y, x + r.tl, y);
        ctx.closePath();
    }

    function loadImage(src) {
        if (!src) return Promise.resolve(null);
        if (iconCache.has(src)) return iconCache.get(src);
        const promise = new Promise((resolve) => {
            const img = new Image();
            img.onload = () => resolve(img);
            img.onerror = () => resolve(null);
            if (!src.startsWith('data:')) {
                img.crossOrigin = 'anonymous';
            }
            img.src = src;
        });
        iconCache.set(src, promise);
        return promise;
    }

    function getExchangeById(id) {
        if (!window.AppState) return null;
        return window.AppState.getExchangeById(id);
    }

    function getTierMeta(id) {
        return TIER_META.find((tier) => tier.id === id) || TIER_META[0];
    }

    function measureTitle(ctx, text, maxWidth) {
        if (ctx.measureText(text).width <= maxWidth) return text;
        let truncated = text;
        while (truncated.length && ctx.measureText(`${truncated}\u2026`).width > maxWidth) {
            truncated = truncated.slice(0, -1);
        }
        return `${truncated}\u2026`;
    }

    function createFallbackAvatar(ctx, x, y, radius, theme, letter) {
        const gradient = ctx.createLinearGradient(x - radius, y - radius, x + radius, y + radius);
        gradient.addColorStop(0, theme.avatarGradient[0]);
        gradient.addColorStop(1, theme.avatarGradient[1]);
        ctx.save();
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = theme.avatarInitial;
        ctx.font = '600 32px "Segoe UI", "PingFang SC", "Microsoft YaHei", sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(letter, x, y + 1);
        ctx.restore();
    }

    async function drawAvatar(ctx, state, theme, x, y, radius) {
        const avatar = state.user?.avatar;
        if (avatar) {
            const img = await loadImage(avatar);
            if (img) {
                ctx.save();
                ctx.beginPath();
                ctx.arc(x, y, radius, 0, Math.PI * 2);
                ctx.clip();
                ctx.drawImage(img, x - radius, y - radius, radius * 2, radius * 2);
                ctx.restore();
                return;
            }
        }
        const initial = (state.user?.id || 'U').trim().charAt(0).toUpperCase() || 'U';
        createFallbackAvatar(ctx, x, y, radius, theme, initial);
    }

    async function drawTierIcons(ctx, placements, rowY, iconStartX, iconSize, gap, centerY) {
        let currentX = iconStartX;
        for (const exchangeId of placements) {
            const exchange = getExchangeById(exchangeId);
            if (!exchange) continue;
            const img = await loadImage(exchange.icon);
            ctx.save();
            drawRoundedRect(ctx, currentX, centerY - iconSize / 2, iconSize, iconSize, 20);
            ctx.fillStyle = '#ffffff';
            ctx.fill();
            if (img) {
                ctx.clip();
                const padding = 12;
                ctx.drawImage(img, currentX + padding, centerY - iconSize / 2 + padding, iconSize - padding * 2, iconSize - padding * 2);
            }
            ctx.restore();
            currentX += iconSize + gap;
        }
        return currentX;
    }

    async function render(state, options = {}) {
        const lang = state.lang || 'zh';
        const dict = window.I18N && window.I18N.translations ? (window.I18N.translations[lang] || window.I18N.translations.zh) : null;
        if (!dict) {
            throw new Error('Translations not available.');
        }
        const themeKey = state.theme === 'dark' ? 'dark' : 'light';
        const theme = THEMES[themeKey];

        const width = options.width || 912;
        const marginX = 0;
        const marginTop = 0;
        const marginBottom = 0;
        const rowHeight = 104;
        const labelWidth = 128;
        const iconSize = 80;
        const iconGap = 14;

        const tiers = window.I18N.tiers;
        const boardHeight = rowHeight * tiers.length;
        const totalHeight = marginTop + boardHeight + marginBottom;
        const scale = options.scale || Math.min(2, window.devicePixelRatio || 2);

        const canvas = document.createElement('canvas');
        canvas.width = Math.round(width * scale);
        canvas.height = Math.round(totalHeight * scale);
        const ctx = canvas.getContext('2d');
        ctx.scale(scale, scale);

        const contentWidth = width - marginX * 2;
        const boardX = marginX;
        const boardY = marginTop;

        ctx.save();
        ctx.shadowColor = themeKey === 'dark' ? 'rgba(3, 7, 18, 0.35)' : 'rgba(15, 23, 42, 0.12)';
        ctx.shadowBlur = 28;
        ctx.shadowOffsetY = 16;
        ctx.fillStyle = theme.panel;
        drawRoundedRect(ctx, boardX, boardY, contentWidth, boardHeight, 24);
        ctx.fill();
        ctx.restore();

        ctx.strokeStyle = theme.divider;
        ctx.lineWidth = 1;
        for (let i = 1; i < tiers.length; i += 1) {
            const y = boardY + rowHeight * i;
            ctx.beginPath();
            ctx.moveTo(boardX + labelWidth, y);
            ctx.lineTo(boardX + contentWidth, y);
            ctx.stroke();
        }

        ctx.font = '700 24px "Segoe UI", "PingFang SC", "Microsoft YaHei", sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        for (let index = 0; index < tiers.length; index += 1) {
            const tier = tiers[index];
            const rowTop = boardY + rowHeight * index;
            const labelMeta = getTierMeta(tier.id);
            const labelRadius = {
                tl: index === 0 ? 24 : 0,
                bl: index === tiers.length - 1 ? 24 : 0,
                tr: 0,
                br: 0
            };
            ctx.fillStyle = labelMeta.color;
            drawRoundedRect(ctx, boardX, rowTop, labelWidth, rowHeight, labelRadius);
            ctx.fill();

            const labelText = dict.tiers[tier.id] || tier.id;
            ctx.fillStyle = '#ffffff';
            ctx.fillText(labelText, boardX + labelWidth / 2, rowTop + rowHeight / 2);

            const rightRadius = {
                tl: index === 0 ? 24 : 0,
                tr: index === 0 ? 24 : 0,
                bl: index === tiers.length - 1 ? 24 : 0,
                br: index === tiers.length - 1 ? 24 : 0
            };
            ctx.fillStyle = theme.rightPanel;
            drawRoundedRect(ctx, boardX + labelWidth, rowTop, contentWidth - labelWidth, rowHeight, rightRadius);
            ctx.fill();

            const placements = state.placements[tier.id] || [];
            if (!placements.length) {
                ctx.save();
                ctx.textAlign = 'left';
                ctx.fillStyle = theme.placeholder;
                ctx.font = '500 17px "Segoe UI", "PingFang SC", "Microsoft YaHei", sans-serif';
                ctx.fillText(dict.placeholders[tier.id] || '', boardX + labelWidth + 24, rowTop + rowHeight / 2 + 6);
                ctx.restore();
            }

            const iconStartX = boardX + labelWidth + 24;
            const centerY = rowTop + rowHeight / 2;
            await drawTierIcons(ctx, placements, rowTop, iconStartX, iconSize, iconGap, centerY);
        }

        return canvas;
    }

    window.CanvasRenderer = {
        render
    };
})();
