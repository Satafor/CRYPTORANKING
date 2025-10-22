// Share/Save controller focusing on board capture
(function () {
  let dialog;
  let closeBtn;
  let downloadBtn;
  let shareBtn;
  let toastEl;
  let getState;

  function init(options) {
    dialog = document.getElementById('saveDialog');
    closeBtn = document.getElementById('closeSaveDialog');
    downloadBtn = document.getElementById('downloadPngBtn');
    shareBtn = document.getElementById('shareToXBtn');
    toastEl = document.getElementById('toast');
    getState = options.getState;

    if (!dialog || !downloadBtn || !shareBtn) {
      console.warn('SaveController init skipped: missing elements');
      return;
    }

    if (closeBtn) closeBtn.addEventListener('click', closeDialog);
    dialog.addEventListener('click', (event) => {
      if (event.target === dialog) closeDialog();
    });

    downloadBtn.addEventListener('click', handleDownload);
    shareBtn.addEventListener('click', handleShare);
  }

  async function handleDownload() {
    closeDialog();
    const canvas = await generateCanvas();
    if (!canvas) return;
    const state = getState();
    const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
    const filename = `exchange-ranking-${timestamp}.png`;
    try {
      const blob = await new Promise((resolve, reject) => {
        canvas.toBlob((result) => {
          if (result) resolve(result); else reject(new Error('toBlob returned null'));
        }, 'image/png');
      });
      
      // 创建下载链接
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      link.style.display = 'none';
      
      // 添加到DOM并触发点击
      document.body.appendChild(link);
      link.click();
      
      // 延迟清理，确保下载完成
      setTimeout(() => {
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }, 100);
      
      showToast(getCopy('toastSaved', '图片已保存'));
    } catch (error) {
      console.error('Failed to export PNG', error);
      showToast(getCopy('toastCaptureError', '保存失败，请重试'));
    }
  }

  async function handleShare() {
    closeDialog();
    const canvas = await generateCanvas();
    if (!canvas) return;
    const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/png'));
    if (!blob) {
      showToast(getCopy('toastCaptureError'));
      return;
    }

    let imgUrl = '';
    try {
      imgUrl = URL.createObjectURL(blob);
    } catch (error) {
      console.warn('URL.createObjectURL failed', error);
    }

    await copyImageToClipboard(blob);
    showToast(getCopy('toastShareHint', '榜单图片已复制。如粘贴失败，可拖拽新标签页中的图片上传。'));

    const shareText = buildShareMessage();
    if (shareText) copyToClipboard(shareText);

    const intentUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`;
    window.open(intentUrl, '_blank');
    if (imgUrl) setTimeout(() => window.open(imgUrl, '_blank'), 500);
    if (imgUrl) setTimeout(() => URL.revokeObjectURL(imgUrl), 180000);
  }

  function closeDialog() {
    if (dialog) dialog.classList.add('hidden');
  }

  function showToast(message) {
    if (!toastEl) return;
    toastEl.textContent = message;
    toastEl.classList.remove('hidden');
    requestAnimationFrame(() => toastEl.classList.add('visible'));
    setTimeout(() => {
      toastEl.classList.remove('visible');
      setTimeout(() => toastEl.classList.add('hidden'), 350);
    }, 3000);
  }

  async function generateCanvas() {
    if (!window.html2canvas) {
      console.warn('html2canvas unavailable');
      showToast(getCopy('toastCaptureError', '截图库加载失败'));
      return null;
    }
    try {
      const boardElement = document.getElementById('board');
      if (!boardElement) {
        throw new Error('Board element not found');
      }
      
      // 使用 html2canvas 截取排行榜元素
      const canvas = await html2canvas(boardElement, {
        scale: 2,
        logging: false,
        useCORS: true,
        allowTaint: true,
        backgroundColor: window.getComputedStyle(boardElement).backgroundColor
      });
      
      return canvas;
    } catch (error) {
      console.error('Failed to capture screenshot', error);
      showToast(getCopy('toastCaptureError', '截图失败，请重试'));
      return null;
    }
  }

  function buildShareMessage() {
    const lines = [];
    lines.push('《从夯到拉锐评10大CEX排行榜》');
    lines.push('[评价单个或多个交易所，包括但不限于用户体验、UI丝滑度、手续费、交易所安全性稳定度等]');
    lines.push('');
    lines.push('快来评选你心中的CEX，关注作者@JL_EZM，提出交易所的使用意见瓜分10,000USDT奖金!');
    lines.push('');
    lines.push('活动地址 👉 https://cryptoranking.lol');
    lines.push('');
    lines.push('@上榜交易所的官推账号');
    lines.push('#Cryptoranking');
    return lines.filter(Boolean).join('
');
  }

  function copyToClipboard(text) {
    if (!navigator.clipboard) {
      const temp = document.createElement('textarea');
      temp.value = text;
      temp.style.position = 'fixed';
      temp.style.opacity = '0';
      document.body.appendChild(temp);
      temp.select();
      try { document.execCommand('copy'); } catch (error) { console.warn('Copy failed', error); }
      document.body.removeChild(temp);
      return;
    }
    navigator.clipboard.writeText(text).catch((error) => console.warn('Clipboard write failed', error));
  }

  async function copyImageToClipboard(blob) {
    try {
      if (navigator.clipboard && window.ClipboardItem) {
        const item = new ClipboardItem({ 'image/png': blob });
        await navigator.clipboard.write([item]);
        return true;
      }
    } catch (error) {
      console.warn('Clipboard image copy failed', error);
    }
    try {
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank');
      setTimeout(() => URL.revokeObjectURL(url), 30000);
    } catch (error) {
      console.warn('Fallback image open failed', error);
    }
    return false;
  }

  async function copyImageOnly() {
    const canvas = await generateCanvas();
    if (!canvas) return false;
    const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/png'));
    if (!blob) {
      showToast(getCopy('toastCaptureError', '生成图片失败'));
      return false;
    }
    const success = await copyImageToClipboard(blob);
    if (success) {
      showToast(getCopy('toastCopied', '图片已复制到剪贴板'));
    } else {
      showToast('图片已在新标签页打开');
    }
    return true;
  }

  function getCopy(key, fallback = '') {
    const state = getState();
    const dict = window.I18N.translations[state.lang] || window.I18N.translations.zh;
    const value = dict[key];
    if (typeof value === 'function') {
      try {
        return value(state.user?.id) ?? fallback;
      } catch (error) {
        return fallback || key;
      }
    }
    return value ?? fallback || key;
  }

  window.SaveController = {
    init,
    showToast,
    downloadNow: handleDownload,
    copyImageNow: copyImageOnly
  };
})();
