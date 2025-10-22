(function () {
    const tiers = [
        { id: 'god', colorVar: '--tier-god' },
        { id: 'elite', colorVar: '--tier-elite' },
        { id: 'pro', colorVar: '--tier-pro' },
        { id: 'npc', colorVar: '--tier-npc' },
        { id: 'low', colorVar: '--tier-low' }
    ];

    const translations = {
        zh: {
            heroTitle: () => '交易所从夯到拉排行榜',
            heroSubtitle: '拖拽交易所到目标等级，生成你的专属榜单。',
            heroAvatarText: () => '榜',
            poolTitle: '候选交易所',
            placeholders: {
                god: '顶级天花板',
                elite: '实力派常驻',
                pro: '稳定好用之选',
                npc: 'NPC 等级',
                low: '拉完了，别用'
            },
            tiers: {
                god: '夯',
                elite: '顶尖',
                pro: '人上人',
                npc: 'NPC',
                low: '拉完了'
            },
            reset: '重置',
            copyImage: '复制图片',
            saveDialogTitle: '保存 / 分享',
            downloadPng: '保存为 PNG 图片',
            shareToX: '发布到 X',
            toastSaved: 'PNG 已保存。',
            toastCopied: '图片已复制到剪贴板',
            toastReset: '已恢复初始状态。',
            toastShareHint: '模板已复制，前往 X 完成发布。',
            toastCaptureError: '捕获失败，请稍后再试。'
        },
        en: {
            heroTitle: () => 'CEX Power Ranking',
            heroSubtitle: 'Drag exchanges into tiers to build your ranking.',
            heroAvatarText: () => 'C',
            poolTitle: 'Bench Exchanges',
            placeholders: {
                god: 'Legendary tier',
                elite: 'Top exchanges belong here',
                pro: 'Solid everyday picks',
                npc: 'NPC tier',
                low: 'Washed? Hard pass'
            },
            tiers: {
                god: 'God Tier',
                elite: 'Elite',
                pro: 'Pro',
                npc: 'NPC',
                low: 'Dumpster'
            },
            reset: 'Reset',
            copyImage: 'Copy Image',
            saveDialogTitle: 'Save / Share',
            downloadPng: 'Save as PNG',
            shareToX: 'Post on X',
            toastSaved: 'PNG saved.',
            toastCopied: 'Image copied to clipboard',
            toastReset: 'Ranking restored.',
            toastShareHint: 'Template copied. Finish on X.',
            toastCaptureError: 'Capture failed. Please try again.'
        }
    };

    window.I18N = {
        tiers,
        translations,
        get(lang, key) {
            const dict = translations[lang] || translations.zh;
            return typeof dict[key] === 'function' ? dict[key]() : dict[key];
        }
    };
})();
