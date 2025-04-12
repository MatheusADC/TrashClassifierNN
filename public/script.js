const MODEL_PATH = "/model/";

const imageUpload = document.getElementById('imageUpload');
const uploadLabel = document.getElementById('upload-label');
const imagePreview = document.getElementById('image-preview');
const previewContainer = document.getElementById('preview-container');
const imageInfo = document.getElementById('image-info');
const resetButton = document.getElementById('reset-button');
const classifyButton = document.getElementById('classify-button');
const labelContainer = document.getElementById('label-container');
const noResults = document.getElementById('no-results');

let model, maxPredictions;

const wasteCategories = {
    'paper': { icon: '📄', color: '#3498DB' },
    'cardboard': { icon: '📦', color: '#E67E22' },
    'plastic': { icon: '🥤', color: '#9B59B6' },
    'metal': { icon: '🥫', color: '#7F8C8D' },
    'glass': { icon: '🍶', color: '#1ABC9C' },
    'trash': { icon: '🗑️', color: '#E74C3C' },
    'organic': { icon: '🍎', color: '#2ECC71' },
    'battery': { icon: '🔋', color: '#F1C40F' },
    'clothes': { icon: '👕', color: '#34495E' },
    'shoes': { icon: '👟', color: '#95A5A6' }
};

const defaultCategory = { icon: '❓', color: '#BDC3C7' };

// Maximum dimensions for preview
const MAX_WIDTH = 800;
const MAX_HEIGHT = 600;

window.onload = async () => {
    try {
        await loadModel();
        console.log("Model loaded successfully");
    } catch (error) {
        console.error("Error loading model:", error);
    }
};

async function loadModel() {
    const modelURL = MODEL_PATH + "model.json";
    const metadataURL = MODEL_PATH + "metadata.json";

    try {
        if (typeof tmImage === 'undefined') {
            console.error("Teachable Machine library not loaded");
            throw new Error("Teachable Machine library not loaded");
        }
        
        model = await tmImage.load(modelURL, metadataURL);
        maxPredictions = model.getTotalClasses();
        console.log(`Model loaded with ${maxPredictions} classes`);
    } catch (error) {
        console.error("Failed to load model:", error);
        throw error;
    }
}

imageUpload.addEventListener('change', function (event) {
    const file = event.target.files[0];
    if (file) {
        processAndDisplayImage(file);
    }
});

function processAndDisplayImage(file) {
    if (!file.type.match('image.*')) {
        alert("Please select an image file.");
        return;
    }
    
    if (file.size > 10 * 1024 * 1024) {
        alert("File is too large. Please select an image smaller than 10MB.");
        return;
    }
    
    const reader = new FileReader();

    reader.onload = function (e) {
        const img = new Image();
        
        img.onload = function () {
            const width = img.width;
            const height = img.height;
        
            let resizedImage;
            let resizedWidth = width;
            let resizedHeight = height;
            
            if (width > MAX_WIDTH || height > MAX_HEIGHT) {
                try {
                    resizedImage = resizeImage(img, MAX_WIDTH, MAX_HEIGHT);
                    const scaleFactor = Math.min(MAX_WIDTH / width, MAX_HEIGHT / height);
                    resizedWidth = Math.round(width * scaleFactor);
                    resizedHeight = Math.round(height * scaleFactor);
                } catch (error) {
                    console.error("Error resizing image:", error);
                    resizedImage = e.target.result;
                }
            } else {
                resizedImage = e.target.result;
            }
            
            imagePreview.src = resizedImage;
            
            previewContainer.style.display = 'block';
            uploadLabel.style.display = 'none';
            
            classifyButton.disabled = false;
            
            const fileSize = formatFileSize(file.size);
            const fileName = file.name;
            imageInfo.innerHTML = `${fileName} (${fileSize}) <span class="image-dimensions">${width}×${height}px${width !== resizedWidth ? ` → ${resizedWidth}×${resizedHeight}px` : ''}</span>`;
            
            noResults.style.display = 'flex';
            labelContainer.innerHTML = '';
            labelContainer.appendChild(noResults);
        };
        
        img.onerror = function() {
            alert("Error loading image. Please try another file.");
            resetUpload();
        };
        
        img.src = e.target.result;
    };
    
    reader.onerror = function() {
        alert("Error reading file. Please try another file.");
        resetUpload();
    };

    reader.readAsDataURL(file);
}
function resizeImage(img, maxWidth, maxHeight) {
    try {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
    
        const scaleFactor = Math.min(maxWidth / width, maxHeight / height);
        width = Math.round(width * scaleFactor);
        height = Math.round(height * scaleFactor);
        
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        
        ctx.drawImage(img, 0, 0, width, height);
        
        return canvas.toDataURL('image/jpeg', 0.9);
    } catch (error) {
        console.error("Error in resizeImage:", error);
        throw error;
    }
}

function formatFileSize(bytes) {
    if (bytes < 1024) return bytes + ' bytes';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    else return (bytes / 1048576).toFixed(1) + ' MB';
}

['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
    uploadLabel.addEventListener(eventName, preventDefaults, false);
});

function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
}

['dragenter', 'dragover'].forEach(eventName => {
    uploadLabel.addEventListener(eventName, highlight, false);
});

['dragleave', 'drop'].forEach(eventName => {
    uploadLabel.addEventListener(eventName, unhighlight, false);
});

function highlight() {
    uploadLabel.classList.add('highlight');
}

function unhighlight() {
    uploadLabel.classList.remove('highlight');
}

uploadLabel.addEventListener('drop', handleDrop, false);

function handleDrop(e) {
    const dt = e.dataTransfer;
    const file = dt.files[0];

    if (file && file.type.match('image.*')) {
        imageUpload.files = dt.files;
        processAndDisplayImage(file);
    }
}

resetButton.addEventListener('click', function () {
    resetUpload();
});

function resetUpload() {
    imagePreview.src = '#';
    previewContainer.style.display = 'none';
    uploadLabel.style.display = 'flex';
    classifyButton.disabled = true;
    imageInfo.textContent = '';
    imageUpload.value = '';
    noResults.style.display = 'flex';
    labelContainer.innerHTML = '';
    labelContainer.appendChild(noResults);
}

classifyButton.addEventListener('click', async function () {
    if (!model) {
        try {
            await loadModel();
        } catch (error) {
            alert("Failed to load the model. Please try again later.");
            return;
        }
    }

    classifyButton.disabled = true;
    classifyButton.innerHTML = '<svg class="spinner" viewBox="0 0 50 50"><circle class="path" cx="25" cy="25" r="20" fill="none" stroke-width="5"></circle></svg> Classifying...';

    noResults.style.display = 'none';

    try {
        const img = document.getElementById('image-preview');

        const predictions = await model.predict(img);

        displayResults(predictions);
    } catch (error) {
        console.error("Error during classification:", error);
        labelContainer.innerHTML = `<div class="error-message">Error during classification: ${error.message}</div>`;
    } finally {
        classifyButton.textContent = 'Classify Again';
        classifyButton.disabled = false;
    }
});

function displayResults(predictions) {
    labelContainer.innerHTML = '';

    predictions.sort((a, b) => b.probability - a.probability);

    predictions.forEach((prediction, index) => {
        const category = prediction.className.toLowerCase();
        const { icon, color } = wasteCategories[category] || defaultCategory;
        const probability = Math.round(prediction.probability * 100);

        const resultItem = document.createElement('div');
        resultItem.className = 'result-item';
        resultItem.style.animationDelay = `${index * 0.1}s`;

        resultItem.innerHTML = `
      <div class="result-icon" style="background-color: ${color}20; color: ${color}">
        ${icon}
      </div>
      <div class="result-details">
        <div class="result-name">${prediction.className}</div>
        <div class="result-probability">${probability}% confidence</div>
        <div class="progress-bar">
          <div class="progress-fill" style="width: ${probability}%; background-color: ${color}"></div>
        </div>
      </div>
    `;
        labelContainer.appendChild(resultItem);
    });
}
