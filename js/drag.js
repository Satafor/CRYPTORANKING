(function () {
    function makeCardDraggable(card) {
        card.setAttribute('draggable', 'true');
        card.addEventListener('dragstart', handleDragStart);
        card.addEventListener('dragend', handleDragEnd);
    }

    function bindDropzone(zone, onDrop) {
        zone.addEventListener('dragover', (event) => handleDragOver(event, zone));
        zone.addEventListener('dragleave', () => zone.classList.remove('drag-over'));
        zone.addEventListener('drop', (event) => handleDrop(event, zone, onDrop));
    }

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
