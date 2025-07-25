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
            }
        } catch (error) {
            console.warn('Could not load settings from localStorage:', error);
        }
        
        this.updateSettingsDisplay();
    }

    saveSettingsToStorage() {
        try {
            localStorage.setItem('frenchPressSettings', JSON.stringify(this.state.settings));
        } catch (error) {
            console.warn('Could not save settings to localStorage:', error);
        }
    }

    updateSettingsDisplay() {
        this.firstTimerInput.value = Math.floor(this.state.settings.steepTime / 60);
        this.secondTimerInput.value = Math.floor(this.state.settings.brewTime / 60);
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
        } else if (this.state.currentStage === 'brewing') {
            this.state.currentStage = 'complete';
            this.showComplete();
        }

        this.updateDisplay();
        this.playNotification();
    }

    showStirReminder() {
        this.continueBtn.style.display = 'inline-block';
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

    playNotification() {
        // Placeholder for audio notification
        // Will be implemented when audio assets are added
        console.log('Timer complete notification');
        
        // Visual flash effect
        document.body.style.backgroundColor = '#4CAF50';
        setTimeout(() => {
            document.body.style.backgroundColor = '#1a1a1a';
        }, 200);
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