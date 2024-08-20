document.addEventListener('DOMContentLoaded', () => {
    const packSelector = document.getElementById('pack-selector');
    const componentList = document.getElementById('component-list');
    const documentArea = document.getElementById('document-area');
    const editorToolbar = document.getElementById('editor-toolbar');
    let selectedComponent = null;

    // Component packs data
    const componentPacks = {
        'general-pack': [
            { name: 'Header', component: 'header' },
            { name: 'Paragraph', component: 'paragraph' },
            { name: 'Image', component: 'image' },
            { name: 'Table', component: 'table' },
            { name: 'Footer', component: 'footer' }
        ],
        'presentation-pack': [
            { name: 'Bar Chart', component: 'bar-chart' },
            { name: 'Line Graph', component: 'line-graph' },
            { name: 'Pie Chart', component: 'pie-chart' },
            { name: 'Data Cue', component: 'data-cue' }
        ],
        'professional-pack': [
            { name: 'Section Header', component: 'section-header' },
            { name: 'Subtitle', component: 'subtitle' },
            { name: 'Text Block', component: 'text-block' },
            { name: 'Title', component: 'title' },
            { name: 'Footer', component: 'footer' }
        ]
    };

    // Populate component list based on the selected pack
    packSelector.addEventListener('change', (event) => {
        const selectedPack = event.target.value;
        const components = componentPacks[selectedPack];

        // Clear the current list
        componentList.innerHTML = '';

        // Populate the list with the selected pack's components
        components.forEach(component => {
            const li = document.createElement('li');
            li.textContent = component.name;
            li.dataset.pack = selectedPack;
            li.dataset.component = component.component;
            componentList.appendChild(li);
        });
    });

    // Load and add components to the document area
    componentList.addEventListener('click', async (event) => {
        if (event.target.tagName === 'LI') {
            const packName = event.target.dataset.pack;
            const componentName = event.target.dataset.component;
            try {
                const componentHtml = await loadComponent(packName, componentName);
                const componentElement = createComponentElement(componentHtml);
                documentArea.appendChild(componentElement);
                removePlaceholder();
                updateStatusMessage(`${componentName} added.`, 'success');
                applyGreenGlow(componentElement);
            } catch (error) {
                console.error(`Failed to load component: ${componentName}`, error);
                updateStatusMessage(`Error: Unable to add ${componentName}.`, 'error');
            }
        }
    });

    async function loadComponent(packName, componentName) {
        const url = `components/${packName}/${componentName}.html`;
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.text(); // Load the component's HTML
        } catch (error) {
            console.error('Fetch error:', error);
            return `<div class="error">[${componentName} component failed to load from ${url}]</div>`;
        }
    }

    function createComponentElement(htmlContent) {
        const element = document.createElement('div');
        element.classList.add('document-component');
        element.innerHTML = htmlContent;
        element.contentEditable = true;

        // Attach Event Listeners
        element.addEventListener('click', () => selectComponent(element));
        element.addEventListener('dragstart', handleDragStart);
        element.addEventListener('dragover', handleDragOver);
        element.addEventListener('drop', handleDrop);

        return element;
    }

    function removePlaceholder() {
        const placeholder = document.querySelector('.placeholder-text');
        if (placeholder) placeholder.remove();
    }

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

    function formatText(command) {
        document.execCommand(command);
        updateStatusMessage(`Text ${command} applied.`, 'success');
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

    function applyGreenGlow(element) {
        element.classList.add('glowing');
        setTimeout(() => {
            element.classList.remove('glowing');
        }, 1000);
    }

    // Toolbar Buttons
    document.getElementById('save-button').addEventListener('click', () => {
        const content = documentArea.innerHTML;
        localStorage.setItem('savedDocument', content);
        updateStatusMessage('Document saved successfully.', 'success');
    });

    document.getElementById('export-button').addEventListener('click', () => {
        updateStatusMessage('Document exported as PDF.', 'success');
    });

    document.getElementById(`clear-button`).addEventListener(`click`, () => {
        documentArea.innerHTML = `<p class="placeholder-text">Drag components here to start building your document.</p>`;
        editorToolbar.classList.add(`hidden`);
        updateStatusMessage(`Document cleared.`, 'error');
    });
});

// ... (existing code remains unchanged)

async function loadComponent(packName, componentName) {
    const url = `components/${packName}/${componentName}.html`;
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.text();
    } catch (error) {
        console.error('Fetch error:', error);
        return `<div class="error">[${componentName} component failed to load from ${url}]</div>`;
    }
}

function createComponentElement(htmlContent) {
    const element = document.createElement('div');
    element.classList.add('document-component');
    element.innerHTML = htmlContent;
    element.contentEditable = true;

    // Attach Event Listeners
    element.addEventListener('click', () => selectComponent(element));
    element.addEventListener('dragstart', handleDragStart);
    element.addEventListener('dragover', handleDragOver);
    element.addEventListener('drop', handleDrop);

    // Add chart initialization
    initializeChart(element);

    return element;
}

function initializeChart(element) {
    const chartContainer = element.querySelector('.chart-container');
    const chartType = element.classList.contains('doc-bar-chart') ? 'bar' :
                      element.classList.contains('doc-pie-chart') ? 'pie' :
                      element.classList.contains('doc-line-graph') ? 'line' : null;

    if (chartType) {
        const ctx = document.createElement('canvas');
        chartContainer.appendChild(ctx);
        const chart = new Chart(ctx, {
            type: chartType,
            data: {
                labels: ['Red', 'Blue', 'Yellow', 'Green', 'Purple', 'Orange'],
                datasets: [{
                    label: '# of Votes',
                    data: [12, 19, 3, 5, 2, 3],
                    backgroundColor: [
                        'rgba(255, 99, 132, 0.2)',
                        'rgba(54, 162, 235, 0.2)',
                        'rgba(255, 206, 86, 0.2)',
                        'rgba(75, 192, 192, 0.2)',
                        'rgba(153, 102, 255, 0.2)',
                        'rgba(255, 159, 64, 0.2)'
                    ],
                    borderColor: [
                        'rgba(255, 99, 132, 1)',
                        'rgba(54, 162, 235, 1)',
                        'rgba(255, 206, 86, 1)',
                        'rgba(75, 192, 192, 1)',
                        'rgba(153, 102, 255, 1)',
                        'rgba(255, 159, 64, 1)'
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false
            }
        });

        // Add event listeners for input fields
        const toggleInputs = element.querySelector('.toggle-inputs');
        const inputFields = element.querySelector('.input-fields');
        const addDataBtn = element.querySelector('.add-data');
        const updateChartBtn = element.querySelector('.update-chart');

        toggleInputs.addEventListener('click', () => {
            inputFields.style.display = inputFields.style.display === 'none' ? 'block' : 'none';
        });

        addDataBtn.addEventListener('click', () => {
            const labelInput = element.querySelector('.label-input');
            const valueInput = element.querySelector('.value-input');
            if (labelInput.value && valueInput.value) {
                chart.data.labels.push(labelInput.value);
                chart.data.datasets[0].data.push(parseFloat(valueInput.value));
                labelInput.value = '';
                valueInput.value = '';
                chart.update();
            }
        });

        updateChartBtn.addEventListener('click', () => {
            chart.update();
        });
    } else if (element.classList.contains('doc-data-cue')) {
        const dataCueContainer = element.querySelector('.data-cue-container');
        const addDataBtn = element.querySelector('.add-data');
        const updateDataBtn = element.querySelector('.update-chart');

        addDataBtn.addEventListener('click', () => {
            const labelInput = element.querySelector('.label-input');
            const valueInput = element.querySelector('.value-input');
            if (labelInput.value && valueInput.value) {
                const dataCue = document.createElement('div');
                dataCue.classList.add('data-cue');
                dataCue.innerHTML = `
                    <div class="label">${labelInput.value}</div>
                    <div class="value">${valueInput.value}</div>
                `;
                dataCueContainer.appendChild(dataCue);
                labelInput.value = '';
                valueInput.value = '';
            }
        });

        updateDataBtn.addEventListener('click', () => {
            // This button doesn't need to do anything for data cues
            console.log('Data cues updated');
        });
    }
}
