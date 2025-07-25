// French Press Timer Application
class FrenchPressTimer {
    constructor() {
        this.state = {
            currentStage: 'idle', // idle, steeping, stir, brewing, complete
            timeRemaining: 0,
            totalTime: 0,
            isRunning: false,
            settings: {
                steepTime: 4 * 60, // 4 minutes in seconds
                brewTime: 8 * 60   // 8 minutes in seconds
            }
        };

        this.timerInterval = null;
        this.audioContext = null;
        
        // Default settings
        this.settings = {
            audioEnabled: true,
            audioVolume: 0.5
        };
        
        this.initializeElements();
        this.loadSettings();
        this.setupEventListeners();
        this.updateDisplay();
    }

    initializeElements() {
        // Timer display elements
        this.timeDisplay = document.getElementById('timeDisplay');
        this.stageTitle = document.getElementById('stageTitle');
        this.stageDescription = document.getElementById('stageDescription');
        this.progressCircle = document.getElementById('progressCircle');

        // Control buttons
        this.startBtn = document.getElementById('startBtn');
        this.resetBtn = document.getElementById('resetBtn');
        this.continueBtn = document.getElementById('continueBtn');

        // Settings modal elements
        this.settingsBtn = document.getElementById('settingsBtn');
        this.settingsModal = document.getElementById('settingsModal');
        this.closeBtn = document.getElementById('closeBtn');
        this.firstTimerInput = document.getElementById('firstTimer');
        this.secondTimerInput = document.getElementById('secondTimer');
        this.audioEnabledInput = document.getElementById('audioEnabled');
        this.audioVolumeInput = document.getElementById('audioVolume');
        this.volumeDisplay = document.getElementById('volumeDisplay');
        this.saveSettingsBtn = document.getElementById('saveSettings');
        this.resetDefaultsBtn = document.getElementById('resetDefaults');

        // Set up progress circle
        this.setupProgressCircle();
    }

    setupProgressCircle() {
        const circle = this.progressCircle;
        const radius = circle.r.baseVal.value;
        const circumference = radius * 2 * Math.PI;
        
        circle.style.strokeDasharray = `${circumference} ${circumference}`;
        circle.style.strokeDashoffset = circumference;
    }

    setupEventListeners() {
        // Control buttons
        this.startBtn.addEventListener('click', () => this.startTimer());
        this.resetBtn.addEventListener('click', () => this.resetTimer());
        this.continueBtn.addEventListener('click', () => this.continueToFinalBrewing());

        // Settings modal
        this.settingsBtn.addEventListener('click', () => this.openSettings());
        this.closeBtn.addEventListener('click', () => this.closeSettings());
        this.saveSettingsBtn.addEventListener('click', () => this.saveSettings());
        this.resetDefaultsBtn.addEventListener('click', () => this.resetToDefaults());
        
        // Audio settings
        this.audioVolumeInput.addEventListener('input', () => this.updateVolumeDisplay());

        // Close modal when clicking outside
        this.settingsModal.addEventListener('click', (e) => {
            if (e.target === this.settingsModal) {
                this.closeSettings();
            }
        });
    }

    loadSettings() {
        try {
            const saved = localStorage.getItem('frenchPressSettings');
            if (saved) {
                const settings = JSON.parse(saved);
                this.state.settings.steepTime = settings.steepTime || 4 * 60;
                this.state.settings.brewTime = settings.brewTime || 8 * 60;
                this.settings.audioEnabled = settings.audioEnabled !== undefined ? settings.audioEnabled : true;
                this.settings.audioVolume = settings.audioVolume || 0.5;
            }
        } catch (error) {
            console.warn('Could not load settings from localStorage:', error);
        }
        
        this.updateSettingsDisplay();
    }

    saveSettingsToStorage() {
        try {
            const allSettings = {
                ...this.state.settings,
                audioEnabled: this.settings.audioEnabled,
                audioVolume: this.settings.audioVolume
            };
            localStorage.setItem('frenchPressSettings', JSON.stringify(allSettings));
        } catch (error) {
            console.warn('Could not save settings to localStorage:', error);
        }
    }

    updateSettingsDisplay() {
        this.firstTimerInput.value = Math.floor(this.state.settings.steepTime / 60);
        this.secondTimerInput.value = Math.floor(this.state.settings.brewTime / 60);
        this.audioEnabledInput.checked = this.settings.audioEnabled;
        this.audioVolumeInput.value = this.settings.audioVolume;
        this.updateVolumeDisplay();
    }

    updateVolumeDisplay() {
        const percentage = Math.round(this.audioVolumeInput.value * 100);
        this.volumeDisplay.textContent = `${percentage}%`;
    }

    startTimer() {
        this.state.currentStage = 'steeping';
        this.state.timeRemaining = this.state.settings.steepTime;
        this.state.totalTime = this.state.settings.steepTime;
        this.state.isRunning = true;

        this.startBtn.style.display = 'none';
        this.resetBtn.style.display = 'inline-block';

        this.runTimer();
        this.updateDisplay();
    }

    runTimer() {
        this.timerInterval = setInterval(() => {
            if (this.state.timeRemaining > 0) {
                this.state.timeRemaining--;
                this.updateDisplay();
            } else {
                this.handleTimerComplete();
            }
        }, 1000);
    }

    handleTimerComplete() {
        clearInterval(this.timerInterval);
        this.state.isRunning = false;

        if (this.state.currentStage === 'steeping') {
            this.state.currentStage = 'stir';
            this.showStirReminder();
            this.playNotification('steeping_complete');
        } else if (this.state.currentStage === 'brewing') {
            this.state.currentStage = 'complete';
            this.showComplete();
            this.playNotification('brewing_complete');
        }

        this.updateDisplay();
    }

    showStirReminder() {
        this.continueBtn.style.display = 'inline-block';
        // Play stir reminder notification after a brief delay
        setTimeout(() => {
            this.playNotification('stir_reminder');
        }, 500);
    }

    continueToFinalBrewing() {
        this.state.currentStage = 'brewing';
        this.state.timeRemaining = this.state.settings.brewTime;
        this.state.totalTime = this.state.settings.brewTime;
        this.state.isRunning = true;

        this.continueBtn.style.display = 'none';

        this.runTimer();
        this.updateDisplay();
    }

    showComplete() {
        this.resetBtn.textContent = 'Start New Brew';
    }

    resetTimer() {
        clearInterval(this.timerInterval);
        this.timerInterval = null;
        
        this.state.currentStage = 'idle';
        this.state.timeRemaining = 0;
        this.state.totalTime = 0;
        this.state.isRunning = false;

        this.startBtn.style.display = 'inline-block';
        this.resetBtn.style.display = 'none';
        this.continueBtn.style.display = 'none';
        this.resetBtn.textContent = 'Reset';

        this.updateDisplay();
    }

    updateDisplay() {
        // Update time display
        const minutes = Math.floor(this.state.timeRemaining / 60);
        const seconds = this.state.timeRemaining % 60;
        this.timeDisplay.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;

        // Update stage information
        this.updateStageDisplay();

        // Update progress circle
        this.updateProgressCircle();
    }

    updateStageDisplay() {
        switch (this.state.currentStage) {
            case 'idle':
                this.stageTitle.textContent = 'Ready to Start';
                this.stageDescription.textContent = 'Press start to begin brewing';
                this.timeDisplay.textContent = `${Math.floor(this.state.settings.steepTime / 60)}:00`;
                break;
            case 'steeping':
                this.stageTitle.textContent = 'Steeping';
                this.stageDescription.textContent = 'Let the coffee steep...';
                break;
            case 'stir':
                this.stageTitle.textContent = 'Stir Coffee';
                this.stageDescription.textContent = 'Give the coffee a gentle stir, then continue';
                this.timeDisplay.textContent = '0:00';
                break;
            case 'brewing':
                this.stageTitle.textContent = 'Final Brewing';
                this.stageDescription.textContent = 'Almost ready...';
                break;
            case 'complete':
                this.stageTitle.textContent = 'Ready to Pour!';
                this.stageDescription.textContent = 'Your coffee is ready to enjoy';
                this.timeDisplay.textContent = '0:00';
                break;
        }
    }

    updateProgressCircle() {
        const circle = this.progressCircle;
        const radius = circle.r.baseVal.value;
        const circumference = radius * 2 * Math.PI;
        
        if (this.state.totalTime > 0) {
            const progress = (this.state.totalTime - this.state.timeRemaining) / this.state.totalTime;
            const offset = circumference - (progress * circumference);
            circle.style.strokeDashoffset = offset;
        } else {
            circle.style.strokeDashoffset = circumference;
        }
    }

    playNotification(type = 'default') {
        // Play audio notification
        this.playAudioNotification(type);
        
        // Visual flash effect
        document.body.style.backgroundColor = '#4CAF50';
        setTimeout(() => {
            document.body.style.backgroundColor = '#1a1a1a';
        }, 200);
    }

    playAudioNotification(type = 'default') {
        try {
            // Check if audio is enabled in settings
            if (!this.settings.audioEnabled) {
                return;
            }

            // Create audio context if it doesn't exist
            if (!this.audioContext) {
                this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            }

            // Resume audio context if suspended (required for user interaction)
            if (this.audioContext.state === 'suspended') {
                this.audioContext.resume();
            }

            // Create different notification sounds based on type
            switch (type) {
                case 'steeping_complete':
                    this.playBeepSequence([800, 600], [0.3, 0.3], 200);
                    break;
                case 'stir_reminder':
                    this.playBeepSequence([400], [0.5], 0);
                    break;
                case 'brewing_complete':
                    this.playBeepSequence([600, 800, 1000], [0.2, 0.2, 0.4], 150);
                    break;
                default:
                    this.playBeepSequence([800], [0.3], 0);
            }
        } catch (error) {
            console.warn('Audio notification failed:', error);
            // Graceful fallback - audio is not critical to functionality
        }
    }

    playBeepSequence(frequencies, durations, gaps) {
        let currentTime = this.audioContext.currentTime;
        
        for (let i = 0; i < frequencies.length; i++) {
            this.playBeep(frequencies[i], currentTime, durations[i]);
            currentTime += durations[i] + (gaps / 1000);
        }
    }

    playBeep(frequency, startTime, duration) {
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.frequency.setValueAtTime(frequency, startTime);
        oscillator.type = 'sine';
        
        // Set volume based on settings
        const volume = this.settings.audioVolume || 0.5;
        gainNode.gain.setValueAtTime(0, startTime);
        gainNode.gain.linearRampToValueAtTime(volume, startTime + 0.01);
        gainNode.gain.linearRampToValueAtTime(0, startTime + duration);
        
        oscillator.start(startTime);
        oscillator.stop(startTime + duration);
    }

    // Settings modal methods
    openSettings() {
        this.updateSettingsDisplay();
        this.settingsModal.style.display = 'flex';
    }

    closeSettings() {
        this.settingsModal.style.display = 'none';
    }

    saveSettings() {
        const steepMinutes = parseInt(this.firstTimerInput.value);
        const brewMinutes = parseInt(this.secondTimerInput.value);

        if (steepMinutes > 0 && steepMinutes <= 30 && brewMinutes > 0 && brewMinutes <= 30) {
            this.state.settings.steepTime = steepMinutes * 60;
            this.state.settings.brewTime = brewMinutes * 60;
            this.settings.audioEnabled = this.audioEnabledInput.checked;
            this.settings.audioVolume = parseFloat(this.audioVolumeInput.value);
            
            this.saveSettingsToStorage();
            this.closeSettings();
            
            // Update display if we're in idle state
            if (this.state.currentStage === 'idle') {
                this.updateDisplay();
            }
        } else {
            alert('Please enter valid times between 1 and 30 minutes.');
        }
    }

    resetToDefaults() {
        this.state.settings.steepTime = 4 * 60;
        this.state.settings.brewTime = 8 * 60;
        this.settings.audioEnabled = true;
        this.settings.audioVolume = 0.5;
        this.updateSettingsDisplay();
        this.saveSettingsToStorage();
        
        if (this.state.currentStage === 'idle') {
            this.updateDisplay();
        }
    }
}

// Initialize the timer when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new FrenchPressTimer();
});

// Export for testing (Node.js environment)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = FrenchPressTimer;
}