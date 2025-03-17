// Audio Manager to handle sound effects

class AudioManager {
    constructor() {
        // Default sounds
        this.defaultClickSound = 'assets/click.WAV';
        this.defaultFailSound = 'assets/fail.WAV';
        
        // Current sounds
        this.clickSound = null;
        this.failSound = null;
        
        // Sound names for display
        this.clickSoundName = '';
        this.failSoundName = '';
        
        // Audio context for playing sounds
        this.audioContext = null;
        
        // Load default sounds
        this.loadDefaultSounds();
    }
    
    // Load default sounds
    loadDefaultSounds() {
        fetch(this.defaultClickSound)
            .then(response => response.blob())
            .then(blob => {
                const reader = new FileReader();
                reader.onloadend = () => {
                    this.clickSound = reader.result;
                    this.clickSoundName = 'default_click.mp3';
                    localStorage.setItem('pianoTiles_clickSound', reader.result);
                    localStorage.setItem('pianoTiles_clickSoundName', 'default_click.mp3');
                };
                reader.readAsDataURL(blob);
            })
            .catch(error => console.error('Error loading default click sound:', error));
            
        fetch(this.defaultFailSound)
            .then(response => response.blob())
            .then(blob => {
                const reader = new FileReader();
                reader.onloadend = () => {
                    this.failSound = reader.result;
                    this.failSoundName = 'default_fail.mp3';
                    localStorage.setItem('pianoTiles_failSound', reader.result);
                    localStorage.setItem('pianoTiles_failSoundName', 'default_fail.mp3');
                };
                reader.readAsDataURL(blob);
            })
            .catch(error => console.error('Error loading default fail sound:', error));
    }
    
    // Initialize audio context (must be called after user interaction)
    initAudioContext() {
        if (!this.audioContext) {
            try {
                this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            } catch (e) {
                console.error('Web Audio API is not supported in this browser', e);
            }
        }
    }
    
    // Set custom click sound from uploaded file
    setClickSound(dataUrl, fileName) {
        this.clickSound = dataUrl;
        this.clickSoundName = fileName;
        localStorage.setItem('pianoTiles_clickSound', dataUrl);
        localStorage.setItem('pianoTiles_clickSoundName', fileName);
    }
    
    // Set custom fail sound from uploaded file
    setFailSound(dataUrl, fileName) {
        this.failSound = dataUrl;
        this.failSoundName = fileName;
        localStorage.setItem('pianoTiles_failSound', dataUrl);
        localStorage.setItem('pianoTiles_failSoundName', fileName);
    }
    
    // Reset all sounds to defaults
    resetSounds() {
        this.clickSound = null;
        this.clickSoundName = '';
        this.failSound = null;
        this.failSoundName = '';
        
        localStorage.removeItem('pianoTiles_clickSound');
        localStorage.removeItem('pianoTiles_clickSoundName');
        localStorage.removeItem('pianoTiles_failSound');
        localStorage.removeItem('pianoTiles_failSoundName');
    }
    
    // Play click sound
    playClickSound() {
        this.initAudioContext();
        
        if (this.clickSound) {
            this.playSound(this.clickSound);
        } else {
            // Play default click sound
            this.playDefaultClickSound();
        }
    }
    
    // Play fail sound
    playFailSound() {
        this.initAudioContext();
        
        if (this.failSound) {
            this.playSound(this.failSound);
        } else {
            // Play default fail sound
            this.playDefaultFailSound();
        }
    }
    
    // Play sound from data URL
    playSound(dataUrl) {
        if (!this.audioContext) return;
        
        // Decode and play the audio data
        fetch(dataUrl)
            .then(response => response.arrayBuffer())
            .then(arrayBuffer => this.audioContext.decodeAudioData(arrayBuffer))
            .then(audioBuffer => {
                const source = this.audioContext.createBufferSource();
                source.buffer = audioBuffer;
                source.connect(this.audioContext.destination);
                source.start(0);
            })
            .catch(error => {
                console.error('Error playing sound:', error);
                // Fallback to default sound on error
                if (dataUrl === this.failSound) {
                    this.playDefaultFailSound();
                } else {
                    this.playDefaultClickSound();
                }
            });
    }
    
    // Play a default click sound (piano note)
    playDefaultClickSound() {
        if (!this.audioContext) return;
        
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(440, this.audioContext.currentTime); // A4 note
        
        gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.3);
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.start();
        oscillator.stop(this.audioContext.currentTime + 0.3);
    }
    
    // Play a default fail sound
    playDefaultFailSound() {
        if (!this.audioContext) return;
        
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.type = 'sawtooth';
        oscillator.frequency.setValueAtTime(220, this.audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(110, this.audioContext.currentTime + 0.5);
        
        gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.5);
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.start();
        oscillator.stop(this.audioContext.currentTime + 0.5);
    }
    
    // Load saved sounds from local storage
    loadSavedSounds() {
        const savedClickSound = localStorage.getItem('pianoTiles_clickSound');
        const savedClickSoundName = localStorage.getItem('pianoTiles_clickSoundName');
        const savedFailSound = localStorage.getItem('pianoTiles_failSound');
        const savedFailSoundName = localStorage.getItem('pianoTiles_failSoundName');
        
        if (savedClickSound && savedClickSoundName) {
            this.clickSound = savedClickSound;
            this.clickSoundName = savedClickSoundName;
        }
        
        if (savedFailSound && savedFailSoundName) {
            this.failSound = savedFailSound;
            this.failSoundName = savedFailSoundName;
        }
    }
}
