document.addEventListener('DOMContentLoaded', () => {
    // DOM 元素
    const dropZone = document.getElementById('dropZone');
    const fileInput = document.getElementById('fileInput');
    const uploadButton = document.querySelector('.upload-button');
    const clearButton = document.getElementById('clearButton');
    const comparisonContainer = document.getElementById('comparisonContainer');
    const batchContainer = document.getElementById('batchContainer');
    const batchList = document.getElementById('batchList');
    const batchCount = document.getElementById('batchCount');
    const originalPreview = document.getElementById('originalPreview');
    const compressedPreview = document.getElementById('compressedPreview');
    const originalSize = document.getElementById('originalSize');
    const compressedSize = document.getElementById('compressedSize');
    const compressionRatio = document.getElementById('compressionRatio');
    const qualitySlider = document.getElementById('qualitySlider');
    const qualityValue = document.getElementById('qualityValue');
    const compressButton = document.getElementById('compressButton');
    const compressAllButton = document.getElementById('compressAllButton');
    const downloadAllButton = document.getElementById('downloadAllButton');
    const downloadButton = document.getElementById('downloadButton');
    const themeToggle = document.getElementById('themeToggle');
    const settingsToggle = document.getElementById('settingsToggle');
    const settingsPanel = document.getElementById('settingsPanel');
    const modeButtons = document.querySelectorAll('.mode-button');
    const batchProgress = document.getElementById('batchProgress');
    const progressFill = document.getElementById('progressFill');
    const progressText = document.getElementById('progressText');
    const batchQualitySlider = document.getElementById('batchQualitySlider');
    const batchQualityValue = document.getElementById('batchQualityValue');
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabContents = document.querySelectorAll('.tab-content');
    const imageUrl = document.getElementById('imageUrl');
    const fetchUrlButton = document.getElementById('fetchUrlButton');
    const urlPreview = document.getElementById('urlPreview');
    const imageWidth = document.getElementById('imageWidth');
    const imageHeight = document.getElementById('imageHeight');
    const maintainAspectRatio = document.getElementById('maintainAspectRatio');
    const resetSize = document.getElementById('resetSize');
    const batchImageWidth = document.getElementById('batchImageWidth');
    const batchImageHeight = document.getElementById('batchImageHeight');
    const batchMaintainAspectRatio = document.getElementById('batchMaintainAspectRatio');
    const batchResetSize = document.getElementById('batchResetSize');

    // 高级设置输入
    const maxWidth = document.getElementById('maxWidth');
    const maxHeight = document.getElementById('maxHeight');
    const maxSizeMB = document.getElementById('maxSizeMB');

    let originalFile = null;
    let compressedBlob = null;
    let batchFiles = [];
    let compressedFiles = new Map();
    let currentMode = 'single';
    let urlImages = new Map(); // 存储URL图片的Map
    let originalDimensions = { width: 0, height: 0 };
    let aspectRatio = 1;

    // 主题切换
    const toggleTheme = () => {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
    };

    // 初始化主题
    const initTheme = () => {
        const savedTheme = localStorage.getItem('theme') || 
            (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
        document.documentElement.setAttribute('data-theme', savedTheme);
    };

    // 模式切换
    modeButtons.forEach(button => {
        button.addEventListener('click', () => {
            const mode = button.dataset.mode;
            if (mode === currentMode) return;

            modeButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            currentMode = mode;

            if (mode === 'single') {
                batchContainer.style.display = 'none';
                if (originalFile) {
                    comparisonContainer.style.display = 'grid';
                }
            } else {
                comparisonContainer.style.display = 'none';
                if (batchFiles.length > 0) {
                    batchContainer.style.display = 'block';
                }
            }
        });
    });

    themeToggle.addEventListener('click', toggleTheme);
    initTheme();

    // 高级设置面板切换
    settingsToggle.addEventListener('click', () => {
        settingsPanel.classList.toggle('active');
    });

    // 处理文件拖放
    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.style.borderColor = 'var(--primary-color)';
        dropZone.style.backgroundColor = '#F8F8F8';
    });

    dropZone.addEventListener('dragleave', (e) => {
        e.preventDefault();
        dropZone.style.borderColor = 'var(--border-color)';
        dropZone.style.backgroundColor = 'var(--card-background)';
    });

    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.style.borderColor = 'var(--border-color)';
        dropZone.style.backgroundColor = 'var(--card-background)';
        
        const files = Array.from(e.dataTransfer.files).filter(file => file.type.startsWith('image/'));
        handleFiles(files);
    });

    // 点击上传按钮
    uploadButton.addEventListener('click', () => {
        fileInput.click();
    });

    // 清空选择
    clearButton.addEventListener('click', () => {
        batchFiles = [];
        compressedFiles.clear();
        batchList.innerHTML = '';
        batchCount.textContent = '0';
        clearButton.style.display = 'none';
        compressAllButton.disabled = true;
        downloadAllButton.disabled = true;
        batchContainer.style.display = 'none';
        batchProgress.style.display = 'none';
    });

    fileInput.addEventListener('change', (e) => {
        const files = Array.from(e.target.files);
        handleFiles(files);
        fileInput.value = ''; // 重置input，允���重复选择相同文件
    });

    // 处理文件上传
    function handleFiles(files) {
        if (files.length === 0) return;

        // 清除URL图片
        urlImages.clear();
        urlPreview.innerHTML = '';

        if (files.length === 1 && currentMode === 'single') {
            // 单文件模式
            handleSingleFile(files[0]);
        } else {
            // 批量模式
            if (currentMode === 'single') {
                modeButtons.forEach(btn => {
                    if (btn.dataset.mode === 'batch') {
                        btn.click();
                    }
                });
            }
            handleBatchFiles(files);
        }
    }

    // 处理单个文件
    async function handleSingleFile(file) {
        if (!file.type.startsWith('image/')) {
            alert('请上传图片文件');
            return;
        }

        originalFile = file;
        batchContainer.style.display = 'none';
        comparisonContainer.style.display = 'grid';
        
        // 显示原始图片
        const originalImage = await createImageBitmap(file);
        setupSizeInputs(originalImage.width, originalImage.height);
        
        originalPreview.src = URL.createObjectURL(file);
        originalSize.textContent = formatFileSize(file.size);
        
        // 重置压缩预览
        compressedPreview.src = '';
        compressedSize.textContent = '0 KB';
        compressionRatio.textContent = '0%';
        downloadButton.disabled = true;
        
        // 滚动到对比区域
        comparisonContainer.scrollIntoView({ behavior: 'smooth' });
    }

    // 处理批量文件
    function handleBatchFiles(files) {
        // 合并新文件到现有队列
        const newFiles = files.filter(file => !batchFiles.some(f => f.name === file.name));
        batchFiles = [...batchFiles, ...newFiles];
        
        batchContainer.style.display = 'block';
        clearButton.style.display = 'inline-flex';
        compressAllButton.disabled = false;
        
        // 更新批量列表
        updateBatchList();
        
        // 更新计数
        batchCount.textContent = batchFiles.length;
    }

    // 更新批量列表
    function updateBatchList() {
        batchList.innerHTML = '';
        batchFiles.forEach((file, index) => {
            const item = createBatchItem(file, index);
            batchList.appendChild(item);
        });
    }

    // 创建批量列表项
    function createBatchItem(file, index) {
        const div = document.createElement('div');
        div.className = 'batch-item';
        
        const compressed = compressedFiles.get(file.name);
        const status = compressed ? 'success' : '';
        const compressedInfo = compressed ? 
            `压缩后: ${formatFileSize(compressed.size)} (减少 ${calculateCompressionRatio(file.size, compressed.size)}%)` : 
            '';

        div.innerHTML = `
            <img src="${URL.createObjectURL(file)}" alt="预览">
            <div class="batch-item-info">
                <span class="batch-item-name">${file.name}</span>
                <span class="batch-item-size">原始大小: ${formatFileSize(file.size)}</span>
                <span class="batch-item-compressed-size">${compressedInfo}</span>
            </div>
            <span class="batch-item-status ${status}">${status ? '已完成' : '待处理'}</span>
            <div class="batch-item-actions">
                ${compressed ? `
                    <button class="secondary-button" onclick="downloadCompressedFile(${index})">
                        下载
                    </button>
                ` : ''}
            </div>
        `;

        // 添加下载事件监听
        if (compressed) {
            const downloadBtn = div.querySelector('.secondary-button');
            downloadBtn.addEventListener('click', () => {
                downloadFile(compressed, `compressed_${file.name}`);
            });
        }

        return div;
    }

    // 压缩单个图片
    async function compressImage(file, options = {}) {
        // 获取图片原始尺寸
        const originalImage = await createImageBitmap(file);
        
        if (!options.width && !options.height) {
            // 如果是单图模式，设置原始尺寸
            if (currentMode === 'single') {
                setupSizeInputs(originalImage.width, originalImage.height);
            }
        }

        const defaultOptions = {
            maxSizeMB: parseFloat(maxSizeMB.value),
            useWebWorker: true,
            quality: currentMode === 'single' 
                ? parseInt(qualitySlider.value) / 100 
                : parseInt(batchQualitySlider.value) / 100
        };

        // 添加尺寸调整选项
        const resizeDimensions = getResizeDimensions(currentMode);
        if (resizeDimensions) {
            if (resizeDimensions.width) {
                defaultOptions.maxWidthOrHeight = resizeDimensions.width;
            }
            if (resizeDimensions.height) {
                defaultOptions.maxHeightOrWidth = resizeDimensions.height;
            }
        }

        const compressionOptions = { ...defaultOptions, ...options };

        try {
            const compressedFile = await imageCompression(file, compressionOptions);
            return compressedFile;
        } catch (error) {
            console.error('压缩失败:', error);
            throw error;
        }
    }

    // 压缩按钮点击事件
    compressButton.addEventListener('click', async () => {
        if (!originalFile) return;

        try {
            compressButton.disabled = true;
            compressButton.textContent = '压缩中...';

            compressedBlob = await compressImage(originalFile);
            
            // 显示压缩后的图片
            compressedPreview.src = URL.createObjectURL(compressedBlob);
            compressedSize.textContent = formatFileSize(compressedBlob.size);
            
            // 计算压缩率
            const ratio = calculateCompressionRatio(originalFile.size, compressedBlob.size);
            compressionRatio.textContent = `${ratio}%`;
            
            // 启用下载按钮
            downloadButton.disabled = false;
        } catch (error) {
            alert('图片压缩失败，请重试');
        } finally {
            compressButton.disabled = false;
            compressButton.textContent = '压缩图片';
        }
    });

    // 批量压缩按钮点击事件
    compressAllButton.addEventListener('click', async () => {
        if (batchFiles.length === 0) return;

        const quality = parseInt(batchQualitySlider.value) / 100;
        compressAllButton.disabled = true;
        downloadAllButton.disabled = true;
        batchProgress.style.display = 'block';

        let completed = 0;
        const total = batchFiles.length;
        progressText.textContent = `${completed}/${total}`;

        try {
            // 清空之前的压缩结果
            compressedFiles.clear();

            for (let i = 0; i < batchFiles.length; i++) {
                const file = batchFiles[i];
                const compressedFile = await compressImage(file, { quality });
                compressedFiles.set(file.name, compressedFile);
                
                completed++;
                progressFill.style.width = `${(completed / total) * 100}%`;
                progressText.textContent = `${completed}/${total}`;
                
                // 更新列表项
                updateBatchList();
            }

            downloadAllButton.disabled = false;
        } catch (error) {
            alert('批量压缩过程中出现错误，请重试');
        } finally {
            compressAllButton.disabled = false;
            setTimeout(() => {
                batchProgress.style.display = 'none';
                progressFill.style.width = '0';
            }, 1000);
        }
    });

    // 打包下载所有压缩后的图片
    downloadAllButton.addEventListener('click', async () => {
        if (compressedFiles.size === 0) return;

        const zip = new JSZip();
        const folder = zip.folder('compressed_images');

        compressedFiles.forEach((blob, filename) => {
            folder.file(`compressed_${filename}`, blob);
        });

        try {
            const content = await zip.generateAsync({type: 'blob'});
            const link = document.createElement('a');
            link.href = URL.createObjectURL(content);
            link.download = 'compressed_images.zip';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (error) {
            alert('打包下载失败，请重试');
        }
    });

    // 下载按钮点击事件
    downloadButton.addEventListener('click', () => {
        if (!compressedBlob) return;
        downloadFile(compressedBlob, `compressed_${originalFile.name}`);
    });

    // 下载文件
    function downloadFile(blob, filename) {
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    // 计算压缩率
    function calculateCompressionRatio(originalSize, compressedSize) {
        return ((originalSize - compressedSize) / originalSize * 100).toFixed(1);
    }

    // 格式化文件大小
    function formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    // 质量滑块更新
    qualitySlider.addEventListener('input', (e) => {
        qualityValue.textContent = `${e.target.value}%`;
    });

    // 批量压缩质量滑块更新
    batchQualitySlider.addEventListener('input', (e) => {
        batchQualityValue.textContent = `${e.target.value}%`;
    });

    // 标签切换
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const tab = button.dataset.tab;
            
            // 更新按钮状态
            tabButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            
            // 更新内容显示
            tabContents.forEach(content => {
                content.style.display = content.id === `${tab}Tab` ? 'block' : 'none';
            });
        });
    });

    // 处理图片URL输入
    imageUrl.addEventListener('input', () => {
        fetchUrlButton.disabled = !imageUrl.value.trim();
    });

    // 获取图片URL
    fetchUrlButton.addEventListener('click', async () => {
        const urls = imageUrl.value.trim().split('\n').filter(url => url.trim());
        if (urls.length === 0) return;

        fetchUrlButton.disabled = true;
        fetchUrlButton.innerHTML = '<svg class="spinner" viewBox="0 0 50 50"><circle cx="25" cy="25" r="20"/></svg>获取中...';

        try {
            for (const url of urls) {
                if (!urlImages.has(url)) {
                    await fetchAndPreviewImage(url.trim());
                }
            }
        } catch (error) {
            showUrlError('获取图片失败，请检查URL是否正确');
        } finally {
            fetchUrlButton.disabled = false;
            fetchUrlButton.innerHTML = '<svg viewBox="0 0 24 24" width="16" height="16"><path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM17 13l-5 5-5-5h3V9h4v4h3z"/></svg>获取图片';
            imageUrl.value = '';
        }
    });

    // 获取并预览图片
    async function fetchAndPreviewImage(url) {
        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error('Network response was not ok');

            const blob = await response.blob();
            if (!blob.type.startsWith('image/')) {
                throw new Error('URL��是有效的图片');
            }

            // 创建File对象
            const filename = url.split('/').pop() || 'image.jpg';
            const file = new File([blob], filename, { type: blob.type });

            // 存储图片
            urlImages.set(url, file);

            // 创建预览
            const div = document.createElement('div');
            div.className = 'url-preview-item';
            div.innerHTML = `
                <img src="${URL.createObjectURL(file)}" alt="${filename}">
                <button class="remove-button" data-url="${url}">×</button>
            `;

            // 添加删除按钮事件
            const removeButton = div.querySelector('.remove-button');
            removeButton.addEventListener('click', () => {
                urlImages.delete(url);
                div.remove();
                if (urlImages.size === 0) {
                    updateBatchUI();
                }
            });

            urlPreview.appendChild(div);
            updateBatchUI();
        } catch (error) {
            showUrlError(`获取图片失败: ${error.message}`);
        }
    }

    // 显示错误信息
    function showUrlError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'url-error';
        errorDiv.textContent = message;
        urlPreview.appendChild(errorDiv);
        setTimeout(() => errorDiv.remove(), 3000);
    }

    // 更新批量处理UI
    function updateBatchUI() {
        if (urlImages.size > 0) {
            // 切换到批量模式
            modeButtons.forEach(btn => {
                if (btn.dataset.mode === 'batch') {
                    btn.click();
                }
            });

            // 更新批量处理列表
            batchFiles = Array.from(urlImages.values());
            updateBatchList();
            batchCount.textContent = batchFiles.length;
            batchContainer.style.display = 'block';
            compressAllButton.disabled = false;
        }
    }

    // 处理单个文件尺寸调整
    function setupSizeInputs(width, height) {
        originalDimensions = { width, height };
        aspectRatio = width / height;
        
        imageWidth.value = width;
        imageHeight.value = height;

        // 初始化预览信息
        updateSizePreview('single', width, height);
    }

    // 宽度改变时更新高度
    imageWidth.addEventListener('input', () => {
        if (maintainAspectRatio.checked && imageWidth.value) {
            const newWidth = parseInt(imageWidth.value);
            imageHeight.value = Math.round(newWidth / aspectRatio);
        }
    });

    // 高度改变时更新宽度
    imageHeight.addEventListener('input', () => {
        if (maintainAspectRatio.checked && imageHeight.value) {
            const newHeight = parseInt(imageHeight.value);
            imageWidth.value = Math.round(newHeight * aspectRatio);
        }
    });

    // 重置尺寸
    resetSize.addEventListener('click', () => {
        imageWidth.value = originalDimensions.width;
        imageHeight.value = originalDimensions.height;
        qualitySlider.value = 75;
        qualityValue.textContent = '75%';
        updateSizePreview('single', originalDimensions.width, originalDimensions.height);
    });

    // 批量处理尺寸重置
    batchResetSize.addEventListener('click', () => {
        batchImageWidth.value = '';
        batchImageHeight.value = '';
        batchQualitySlider.value = 75;
        batchQualityValue.textContent = '75%';
    });

    // 获取调整后的尺寸
    function getResizeDimensions(mode = 'single') {
        const width = mode === 'single' ? imageWidth.value : batchImageWidth.value;
        const height = mode === 'single' ? imageHeight.value : batchImageHeight.value;
        
        if (!width && !height) return null;
        
        return {
            width: width ? parseInt(width) : null,
            height: height ? parseInt(height) : null
        };
    }

    // 添加智能联动控制
    function setupQualitySizeLink(mode = 'single') {
        const qualityInput = mode === 'single' ? qualitySlider : batchQualitySlider;
        const widthInput = mode === 'single' ? imageWidth : batchImageWidth;
        const heightInput = mode === 'single' ? imageHeight : batchImageHeight;
        const aspectRatioCheckbox = mode === 'single' ? maintainAspectRatio : batchMaintainAspectRatio;

        // 质量改变时调整尺寸
        qualityInput.addEventListener('input', () => {
            if (!originalDimensions.width) return;
            
            const quality = parseInt(qualityInput.value) / 100;
            // 质量越低，尺寸相应减小
            const scaleFactor = 0.5 + (quality * 0.5); // 质量100%时保持原尺寸，质量0%时缩小到50%
            
            const newWidth = Math.round(originalDimensions.width * scaleFactor);
            const newHeight = Math.round(originalDimensions.height * scaleFactor);
            
            widthInput.value = newWidth;
            heightInput.value = newHeight;

            // 更新预览信息
            updateSizePreview(mode, newWidth, newHeight);
        });

        // 尺寸改变时调整质量
        [widthInput, heightInput].forEach(input => {
            input.addEventListener('input', () => {
                if (!originalDimensions.width || !input.value) return;

                const currentWidth = parseInt(widthInput.value) || originalDimensions.width;
                const currentHeight = parseInt(heightInput.value) || originalDimensions.height;
                
                // 计算当前尺寸与原始尺寸的比例
                const widthRatio = currentWidth / originalDimensions.width;
                const heightRatio = currentHeight / originalDimensions.height;
                const sizeRatio = Math.min(widthRatio, heightRatio);

                // 根据尺寸比例反向计算质量
                const quality = Math.round(((sizeRatio - 0.5) / 0.5) * 100);
                qualityInput.value = Math.max(0, Math.min(100, quality));
                
                // 更新质量显示
                const qualityDisplay = mode === 'single' ? qualityValue : batchQualityValue;
                qualityDisplay.textContent = `${qualityInput.value}%`;

                // 如果保持宽高比，同步更新另一个维度
                if (aspectRatioCheckbox.checked) {
                    if (input === widthInput) {
                        heightInput.value = Math.round(currentWidth / aspectRatio);
                    } else {
                        widthInput.value = Math.round(currentHeight * aspectRatio);
                    }
                }

                updateSizePreview(mode, parseInt(widthInput.value), parseInt(heightInput.value));
            });
        });
    }

    // 更新尺寸预览信息
    function updateSizePreview(mode, width, height) {
        const container = mode === 'single' ? 
            document.querySelector('.size-control') : 
            document.querySelector('.batch-size-control');

        let previewElement = container.querySelector('.size-preview');
        if (!previewElement) {
            previewElement = document.createElement('div');
            previewElement.className = 'size-preview';
            container.appendChild(previewElement);
        }

        const reduction = calculateSizeReduction(originalDimensions, { width, height });
        previewElement.innerHTML = `
            <span class="size-info">原始: ${originalDimensions.width} × ${originalDimensions.height}</span>
            <span class="size-info">调整: ${width} × ${height}</span>
            <span class="size-reduction">${reduction}% 缩小</span>
        `;
    }

    // 计算尺寸减少百分比
    function calculateSizeReduction(original, current) {
        const originalArea = original.width * original.height;
        const currentArea = current.width * current.height;
        return Math.round((1 - (currentArea / originalArea)) * 100);
    }

    // 初始化联动控制
    function initializeSizeQualityControl() {
        setupQualitySizeLink('single');
        setupQualitySizeLink('batch');

        // 添加CSS样式
        const style = document.createElement('style');
        style.textContent = `
            .size-preview {
                margin-top: 10px;
                padding-top: 10px;
                border-top: 1px solid var(--border-color);
                font-size: 0.9rem;
                color: var(--text-color);
                display: flex;
                flex-wrap: wrap;
                gap: 10px;
            }
            .size-info {
                color: #666;
            }
            .size-reduction {
                color: var(--primary-color);
                font-weight: 500;
            }
        `;
        document.head.appendChild(style);
    }

    // 初始化联动控制
    initializeSizeQualityControl();
}); 