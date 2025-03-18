// Game logic file to handle the piano tiles game mechanics

const gameLogic = (() => {
    // DOM Elements
    const gameBoard = document.getElementById('game-board');
    const gameBoardColumns = document.getElementById('game-columns');
    
    // Game state variables
    let gameActive = false;
    let animationFrameId = null;
    let lastTimestamp = 0;
    let tileSpeed = 0;
    let score = 0;
    let activeTiles = [];
    let tileCounter = 0;
    let columns = 4;
    let spawnInterval = 0;
    let lastTileTime = 0;
    let onScoreUpdateCallback = null;
    let onGameoverCallback = null;
    let difficulty = 'easy';
    let audioManager = null;
    let imageManager = null;
    
    // Performance optimizations
    let gameboardHeight = 0;
    let lastSpeedUpdate = 0;
    const SPEED_UPDATE_INTERVAL = 500; // Update speed every 500ms instead of every frame
    const TILE_POOL_SIZE = 20;
    let tilePool = [];
    
    // Tile dimensions
    const tileHeight = 180; // Increased height for better visibility
    
    // Settings for different difficulty levels
    const difficultySettings = {
        easy: {
            initialSpeed: 3,
            speedIncrement: 0.0003,
            maxSpeed: 8,
            spawnInterval: 1000,
            redTileChance: 0,
            speedBoostInterval: 15000  // 每15秒增加速度
        },
        medium: {
            initialSpeed: 5,
            speedIncrement: 0.0005,
            maxSpeed: 12,
            spawnInterval: 800,
            redTileChance: 0,
            speedBoostInterval: 12000  // 每12秒增加速度
        },
        hard: {
            initialSpeed: 7,
            speedIncrement: 0.0008,
            maxSpeed: 16,
            spawnInterval: 600,
            redTileChance: 0,
            speedBoostInterval: 10000  // 每10秒增加速度
        },
        hell: {
            initialSpeed: 8,
            speedIncrement: 0.001,
            maxSpeed: 25,
            spawnInterval: 500,
            redTileChance: 0.2,
            speedBoostInterval: 8000,  // 每8秒增加速度
            speedBoostAmount: 1
        }
    };

    // Additional game state variables
    let lastSpeedBoostTime = 0;
    let totalGameTime = 0;

    // Initialize tile pool
    function initTilePool() {
        for (let i = 0; i < TILE_POOL_SIZE; i++) {
            const tile = document.createElement('div');
            tile.className = 'tile animate-slide-down';
            tilePool.push(tile);
        }
    }
    
    // Get tile from pool or create new one
    function getTile() {
        return tilePool.pop() || document.createElement('div');
    }
    
    // Return tile to pool
    function returnTile(tile) {
        if (tilePool.length < TILE_POOL_SIZE) {
            tile.className = 'tile animate-slide-down';
            tile.style.backgroundImage = '';
            tile.style.backgroundColor = '';
            tile.style.opacity = '';
            tilePool.push(tile);
        }
    }

    // Initialize the game
    function initialize(selectedDifficulty, callbacks) {
        // Reset game state
        cleanup();
        
        // Initialize tile pool
        initTilePool();
        
        // Cache gameboard height
        gameboardHeight = gameBoard.offsetHeight;
        
        // Reset time tracking for hell mode
        totalGameTime = 0;
        lastSpeedBoostTime = 0;
        
        // Reset score and counter
        score = 0;
        tileCounter = 0;
        
        // Set difficulty and callbacks
        difficulty = selectedDifficulty;
        if (callbacks) {
            onScoreUpdateCallback = callbacks.onScoreUpdate || null;
            onGameoverCallback = callbacks.onGameover || null;
            audioManager = callbacks.audioManager || null;
            imageManager = callbacks.imageManager || null;
        }
        
        // Initialize game variables
        const settings = difficultySettings[difficulty];
        tileSpeed = settings.initialSpeed;
        spawnInterval = settings.spawnInterval;
        
        // 确保游戏板高度正确设置
        gameBoard.style.height = '100vh';
        
        setupGameBoard();
        startGame();
    }

    // Set up game board with column divs
    function setupGameBoard() {
        // Clear existing content
        gameBoardColumns.innerHTML = '';
        
        // Create columns
        for (let i = 0; i < columns; i++) {
            const column = document.createElement('div');
            column.className = 'tile-container';
            column.dataset.column = i;
            gameBoardColumns.appendChild(column);
        }
    }

    // Start the game loop
    function startGame() {
        gameActive = true;
        score = 0;
        lastTileTime = 0;
        
        // 延迟创建第一个方块，给玩家准备时间
        setTimeout(() => {
            createTile();
            // Start animation loop
            lastTimestamp = performance.now();
            animationFrameId = requestAnimationFrame(gameLoop);
        }, 1000); // 给玩家1秒准备时间
    }

    // Main game loop
    function gameLoop(timestamp) {
        if (!gameActive) return;
        
        const deltaTime = timestamp - lastTimestamp;
        lastTimestamp = timestamp;
        totalGameTime += deltaTime;
        
        // 确保deltaTime不会过大，避免跳帧问题
        const cappedDeltaTime = Math.min(deltaTime, 32);
        
        // Update tile positions
        updateTiles(cappedDeltaTime);
        
        // 优化方块生成间隔，确保合理的生成频率
        const currentSpawnInterval = Math.max(
            difficultySettings[difficulty].spawnInterval * 0.6,
            difficultySettings[difficulty].spawnInterval - (totalGameTime / 1000) * 2
        );
        
        if (timestamp - lastTileTime > currentSpawnInterval) {
            const lastTile = activeTiles[activeTiles.length - 1];
            if (!lastTile || lastTile.top > tileHeight * 0.5) {
                createTile();
                lastTileTime = timestamp;
            }
        }
        
        // 更新速度 - 所有难度都会随时间增加速度
        const settings = difficultySettings[difficulty];
        if (timestamp - lastSpeedBoostTime > settings.speedBoostInterval) {
            if (tileSpeed < settings.maxSpeed) {
                // 根据难度增加不同的速度
                const speedIncrease = difficulty === 'hell' ? settings.speedBoostAmount : settings.speedIncrement * settings.speedBoostInterval;
                tileSpeed += speedIncrease;
                tileSpeed = Math.min(tileSpeed, settings.maxSpeed);
                
                // 视觉反馈
                gameBoard.classList.add('speed-boost');
                setTimeout(() => gameBoard.classList.remove('speed-boost'), 500);
                
                lastSpeedBoostTime = timestamp;
            }
        }
        
        animationFrameId = requestAnimationFrame(gameLoop);
    }

    // Update all active tiles
    function updateTiles(deltaTime) {
        const tilesToRemove = [];
        const normalizedDelta = deltaTime / 16.67; // Normalize to 60fps

        for (let i = 0; i < activeTiles.length; i++) {
            const tile = activeTiles[i];
            // 更新位置，增加移动速度的倍数使移动更明显
            const moveAmount = tileSpeed * normalizedDelta;
            tile.top += moveAmount;
            
            // 使用requestAnimationFrame确保平滑移动
            requestAnimationFrame(() => {
                tile.element.style.transform = `translateY(${tile.top}px)`;
            });
            
            // 检查是否超出边界
            if (tile.top >= gameboardHeight) {
                tilesToRemove.push(tile);
                // 只有非红色方块未点击时才会游戏结束
                if (!tile.clicked && !tile.isRed && gameActive) {
                    gameOver();
                    return;
                }
            }
        }

        // 批量移除超出边界的方块
        if (tilesToRemove.length > 0) {
            for (const tile of tilesToRemove) {
                if (tile.element.parentNode) {
                    tile.element.parentNode.removeChild(tile.element);
                    returnTile(tile.element);
                }
            }
            activeTiles = activeTiles.filter(t => !tilesToRemove.includes(t));
        }
    }

    // Create a new tile
    function createTile() {
        // 确保不会在同一列连续生成方块
        let column;
        do {
            column = Math.floor(Math.random() * columns);
        } while (activeTiles.some(tile => tile.column === column && tile.top < tileHeight * 2));
        
        const columnElement = gameBoardColumns.querySelector(`[data-column="${column}"]`);
        if (!columnElement) return;
        
        const tileElement = getTile();
        tileElement.className = 'tile';
        
        // 确保tileId是数字类型
        const tileId = Number(tileCounter++);
        tileElement.dataset.id = String(tileId);
        
        // Determine if this should be a red tile in hell mode
        const isRedTile = difficulty === 'hell' && 
                         Math.random() < difficultySettings.hell.redTileChance;
        
        // 设置初始位置
        const initialTop = -tileHeight;
        tileElement.style.transform = `translateY(${initialTop}px)`;
        
        // 先设置基本样式
        if (!isRedTile && imageManager?.hasTileImage()) {
            tileElement.classList.add('custom-tile');
            tileElement.style.backgroundImage = `url(${imageManager.getTileImage()})`;
        }
        
        // 如果是红色方块，最后添加红色样式
        if (isRedTile) {
            requestAnimationFrame(() => {
                tileElement.classList.add('red-tile');
            });
        }
        
        const tileObj = {
            id: tileId,
            element: tileElement,
            column: column,
            top: initialTop,
            clicked: false,
            isRed: isRedTile
        };
        
        // 移除旧的事件监听器（如果存在）
        const oldClickHandler = tileElement._clickHandler;
        const oldTouchHandler = tileElement._touchHandler;
        if (oldClickHandler) {
            tileElement.removeEventListener('click', oldClickHandler);
        }
        if (oldTouchHandler) {
            tileElement.removeEventListener('touchstart', oldTouchHandler);
        }
        
        // 添加新的事件监听器
        const clickHandler = (e) => {
            e.preventDefault();
            if (gameActive) {
                handleTileClick(tileId);
            }
        };
        
        tileElement.addEventListener('click', clickHandler);
        tileElement.addEventListener('touchstart', clickHandler, { passive: false });
        
        // 保存事件处理函数的引用
        tileElement._clickHandler = clickHandler;
        tileElement._touchHandler = clickHandler;
        
        activeTiles.push(tileObj);
        columnElement.appendChild(tileElement);
    }

    // Handle tile click
    function handleTileClick(tileId) {
        if (!gameActive) return;
        
        // 使用Number转换确保ID比较正确
        const tileIndex = activeTiles.findIndex(tile => 
            tile.id === Number(tileId) || tile.id === tileId
        );
        
        if (tileIndex !== -1) {
            const tile = activeTiles[tileIndex];
            
            // 防止重复点击
            if (tile.clicked) return;
            
            // Check if clicked a red tile in hell mode
            if (tile.isRed) {
                tile.element.style.transform = `translateY(${tile.top}px) scale(1.2)`;
                setTimeout(() => {
                    gameOver();
                }, 100);
                return;
            }
            
            // Mark as clicked
            tile.clicked = true;
            
            // Change tile appearance to clicked state
            const tileElement = tile.element;
            tileElement.classList.add('tile-clicked');
            
            // Apply clicked image if available
            if (!tile.isRed && imageManager && imageManager.hasClickedTileImage()) {
                tileElement.classList.add('custom-tile');
                tileElement.style.backgroundImage = `url(${imageManager.getClickedTileImage()})`;
            } else {
                tileElement.style.backgroundColor = "rgba(0, 0, 0, 0.2)";
                tileElement.style.opacity = "0.5";
            }
            
            // Play click sound
            if (audioManager) {
                audioManager.playClickSound();
            }
            
            // Update score
            score++;
            if (onScoreUpdateCallback) {
                onScoreUpdateCallback(score);
            }
        }
    }

    // Game over
    function gameOver() {
        gameActive = false;
        cancelAnimationFrame(animationFrameId);
        
        // Play fail sound
        if (audioManager) {
            audioManager.playFailSound();
        }
        
        // Call game over callback with final score
        if (onGameoverCallback) {
            onGameoverCallback(score);
        }
    }

    // Pause the game
    function pauseGame() {
        if (!gameActive) return;
        
        gameActive = false;
        cancelAnimationFrame(animationFrameId);
    }

    // Resume the game
    function resumeGame() {
        if (gameActive) return;
        
        gameActive = true;
        lastTimestamp = performance.now();
        animationFrameId = requestAnimationFrame(gameLoop);
    }

    // Stop the game and clean up
    function stopGame() {
        gameActive = false;
        cancelAnimationFrame(animationFrameId);
        cleanup();
    }

    // Clean up resources
    function cleanup() {
        // Clear game board
        if (gameBoardColumns) {
            gameBoardColumns.innerHTML = '';
        }
        
        // Reset variables
        activeTiles = [];
        tileCounter = 0;
        score = 0;
        
        // Cancel animation frame if active
        if (animationFrameId) {
            cancelAnimationFrame(animationFrameId);
            animationFrameId = null;
        }
    }

    // Public API
    return {
        initialize,
        pauseGame,
        resumeGame,
        stopGame
    };
})();
