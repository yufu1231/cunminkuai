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
    
    // Tile dimensions
    const tileHeight = 180; // Increased height for better visibility
    
    // Settings for different difficulty levels
    const difficultySettings = {
        easy: {
            initialSpeed: 2,
            speedIncrement: 0.0002,
            maxSpeed: 6,
            spawnInterval: 1200
        },
        medium: {
            initialSpeed: 3.5,
            speedIncrement: 0.0003,
            maxSpeed: 8,
            spawnInterval: 1000
        },
        hard: {
            initialSpeed: 5,
            speedIncrement: 0.0005,
            maxSpeed: 12,
            spawnInterval: 700
        }
    };

    // Initialize the game
    function initialize(selectedDifficulty, callbacks) {
        // Reset game state
        cleanup();
        
        // Set difficulty
        difficulty = selectedDifficulty;
        
        // Set callbacks
        if (callbacks) {
            onScoreUpdateCallback = callbacks.onScoreUpdate || null;
            onGameoverCallback = callbacks.onGameover || null;
            audioManager = callbacks.audioManager || null;
            imageManager = callbacks.imageManager || null;
        }
        
        // Initialize game variables based on difficulty
        const settings = difficultySettings[difficulty];
        tileSpeed = settings.initialSpeed;
        spawnInterval = settings.spawnInterval;
        
        // Set up the game board columns
        setupGameBoard();
        
        // Start the game
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
        
        // Update tile positions
        updateTiles(deltaTime);
        
        // Spawn new tiles
        if (timestamp - lastTileTime > spawnInterval) {
            createTile();
            lastTileTime = timestamp;
            
            // Gradually decrease spawn interval for increasing difficulty
            if (spawnInterval > difficultySettings[difficulty].spawnInterval * 0.6) {
                spawnInterval -= 5;
            }
        }
        
        // Increase speed gradually
        if (tileSpeed < difficultySettings[difficulty].maxSpeed) {
            tileSpeed += difficultySettings[difficulty].speedIncrement * deltaTime;
        }
        
        // Continue the game loop
        animationFrameId = requestAnimationFrame(gameLoop);
    }

    // Update all active tiles
    function updateTiles(deltaTime) {
        const tilesToRemove = [];

        activeTiles.forEach((tile) => {
            // Update tile position
            tile.top += tileSpeed * deltaTime / 16.67; // Normalize to 60fps
            tile.element.style.top = `${tile.top}px`;
            
            // Check if tile is missed (went off-screen)
            if (tile.top > gameBoard.offsetHeight && !tile.clicked) {
                tilesToRemove.push(tile);
                
                // Game over when missing a tile
                if (gameActive) {
                    gameOver();
                }
            }
            // Remove clicked tiles when they go off screen
            else if (tile.top > gameBoard.offsetHeight && tile.clicked) {
                tilesToRemove.push(tile);
            }
        });

        // Remove tiles from the DOM and active tiles array
        tilesToRemove.forEach((tile) => {
            if (tile.element.parentNode) {
                tile.element.parentNode.removeChild(tile.element);
            }
            activeTiles = activeTiles.filter(t => t !== tile);
        });
    }

    // Create a new tile
    function createTile() {
        // Select a random column
        const column = Math.floor(Math.random() * columns);
        const columnElement = gameBoardColumns.querySelector(`[data-column="${column}"]`);
        
        if (!columnElement) return; // Safety check
        
        // Create tile element
        const tileElement = document.createElement('div');
        tileElement.className = 'tile animate-slide-down';
        
        const tileId = tileCounter++;
        tileElement.dataset.id = tileId;
        
        // Set initial position
        tileElement.style.left = `0`; // Position relative to column
        tileElement.style.top = `-${tileHeight}px`;
        
        // Apply custom image if available
        if (imageManager && imageManager.hasTileImage()) {
            tileElement.classList.add('custom-tile');
            tileElement.style.backgroundImage = `url(${imageManager.getTileImage()})`;
        }
        
        // Add tile object to tracking array
        const tileObj = {
            id: tileId,
            element: tileElement,
            column: column,
            top: -tileHeight,
            clicked: false
        };
        
        activeTiles.push(tileObj);
        
        // Add click/touch event listener directly to the tile element
        tileElement.addEventListener('click', (e) => {
            e.preventDefault();
            handleTileClick(tileId);
        });
        
        tileElement.addEventListener('touchstart', (e) => {
            e.preventDefault();
            handleTileClick(tileId);
        }, { passive: false });
        
        // Add tile to column
        columnElement.appendChild(tileElement);
    }

    // Handle tile click
    function handleTileClick(tileId) {
        if (!gameActive) return;
        
        const tileIndex = activeTiles.findIndex(tile => tile.id === parseInt(tileId) || tile.id === tileId);
        
        if (tileIndex !== -1 && !activeTiles[tileIndex].clicked) {
            // Mark as clicked
            activeTiles[tileIndex].clicked = true;
            
            // Change tile appearance to clicked state
            const tileElement = activeTiles[tileIndex].element;
            tileElement.classList.add('tile-clicked');
            
            // Apply clicked image if available
            if (imageManager && imageManager.hasClickedTileImage()) {
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
