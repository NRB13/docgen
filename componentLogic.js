// componentLogic.js

document.addEventListener('DOMContentLoaded', () => {
    const packSelector = document.getElementById('pack-selector');
    const componentList = document.getElementById('component-list');
    const documentArea = document.getElementById('document-area');

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

    function applyGreenGlow(element) {
        element.classList.add('glowing');
        setTimeout(() => {
            element.classList.remove('glowing');
        }, 1000);
    }
});