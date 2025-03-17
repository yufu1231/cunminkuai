// Image Manager to handle custom tile images

class ImageManager {
    constructor() {
        // Default tile images
        this.defaultTileImage = 'assets/tile.png';
        this.defaultClickedTileImage = 'assets/clicked_tile.png';
        
        // Current tile images
        this.tileImage = null;
        this.tileImageName = '';
        this.clickedTileImage = null;
        this.clickedTileImageName = '';
        
        // Load default images
        this.loadDefaultImages();
    }
    
    // Load default images
    loadDefaultImages() {
        fetch(this.defaultTileImage)
            .then(response => response.blob())
            .then(blob => {
                const reader = new FileReader();
                reader.onloadend = () => {
                    this.tileImage = reader.result;
                    this.tileImageName = 'default_tile.png';
                    localStorage.setItem('pianoTiles_tileImage', reader.result);
                    localStorage.setItem('pianoTiles_tileImageName', 'default_tile.png');
                    
                    // Update preview if exists
                    const previewImg = document.getElementById('preview-image');
                    if (previewImg) {
                        previewImg.src = reader.result;
                        document.getElementById('tile-image-preview').classList.remove('hidden');
                    }
                };
                reader.readAsDataURL(blob);
            })
            .catch(error => console.error('Error loading default tile image:', error));
            
        fetch(this.defaultClickedTileImage)
            .then(response => response.blob())
            .then(blob => {
                const reader = new FileReader();
                reader.onloadend = () => {
                    this.clickedTileImage = reader.result;
                    this.clickedTileImageName = 'default_clicked_tile.png';
                    localStorage.setItem('pianoTiles_clickedTileImage', reader.result);
                    localStorage.setItem('pianoTiles_clickedTileImageName', 'default_clicked_tile.png');
                    
                    // Update preview if exists
                    const clickedPreviewImg = document.getElementById('clicked-preview-image');
                    if (clickedPreviewImg) {
                        clickedPreviewImg.src = reader.result;
                        document.getElementById('clicked-tile-image-preview').classList.remove('hidden');
                    }
                };
                reader.readAsDataURL(blob);
            })
            .catch(error => console.error('Error loading default clicked tile image:', error));
    }
    
    // 预处理图片，确保其尺寸合适
    preprocessImage(dataUrl, callback) {
        // 创建一个Image对象加载图片
        const img = new Image();
        img.onload = () => {
            // 创建一个canvas用于绘制和处理图片
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            // 设置最大宽度，考虑到游戏中4列的设计
            const maxWidth = 300; // 增加宽度
            const maxHeight = 250; // 增加高度
            
            // 计算调整后的尺寸，保持宽高比
            let width = img.width;
            let height = img.height;
            
            // 如果图片太窄，确保有合理的宽度（至少80px）
            if (width < 80) width = 80;
            
            // 缩放图片以适应最大尺寸
            if (width > maxWidth) {
                const ratio = maxWidth / width;
                width = maxWidth;
                height = height * ratio;
            }
            
            if (height > maxHeight) {
                const ratio = maxHeight / height;
                height = maxHeight;
                width = width * ratio;
            }
            
            // 设置canvas尺寸
            canvas.width = width;
            canvas.height = height;
            
            // 绘制调整后的图片
            ctx.drawImage(img, 0, 0, width, height);
            
            // 获取处理后的dataURL
            const processedDataUrl = canvas.toDataURL(img.type || 'image/png');
            
            // 返回处理后的图片
            callback(processedDataUrl);
        };
        
        // 如果加载失败，返回原始图片
        img.onerror = () => {
            console.error('图片处理失败');
            callback(dataUrl);
        };
        
        // 加载图片
        img.src = dataUrl;
    }
    
    // Set custom tile image from uploaded file
    setTileImage(dataUrl, fileName) {
        this.preprocessImage(dataUrl, (processedDataUrl) => {
            this.tileImage = processedDataUrl;
            this.tileImageName = fileName;
            localStorage.setItem('pianoTiles_tileImage', processedDataUrl);
            localStorage.setItem('pianoTiles_tileImageName', fileName);
            
            // 更新预览图片
            const previewImg = document.getElementById('preview-image');
            if (previewImg) {
                previewImg.src = processedDataUrl;
            }
        });
    }
    
    // Set custom clicked tile image from uploaded file
    setClickedTileImage(dataUrl, fileName) {
        this.preprocessImage(dataUrl, (processedDataUrl) => {
            this.clickedTileImage = processedDataUrl;
            this.clickedTileImageName = fileName;
            localStorage.setItem('pianoTiles_clickedTileImage', processedDataUrl);
            localStorage.setItem('pianoTiles_clickedTileImageName', fileName);
            
            // 更新预览图片
            const clickedPreviewImg = document.getElementById('clicked-preview-image');
            if (clickedPreviewImg) {
                clickedPreviewImg.src = processedDataUrl;
            }
        });
    }
    
    // Reset images to default
    resetImages() {
        this.tileImage = null;
        this.tileImageName = '';
        this.clickedTileImage = null;
        this.clickedTileImageName = '';
        
        localStorage.removeItem('pianoTiles_tileImage');
        localStorage.removeItem('pianoTiles_tileImageName');
        localStorage.removeItem('pianoTiles_clickedTileImage');
        localStorage.removeItem('pianoTiles_clickedTileImageName');
    }
    
    // Check if custom tile image is available
    hasTileImage() {
        return !!this.tileImage;
    }
    
    // Get tile image data URL
    getTileImage() {
        return this.tileImage;
    }
    
    // Check if custom clicked tile image is available
    hasClickedTileImage() {
        return !!this.clickedTileImage;
    }
    
    // Get clicked tile image data URL
    getClickedTileImage() {
        return this.clickedTileImage;
    }
    
    // Load saved images from local storage
    loadSavedImages() {
        const savedTileImage = localStorage.getItem('pianoTiles_tileImage');
        const savedTileImageName = localStorage.getItem('pianoTiles_tileImageName');
        const savedClickedTileImage = localStorage.getItem('pianoTiles_clickedTileImage');
        const savedClickedTileImageName = localStorage.getItem('pianoTiles_clickedTileImageName');
        
        if (savedTileImage && savedTileImageName) {
            this.tileImage = savedTileImage;
            this.tileImageName = savedTileImageName;
        }
        
        if (savedClickedTileImage && savedClickedTileImageName) {
            this.clickedTileImage = savedClickedTileImage;
            this.clickedTileImageName = savedClickedTileImageName;
        }
    }
}
