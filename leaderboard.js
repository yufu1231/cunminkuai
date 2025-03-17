class LeaderboardManager {
    constructor() {
        this.leaderboard = [];
        this.maxEntries = 10;
        this.loadLeaderboard();
        
        // DOM Elements
        this.playerNameInput = document.getElementById('player-name');
        this.saveScoreBtn = document.getElementById('save-score-btn');
        this.showLeaderboardBtn = document.getElementById('show-leaderboard-btn');
        this.closeLeaderboardBtn = document.getElementById('close-leaderboard-btn');
        this.closeLeaderboardBtnBottom = document.getElementById('close-leaderboard-btn-bottom');
        this.leaderboardModal = document.getElementById('leaderboard-modal');
        this.leaderboardList = document.getElementById('leaderboard-list');
        
        // Event Listeners
        this.saveScoreBtn.addEventListener('click', () => this.saveScore());
        this.showLeaderboardBtn.addEventListener('click', () => this.showLeaderboard());
        this.closeLeaderboardBtn.addEventListener('click', () => this.hideLeaderboard());
        this.closeLeaderboardBtnBottom.addEventListener('click', () => this.hideLeaderboard());
        
        // Load last used name
        const lastUsedName = localStorage.getItem('pianoTiles_lastPlayerName');
        if (lastUsedName) {
            this.playerNameInput.value = lastUsedName;
        }
    }
    
    loadLeaderboard() {
        const savedLeaderboard = localStorage.getItem('pianoTiles_leaderboard');
        if (savedLeaderboard) {
            this.leaderboard = JSON.parse(savedLeaderboard);
        }
    }
    
    saveLeaderboard() {
        localStorage.setItem('pianoTiles_leaderboard', JSON.stringify(this.leaderboard));
    }
    
    saveScore() {
        const playerName = this.playerNameInput.value.trim() || '匿名玩家';
        const score = parseInt(document.getElementById('final-score').textContent);
        
        // Save player name for next time
        localStorage.setItem('pianoTiles_lastPlayerName', playerName);
        
        // Add new score
        this.leaderboard.push({
            name: playerName,
            score: score,
            date: new Date().toISOString()
        });
        
        // Sort by score (highest first)
        this.leaderboard.sort((a, b) => b.score - a.score);
        
        // Keep only top scores
        if (this.leaderboard.length > this.maxEntries) {
            this.leaderboard = this.leaderboard.slice(0, this.maxEntries);
        }
        
        // Save to localStorage
        this.saveLeaderboard();
        
        // Show updated leaderboard
        this.showLeaderboard();
        
        // Disable save button
        this.saveScoreBtn.disabled = true;
        this.saveScoreBtn.textContent = '已保存';
    }
    
    showLeaderboard() {
        // Clear current list
        this.leaderboardList.innerHTML = '';
        
        // Add entries
        this.leaderboard.forEach((entry, index) => {
            const entryElement = document.createElement('div');
            entryElement.className = 'flex items-center justify-between p-3 bg-gray-50 rounded-md';
            
            const rankClass = index === 0 ? 'text-yellow-500' : 
                            index === 1 ? 'text-gray-500' : 
                            index === 2 ? 'text-amber-600' : 'text-gray-600';
            
            const date = new Date(entry.date);
            const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
            
            entryElement.innerHTML = `
                <div class="flex items-center gap-4">
                    <span class="font-bold ${rankClass}">#${index + 1}</span>
                    <span class="font-medium">${entry.name}</span>
                </div>
                <div class="flex items-center gap-4">
                    <span class="text-gray-500 text-sm">${dateStr}</span>
                    <span class="font-bold">${entry.score}</span>
                </div>
            `;
            
            this.leaderboardList.appendChild(entryElement);
        });
        
        // Show modal
        this.leaderboardModal.classList.remove('hidden');
    }
    
    hideLeaderboard() {
        this.leaderboardModal.classList.add('hidden');
    }
}

// Initialize leaderboard manager
const leaderboardManager = new LeaderboardManager(); 