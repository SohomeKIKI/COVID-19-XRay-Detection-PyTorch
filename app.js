document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('uploadForm');
    const imageInput = document.getElementById('xrayImage');
    const imagePreview = document.getElementById('imagePreview');
    const preview = document.getElementById('preview');
    const results = document.getElementById('results');
    const resultContent = document.getElementById('resultContent');
    const uploadArea = document.querySelector('.upload-area');
    const uploadText = document.querySelector('.upload-text');
    const originalUploadText = uploadText.textContent;

    // Drag and drop functionality
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        uploadArea.addEventListener(eventName, preventDefaults, false);
    });

    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    ['dragenter', 'dragover'].forEach(eventName => {
        uploadArea.addEventListener(eventName, highlight, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
        uploadArea.addEventListener(eventName, unhighlight, false);
    });

    function highlight() {
        uploadArea.classList.add('highlight');
        uploadText.textContent = 'Drop your file here!';
    }

    function unhighlight() {
        uploadArea.classList.remove('highlight');
        uploadText.textContent = originalUploadText;
    }

    uploadArea.addEventListener('drop', handleDrop, false);

    function handleDrop(e) {
        const dt = e.dataTransfer;
        const files = dt.files;
        if (files.length > 0) {
            imageInput.files = files;
            handleFileSelect(files[0]);
        }
    }

    // File input change handler
    imageInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            handleFileSelect(e.target.files[0]);
        }
    });

    function handleFileSelect(file) {
        // Validate file type
        if (!file.type.startsWith('image/')) {
            showNotification('Please select an image file', 'error');
            return;
        }

        // Show loading state
        uploadText.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing image...';

        const reader = new FileReader();
        reader.onload = (e) => {
            preview.src = e.target.result;
            imagePreview.classList.remove('d-none');
            uploadText.textContent = originalUploadText;
            
            // Add zoom functionality to preview
            preview.onclick = function() {
                this.classList.toggle('zoomed');
            };

            // Show tooltip
            showNotification('Click the image to zoom in/out', 'info', 3000);
        };
        reader.readAsDataURL(file);
    }

    // Form submission
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const file = imageInput.files[0];
        if (!file) {
            showNotification('Please select an image first', 'error');
            return;
        }

        // Show loading state
        showLoadingState();

        const formData = new FormData();
        formData.append('image', file);

        try {
            const response = await fetch('http://localhost:8080/predict', {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const data = await response.json();
            showResults(data);
            showNotification('Analysis completed successfully!', 'success');
            
        } catch (error) {
            console.error('Error:', error);
            showNotification('Error processing image. Please try again.', 'error');
            resultContent.innerHTML = `
                <div class="alert alert-danger" role="alert">
                    <i class="fas fa-exclamation-circle me-2"></i>Error processing image. Please try again.
                </div>
            `;
            results.classList.remove('d-none');
        }
    });

    function showLoadingState() {
        resultContent.innerHTML = `
            <div class="loading">
                <div class="loading-spinner"></div>
                <div class="mt-3">Analyzing your X-ray image...</div>
                <div class="progress mt-3" style="height: 10px; width: 200px;">
                    <div class="progress-bar progress-bar-striped progress-bar-animated" style="width: 100%"></div>
                </div>
            </div>
        `;
        results.classList.remove('d-none');
    }

    function showResults(data) {
        const confidencePercentage = (data.confidence * 100).toFixed(2);
        const resultClass = data.prediction === 'COVID-19' ? 'danger' : 'success';
        const icon = data.prediction === 'COVID-19' ? 'virus' : 'check-circle';
        
        resultContent.innerHTML = `
            <div class="result-animation">
                <div class="alert alert-${resultClass}" role="alert">
                    <div class="d-flex align-items-center">
                        <i class="fas fa-${icon} fa-2x me-3"></i>
                        <div>
                            <h4 class="alert-heading mb-2">Prediction: ${data.prediction}</h4>
                            <p class="mb-2">Confidence: ${confidencePercentage}%</p>
                        </div>
                    </div>
                    <div class="confidence-bar">
                        <div class="confidence-level" style="width: 0%"></div>
                    </div>
                </div>
            </div>
        `;

        // Animate confidence bar
        setTimeout(() => {
            const confidenceBar = document.querySelector('.confidence-level');
            confidenceBar.style.width = `${confidencePercentage}%`;
        }, 100);
    }

    // Notification system
    function showNotification(message, type = 'info', duration = 5000) {
        const notificationContainer = document.getElementById('notification-container') || createNotificationContainer();
        
        const notification = document.createElement('div');
        notification.className = `notification notification-${type} fade-in`;
        
        const icon = getNotificationIcon(type);
        notification.innerHTML = `
            <i class="fas ${icon} me-2"></i>
            ${message}
        `;
        
        notificationContainer.appendChild(notification);
        
        // Remove notification after duration
        setTimeout(() => {
            notification.classList.add('fade-out');
            setTimeout(() => notification.remove(), 300);
        }, duration);
    }

    function createNotificationContainer() {
        const container = document.createElement('div');
        container.id = 'notification-container';
        document.body.appendChild(container);
        return container;
    }

    function getNotificationIcon(type) {
        const icons = {
            success: 'fa-check-circle',
            error: 'fa-exclamation-circle',
            info: 'fa-info-circle',
            warning: 'fa-exclamation-triangle'
        };
        return icons[type] || icons.info;
    }
});
