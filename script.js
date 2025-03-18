// Main script file that handles UI interactions and screen transitions

// DOM Elements
const mainMenu = document.getElementById('main-menu');
const gameScreen = document.getElementById('game-screen');
const settingsScreen = document.getElementById('settings-screen');
const gameOverModal = document.getElementById('game-over-modal');
const pauseModal = document.getElementById('pause-modal');

// UI Element References
const difficultyButtons = document.querySelectorAll('.difficulty-btn');
const settingsBtn = document.getElementById('settings-btn');
const settingsCloseBtn = document.getElementById('settings-close-btn');
const backBtn = document.getElementById('back-btn');
const pauseBtn = document.getElementById('pause-btn');
const musicToggleBtn = document.getElementById('music-toggle-btn');
const resumeBtn = document.getElementById('resume-btn');
const exitGameBtn = document.getElementById('exit-game-btn');
const playAgainBtn = document.getElementById('play-again-btn');
const scoreDisplay = document.getElementById('score');
const finalScoreDisplay = document.getElementById('final-score');
const resetSettingsBtn = document.getElementById('reset-settings');

// File inputs
const clickSoundInput = document.getElementById('click-sound');
const tileImageInput = document.getElementById('tile-image');
const clickedTileImageInput = document.getElementById('clicked-tile-image');
const failSoundInput = document.getElementById('fail-sound');

// File name displays
const clickSoundFilename = document.getElementById('click-sound-filename');
const tileImageFilename = document.getElementById('tile-image-filename');
const clickedTileImageFilename = document.getElementById('clicked-tile-image-filename');
const failSoundFilename = document.getElementById('fail-sound-filename');

// Image previews
const tileImagePreview = document.getElementById('tile-image-preview');
const previewImage = document.getElementById('preview-image');
const clickedTileImagePreview = document.getElementById('clicked-tile-image-preview');
const clickedPreviewImage = document.getElementById('clicked-preview-image');

// Game state variables
let currentDifficulty = 'easy';
let isGameActive = false;
let isGamePaused = false;
let currentScore = 0;

// Initialize audio and image managers
const audioManager = new AudioManager();
const imageManager = new ImageManager();

// Initialize game
document.addEventListener('DOMContentLoaded', () => {
    // Load saved settings if available
    audioManager.loadSavedSounds();
    imageManager.loadSavedImages();
    
    // Update UI with loaded resources
    updateResourceDisplays();
    
    // Set up event listeners
    setupEventListeners();
    
    // Initialize audio context on first user interaction
    document.body.addEventListener('click', () => {
        if (audioManager) {
            audioManager.initAudioContext();
            // 如果之前保存的状态是播放音乐，则自动开始播放
            if (localStorage.getItem('pianoTiles_musicState') === 'playing') {
                audioManager.playBackgroundMusic();
                updateMusicButtonState(true);
            }
        }
    }, { once: true });

    // 添加Font Awesome图标
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css';
    document.head.appendChild(link);
});

function setupEventListeners() {
    // Difficulty buttons
    difficultyButtons.forEach(button => {
        button.addEventListener('click', () => {
            currentDifficulty = button.dataset.difficulty;
            startGame(currentDifficulty);
            // 开始游戏时播放音乐
            if (!audioManager.isMusicOn()) {
                audioManager.playBackgroundMusic();
                updateMusicButtonState(true);
            }
        });
    });

    // Settings buttons
    settingsBtn.addEventListener('click', showSettingsScreen);
    settingsCloseBtn.addEventListener('click', hideSettingsScreen);

    // Game navigation buttons
    backBtn.addEventListener('click', confirmExitGame);
    pauseBtn.addEventListener('click', () => {
        pauseGame();
        if (audioManager.isMusicOn()) {
            audioManager.pauseBackgroundMusic();
        }
    });
    resumeBtn.addEventListener('click', () => {
        resumeGame();
        if (audioManager.isMusicOn()) {
            audioManager.playBackgroundMusic();
        }
    });
    exitGameBtn.addEventListener('click', () => {
        exitGame();
        audioManager.pauseBackgroundMusic();
        updateMusicButtonState(false);
    });
    playAgainBtn.addEventListener('click', restartGame);
    resetSettingsBtn.addEventListener('click', resetSettings);

    // 游戏结束页面的退出按钮
    document.getElementById('exit-to-menu-btn').addEventListener('click', () => {
        gameOverModal.classList.add('hidden');
        exitGame();
    });

    // File inputs
    clickSoundInput.addEventListener('change', (e) => handleFileUpload(e, 'clickSound'));
    tileImageInput.addEventListener('change', (e) => handleFileUpload(e, 'tileImage'));
    clickedTileImageInput.addEventListener('change', (e) => handleFileUpload(e, 'clickedTileImage'));
    failSoundInput.addEventListener('change', (e) => handleFileUpload(e, 'failSound'));

    // 音乐控制
    musicToggleBtn.addEventListener('click', () => {
        const isPlaying = audioManager.toggleBackgroundMusic();
        updateMusicButtonState(isPlaying);
    });
}

function startGame(difficulty) {
    currentScore = 0;
    scoreDisplay.textContent = `得分: ${currentScore}`;
    
    showGameScreen();
    
    // Initialize the game with selected difficulty
    gameLogic.initialize(difficulty, {
        onScoreUpdate: updateScore,
        onGameover: handleGameOver,
        audioManager: audioManager,
        imageManager: imageManager
    });
    
    isGameActive = true;
    isGamePaused = false;
}

function pauseGame() {
    if (!isGameActive || isGamePaused) return;
    
    gameLogic.pauseGame();
    isGamePaused = true;
    pauseModal.classList.remove('hidden');
    pauseModal.classList.add('animate-fade-in');
}

function resumeGame() {
    if (!isGameActive || !isGamePaused) return;
    
    pauseModal.classList.add('hidden');
    gameLogic.resumeGame();
    isGamePaused = false;
}

function confirmExitGame() {
    if (confirm('确定要退出游戏吗？')) {
        exitGame();
    }
}

function exitGame() {
    if (pauseModal) {
        pauseModal.classList.add('hidden');
    }
    if (gameLogic) {
        gameLogic.stopGame();
    }
    showMainMenu();
    isGameActive = false;
    isGamePaused = false;
    
    // 返回主菜单时继续播放音乐
    if (audioManager.isMusicOn()) {
        audioManager.playBackgroundMusic();
    }
}

function restartGame() {
    gameOverModal.classList.add('hidden');
    startGame(currentDifficulty);
}

function handleGameOver(finalScore) {
    isGameActive = false;
    finalScoreDisplay.textContent = finalScore;
    gameOverModal.classList.remove('hidden');
    gameOverModal.classList.add('animate-fade-in');
    
    // Reset save score button
    const saveScoreBtn = document.getElementById('save-score-btn');
    saveScoreBtn.disabled = false;
    saveScoreBtn.textContent = '保存分数';
}

function updateScore(newScore) {
    currentScore = newScore;
    scoreDisplay.textContent = `得分: ${newScore}`;
}

function handleFileUpload(event, resourceType) {
    const file = event.target.files[0];
    if (!file) return;
    
    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
        alert('文件大小不能超过5MB！');
        event.target.value = '';
        return;
    }
    
    const reader = new FileReader();
    
    reader.onload = function(e) {
        const result = e.target.result;
        
        switch(resourceType) {
            case 'clickSound':
                audioManager.setClickSound(result, file.name);
                clickSoundFilename.textContent = file.name;
                break;
            case 'failSound':
                audioManager.setFailSound(result, file.name);
                failSoundFilename.textContent = file.name;
                break;
            case 'tileImage':
                imageManager.setTileImage(result, file.name);
                tileImageFilename.textContent = file.name;
                
                // 图片预览会在imageManager中的预处理后更新
                tileImagePreview.classList.remove('hidden');
                break;
            case 'clickedTileImage':
                imageManager.setClickedTileImage(result, file.name);
                clickedTileImageFilename.textContent = file.name;
                
                // 图片预览会在imageManager中的预处理后更新
                clickedTileImagePreview.classList.remove('hidden');
                break;
        }
    };
    
    reader.readAsDataURL(file);
}

function resetSettings() {
    if (confirm('确定要恢复默认设置吗？这将删除所有自定义的声音和图像。')) {
        audioManager.resetSounds();
        imageManager.resetImages();
        updateResourceDisplays();
        
        // Hide image previews
        tileImagePreview.classList.add('hidden');
        previewImage.src = '';
        clickedTileImagePreview.classList.add('hidden');
        clickedPreviewImage.src = '';
    }
}

function updateResourceDisplays() {
    // Update file name displays based on saved resources
    clickSoundFilename.textContent = audioManager.clickSoundName || '无文件';
    failSoundFilename.textContent = audioManager.failSoundName || '无文件';
    tileImageFilename.textContent = imageManager.tileImageName || '无文件';
    clickedTileImageFilename.textContent = imageManager.clickedTileImageName || '无文件';
    
    // Show image previews if available
    if (imageManager.hasTileImage()) {
        previewImage.src = imageManager.getTileImage();
        tileImagePreview.classList.remove('hidden');
    } else {
        tileImagePreview.classList.add('hidden');
    }
    
    if (imageManager.hasClickedTileImage()) {
        clickedPreviewImage.src = imageManager.getClickedTileImage();
        clickedTileImagePreview.classList.remove('hidden');
    } else {
        clickedTileImagePreview.classList.add('hidden');
    }
}

// Screen navigation functions
function showMainMenu() {
    gameScreen.classList.add('hidden');
    settingsScreen.classList.add('hidden');
    mainMenu.classList.remove('hidden');
}

function showGameScreen() {
    mainMenu.classList.add('hidden');
    settingsScreen.classList.add('hidden');
    gameScreen.classList.remove('hidden');
}

function showSettingsScreen() {
    mainMenu.classList.add('hidden');
    gameScreen.classList.add('hidden');
    settingsScreen.classList.remove('hidden');
    settingsScreen.classList.add('flex');
}

function hideSettingsScreen() {
    settingsScreen.classList.add('hidden');
    settingsScreen.classList.remove('flex');
    mainMenu.classList.remove('hidden');
}

// 更新音乐按钮状态
function updateMusicButtonState(isPlaying) {
    const musicBtns = document.querySelectorAll('.icon-btn.music-toggle-btn');
    musicBtns.forEach(btn => {
        if (isPlaying) {
            btn.classList.add('music-playing');
            btn.querySelector('i').classList.remove('fa-music-slash');
            btn.querySelector('i').classList.add('fa-music');
        } else {
            btn.classList.remove('music-playing');
            btn.querySelector('i').classList.remove('fa-music');
            btn.querySelector('i').classList.add('fa-music-slash');
        }
    });
}
