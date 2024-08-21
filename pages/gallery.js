let db;

initSqlJs({ locateFile: file => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.6.2/${file}` }).then(function(SQL){
    db = new SQL.Database();
    db.run("CREATE TABLE IF NOT EXISTS documents (id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT, content TEXT, created_at DATETIME DEFAULT CURRENT_TIMESTAMP)");
});

function saveToGallery() {
    const title = prompt("Enter a title for your document:");
    if (title) {
        const content = documentArea.innerHTML;
        const styles = getAllStyles();
        const fullHtml = `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>${title}</title>
                <style>${styles}</style>
            </head>
            <body>
                ${content}
            </body>
            </html>
        `;
        db.run("INSERT INTO documents (title, content) VALUES (?, ?)", [title, fullHtml]);
        updateStatusMessage('Document saved to gallery.', 'success');
    }
}

function loadGallery() {
    const result = db.exec("SELECT id, title, created_at FROM documents ORDER BY created_at DESC");
    const galleryGrid = document.querySelector('.gallery-grid');
    galleryGrid.innerHTML = '';

    if (result[0] && result[0].values) {
        result[0].values.forEach(row => {
            const [id, title, createdAt] = row;
            const item = document.createElement('div');
            item.classList.add('gallery-item');
            item.innerHTML = `
                <h3>${title}</h3>
                <p>Created: ${new Date(createdAt).toLocaleString()}</p>
                <button onclick="viewDocument(${id})">View</button>
                <button onclick="editDocument(${id})">Edit</button>
                <button onclick="exportDocument(${id})">Export</button>
            `;
            galleryGrid.appendChild(item);
        });
    }
}

function viewDocument(id) {
    const result = db.exec("SELECT content FROM documents WHERE id = ?", [id]);
    if (result[0] && result[0].values) {
        const content = result[0].values[0][0];
        previewContent.innerHTML = content;
        previewModal.classList.remove('hidden');
    }
}

function editDocument(id) {
    const result = db.exec("SELECT content FROM documents WHERE id = ?", [id]);
    if (result[0] && result[0].values) {
        const content = result[0].values[0][0];
        const parser = new DOMParser();
        const doc = parser.parseFromString(content, 'text/html');
        documentArea.innerHTML = doc.body.innerHTML;
        updateStatusMessage('Document loaded for editing.', 'success');
    }
}

function exportDocument(id) {
    const result = db.exec("SELECT title, content FROM documents WHERE id = ?", [id]);
    if (result[0] && result[0].values) {
        const [title, content] = result[0].values[0];
        const blob = new Blob([content], { type: 'text/html' });
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = `${title}.html`;
        a.click();

        URL.revokeObjectURL(url);
        updateStatusMessage('Document exported as HTML.', 'success');
    }
}

// Add this to the existing DOMContentLoaded event listener
document.addEventListener('DOMContentLoaded', () => {
   

    const saveToGalleryButton = document.createElement('button');
    saveToGalleryButton.textContent = 'Save to Gallery';
    saveToGalleryButton.addEventListener('click', saveToGallery);
    document.querySelector('.toolbar').appendChild(saveToGalleryButton);

    // If you're on the gallery page, load the gallery
    if (document.querySelector('.gallery-grid')) {
        loadGallery();
    }
});