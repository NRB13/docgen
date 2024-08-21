// toolbarLogic.js

document.addEventListener('DOMContentLoaded', () => {
    const documentArea = document.getElementById('document-area');
    const editorToolbar = document.getElementById('editor-toolbar');
    let selectedComponent = null;

    function updateStatusMessage(message, type = 'info') {
        const statusMessage = document.querySelector('.status-message');
        statusMessage.textContent = message;
        statusMessage.className = 'status-message'; // Reset classes
        statusMessage.classList.add(type);
        positionStatusMessage();
        setTimeout(() => {
            statusMessage.textContent = ''; // Clear message after 3 seconds
        }, 3000);
    }

    function positionStatusMessage() {
        const statusMessage = document.querySelector('.status-message');
        const toolbarRect = editorToolbar.getBoundingClientRect();
        const toolbarPosition = {
            top: toolbarRect.top + window.scrollY,
            left: toolbarRect.left + window.scrollX
        };

        if (toolbarPosition.top < 50) {
            statusMessage.style.bottom = `${window.innerHeight - toolbarRect.bottom}px`;
            statusMessage.style.top = 'auto';
        } else {
            statusMessage.style.top = `${toolbarPosition.top - 40}px`;
            statusMessage.style.bottom = 'auto';
        }

        if (toolbarPosition.left + statusMessage.offsetWidth > window.innerWidth) {
            statusMessage.style.left = `${toolbarPosition.left - statusMessage.offsetWidth + 20}px`;
        } else {
            statusMessage.style.left = `${toolbarPosition.left}px`;
        }

        statusMessage.style.opacity = 0.8; // Add transparency to the status message
    }

    function selectComponent(element) {
        if (selectedComponent) {
            selectedComponent.classList.remove('selected');
        }
        selectedComponent = element;
        selectedComponent.classList.add('selected');
        showEditorToolbar();
    }

    function showEditorToolbar() {
        editorToolbar.classList.remove('hidden');
        const rect = selectedComponent.getBoundingClientRect();
        editorToolbar.style.top = `${window.scrollY + rect.top - 60}px`;
        editorToolbar.style.left = `${Math.min(window.innerWidth - editorToolbar.offsetWidth - 20, rect.left)}px`;

        // Add event listeners for toolbar buttons
        document.getElementById('move-up-button').onclick = moveComponentUp;
        document.getElementById('move-down-button').onclick = moveComponentDown;
        document.getElementById('resize-button').onclick = showResizeModal;
        document.getElementById('delete-button').onclick = deleteComponent;
        document.getElementById('bold-button').onclick = () => toggleTextFormat('bold', 'bold-button');
        document.getElementById('italic-button').onclick = () => toggleTextFormat('italic', 'italic-button');
        document.getElementById('underline-button').onclick = () => toggleTextFormat('underline', 'underline-button');
    }

    function toggleTextFormat(command, buttonId) {
        document.execCommand(command);
        const button = document.getElementById(buttonId);
        button.classList.toggle('active');
        updateStatusMessage(`Text ${command} applied.`, 'success');
    }

    function moveComponentUp() {
        if (selectedComponent && selectedComponent.previousElementSibling) {
            documentArea.insertBefore(selectedComponent, selectedComponent.previousElementSibling);
            updateStatusMessage('Component moved up.', 'success');
        }
    }

    function moveComponentDown() {
        if (selectedComponent && selectedComponent.nextElementSibling) {
            documentArea.insertBefore(selectedComponent.nextElementSibling, selectedComponent);
            updateStatusMessage('Component moved down.', 'success');
        }
    }

    function showResizeModal() {
        const modal = document.createElement('div');
        modal.classList.add('inline-modal');
        const modalRect = selectedComponent.getBoundingClientRect();
        const offsetTop = window.scrollY + modalRect.top;
        modal.style.top = `${Math.min(window.innerHeight - modal.offsetHeight - 20, offsetTop)}px`;
        modal.style.left = `${Math.min(window.innerWidth - 240, modalRect.right + 10)}px`;

        const input = document.createElement('input');
        input.type = 'text';
        input.placeholder = 'Enter size (e.g., "width:100%; height:150px")';

        const saveButton = document.createElement('button');
        saveButton.textContent = 'Save';
        saveButton.onclick = () => {
            selectedComponent.style.cssText += input.value;
            document.body.removeChild(modal);
            updateStatusMessage('Component resized.', 'success');
        };

        modal.appendChild(input);
        modal.appendChild(saveButton);
        document.body.appendChild(modal);
    }

    function deleteComponent() {
        if (selectedComponent) {
            selectedComponent.remove();
            editorToolbar.classList.add('hidden');
            updateStatusMessage('Component deleted.', 'error');
        }
    }

    function handleDragStart(event) {
        event.dataTransfer.setData('text/plain', selectedComponent.outerHTML);
        selectedComponent.classList.add('dragging');
    }

    function handleDragOver(event) {
        event.preventDefault();
    }

    function handleDrop(event) {
        event.preventDefault();
        const data = event.dataTransfer.getData('text/plain');
        const dropTarget = event.target.closest('.document-component');
        if (dropTarget) {
            dropTarget.insertAdjacentHTML('beforebegin', data);
            document.querySelector('.dragging').remove();
        }
        selectedComponent.classList.remove('dragging');
        updateStatusMessage('Component moved.', 'success');
    }
});