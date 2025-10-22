(function () {
    let draggedElement = null;
    let draggedData = null;
    let ghostElement = null;
    let currentDropzone = null;

    function makeCardDraggable(card) {
        // 鼠标拖拽事件
        card.setAttribute('draggable', 'true');
        card.addEventListener('dragstart', handleDragStart);
        card.addEventListener('dragend', handleDragEnd);
        
        // 触摸拖拽事件（手机端）
        card.addEventListener('touchstart', handleTouchStart, { passive: false });
        card.addEventListener('touchmove', handleTouchMove, { passive: false });
        card.addEventListener('touchend', handleTouchEnd, { passive: false });
    }

    function bindDropzone(zone, onDrop) {
        // 鼠标事件
        zone.addEventListener('dragover', (event) => handleDragOver(event, zone));
        zone.addEventListener('dragleave', () => zone.classList.remove('drag-over'));
        zone.addEventListener('drop', (event) => handleDrop(event, zone, onDrop));
        
        // 触摸事件（手机端）
        zone.dataset.dropCallback = 'callback_' + Math.random().toString(36).substr(2, 9);
        window[zone.dataset.dropCallback] = onDrop;
    }

    // ==================== 鼠标拖拽 ====================
    
    function handleDragStart(event) {
        const card = event.currentTarget;
        const id = card.dataset.id;
        const origin = card.dataset.origin;
        card.classList.add('dragging');
        event.dataTransfer.effectAllowed = 'move';
        event.dataTransfer.setData('application/x-exchange-id', id);
        event.dataTransfer.setData('text/plain', id);
        const meta = JSON.stringify({ origin });
        event.dataTransfer.setData('application/x-exchange-meta', meta);
    }

    function handleDragEnd(event) {
        event.currentTarget.classList.remove('dragging');
    }

    function handleDragOver(event, zone) {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
        zone.classList.add('drag-over');
    }

    function handleDrop(event, zone, onDrop) {
        event.preventDefault();
        const id = event.dataTransfer.getData('application/x-exchange-id') || event.dataTransfer.getData('text/plain');
        const metaRaw = event.dataTransfer.getData('application/x-exchange-meta');
        const meta = metaRaw ? JSON.parse(metaRaw) : {};
        zone.classList.remove('drag-over');
        if (!id) return;
        const position = resolveDropIndex(event, zone);
        onDrop({ id, zone, position, meta });
    }

    // ==================== 触摸拖拽（手机端）====================
    
    function handleTouchStart(event) {
        const card = event.currentTarget;
        draggedElement = card;
        draggedData = {
            id: card.dataset.id,
            origin: card.dataset.origin
        };
        
        // 创建拖拽时的视觉反馈
        card.classList.add('dragging');
        
        // 创建跟随手指的幽灵元素
        createGhostElement(card, event.touches[0]);
    }

    function handleTouchMove(event) {
        if (!draggedElement) return;
        event.preventDefault();
        
        const touch = event.touches[0];
        
        // 移动幽灵元素
        if (ghostElement) {
            ghostElement.style.left = touch.pageX - ghostElement.offsetWidth / 2 + 'px';
            ghostElement.style.top = touch.pageY - ghostElement.offsetHeight / 2 + 'px';
        }
        
        // 检测当前触摸位置下的drop zone
        const elementBelow = document.elementFromPoint(touch.clientX, touch.clientY);
        const dropzone = elementBelow?.closest('.tier-dropzone, .exchange-pool');
        
        // 移除之前的高亮
        if (currentDropzone && currentDropzone !== dropzone) {
            currentDropzone.classList.remove('drag-over');
        }
        
        // 添加新的高亮
        if (dropzone && dropzone !== currentDropzone) {
            dropzone.classList.add('drag-over');
            currentDropzone = dropzone;
        }
    }

    function handleTouchEnd(event) {
        if (!draggedElement) return;
        event.preventDefault();
        
        const touch = event.changedTouches[0];
        const elementBelow = document.elementFromPoint(touch.clientX, touch.clientY);
        const dropzone = elementBelow?.closest('.tier-dropzone, .exchange-pool');
        
        // 清理
        draggedElement.classList.remove('dragging');
        if (ghostElement) {
            ghostElement.remove();
            ghostElement = null;
        }
        if (currentDropzone) {
            currentDropzone.classList.remove('drag-over');
        }
        
        // 处理放置
        if (dropzone && draggedData) {
            const callbackName = dropzone.dataset.dropCallback;
            const callback = window[callbackName];
            
            if (callback) {
                const position = resolveTouchDropIndex(touch, dropzone);
                callback({
                    id: draggedData.id,
                    zone: dropzone,
                    position: position,
                    meta: { origin: draggedData.origin }
                });
            }
        }
        
        draggedElement = null;
        draggedData = null;
        currentDropzone = null;
    }

    function createGhostElement(card, touch) {
        ghostElement = card.cloneNode(true);
        ghostElement.classList.add('ghost-drag');
        ghostElement.style.position = 'fixed';
        ghostElement.style.pointerEvents = 'none';
        ghostElement.style.zIndex = '9999';
        ghostElement.style.opacity = '0.8';
        ghostElement.style.transform = 'scale(1.1)';
        ghostElement.style.left = touch.pageX - card.offsetWidth / 2 + 'px';
        ghostElement.style.top = touch.pageY - card.offsetHeight / 2 + 'px';
        document.body.appendChild(ghostElement);
    }

    function resolveTouchDropIndex(touch, zone) {
        const cards = Array.from(zone.querySelectorAll('.exchange-card:not(.dragging)'));
        if (!cards.length) return undefined;
        
        const zoneRect = zone.getBoundingClientRect();
        const offsetX = touch.clientX - zoneRect.left;
        const offsetY = touch.clientY - zoneRect.top;
        
        let closestIndex = cards.length;
        let smallest = Number.POSITIVE_INFINITY;
        
        cards.forEach((card, index) => {
            const rect = card.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2 - zoneRect.left;
            const centerY = rect.top + rect.height / 2 - zoneRect.top;
            const distance = Math.hypot(centerX - offsetX, centerY - offsetY);
            
            if (distance < smallest) {
                smallest = distance;
                closestIndex = index;
            }
        });
        
        if (closestIndex >= cards.length) return undefined;
        
        const targetCard = cards[closestIndex];
        const rect = targetCard.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        
        // 在手机端，通常是水平排列
        const horizontal = zoneRect.width > zoneRect.height;
        if (horizontal) {
            return touch.clientX < centerX ? closestIndex : closestIndex + 1;
        }
        return touch.clientY < centerY ? closestIndex : closestIndex + 1;
    }

    // ==================== 通用函数 ====================
    
    function resolveDropIndex(event, zone) {
        const cards = Array.from(zone.querySelectorAll('.exchange-card'));
        if (!cards.length) return undefined;
        const zoneRect = zone.getBoundingClientRect();
        const offsetX = event.clientX - zoneRect.left;
        const offsetY = event.clientY - zoneRect.top;
        const horizontal = zoneRect.width > zoneRect.height;
        let closestIndex = cards.length;
        let smallest = Number.POSITIVE_INFINITY;
        cards.forEach((card, index) => {
            if (card.classList.contains('dragging')) return;
            const rect = card.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2 - zoneRect.left;
            const centerY = rect.top + rect.height / 2 - zoneRect.top;
            const distance = Math.hypot(centerX - offsetX, centerY - offsetY);
            if (distance < smallest) {
                smallest = distance;
                closestIndex = index;
            }
        });
        if (closestIndex >= cards.length) return undefined;
        const targetCard = cards[closestIndex];
        const rect = targetCard.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        if (horizontal) {
            return event.clientX < centerX ? closestIndex : closestIndex + 1;
        }
        return event.clientY < centerY ? closestIndex : closestIndex + 1;
    }

    window.Drag = {
        makeCardDraggable,
        bindDropzone
    };
})();
