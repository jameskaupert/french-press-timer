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
        this.audioCache = new Map(); // Cache for loaded audio files
        
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
        this.testAudioBtn = document.getElementById('testAudioBtn');

        // Settings modal elements
        this.settingsBtn = document.getElementById('settingsBtn');
        this.settingsModal = document.getElementById('settingsModal');
        this.closeBtn = document.getElementById('closeBtn');
        this.firstTimerMinutesInput = document.getElementById('firstTimerMinutes');
        this.firstTimerSecondsInput = document.getElementById('firstTimerSeconds');
        this.secondTimerMinutesInput = document.getElementById('secondTimerMinutes');
        this.secondTimerSecondsInput = document.getElementById('secondTimerSeconds');
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
        this.testAudioBtn.addEventListener('click', () => this.testAudio());

        // Settings modal
        this.settingsBtn.addEventListener('click', () => this.openSettings());
        this.closeBtn.addEventListener('click', () => this.closeSettings());
        this.saveSettingsBtn.addEventListener('click', () => this.saveSettings());
        this.resetDefaultsBtn.addEventListener('click', () => this.resetToDefaults());
        
        // Audio settings
        this.audioVolumeInput.addEventListener('input', () => this.updateVolumeDisplay());

        // Make timer circle clickable to start
        this.timerCircle = document.querySelector('.timer-circle');
        this.timerCircle.addEventListener('click', () => {
            if (this.state.currentStage === 'idle') {
                this.startTimer();
            } else if (this.state.currentStage === 'stir') {
                this.continueToFinalBrewing();
            }
        });

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
        // Convert seconds to minutes and seconds for display
        const steepMinutes = Math.floor(this.state.settings.steepTime / 60);
        const steepSeconds = this.state.settings.steepTime % 60;
        const brewMinutes = Math.floor(this.state.settings.brewTime / 60);
        const brewSeconds = this.state.settings.brewTime % 60;
        
        // Defensive checks for DOM elements (needed for test environment)
        if (this.firstTimerMinutesInput) this.firstTimerMinutesInput.value = steepMinutes;
        if (this.firstTimerSecondsInput) this.firstTimerSecondsInput.value = steepSeconds;
        if (this.secondTimerMinutesInput) this.secondTimerMinutesInput.value = brewMinutes;
        if (this.secondTimerSecondsInput) this.secondTimerSecondsInput.value = brewSeconds;
        if (this.audioEnabledInput) this.audioEnabledInput.checked = this.settings.audioEnabled;
        if (this.audioVolumeInput) this.audioVolumeInput.value = this.settings.audioVolume;
        this.updateVolumeDisplay();
    }

    updateVolumeDisplay() {
        // Defensive check for DOM elements (needed for test environment)
        if (this.audioVolumeInput && this.volumeDisplay) {
            const percentage = Math.round(this.audioVolumeInput.value * 100);
            this.volumeDisplay.textContent = `${percentage}%`;
        }
    }

    startTimer() {
        this.state.currentStage = 'steeping';
        this.state.timeRemaining = this.state.settings.steepTime;
        this.state.totalTime = this.state.settings.steepTime;
        this.state.isRunning = true;

        this.startBtn.style.display = 'none';

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

        // Update urgency indicators
        this.updateUrgencyIndicators();
    }

    updateUrgencyIndicators() {
        const timerDisplay = document.querySelector('.timer-display');
        
        // Remove existing urgency classes
        timerDisplay.classList.remove('urgency-low', 'urgency-medium', 'urgency-high');
        
        // Only apply urgency indicators during active timer stages
        if (this.state.currentStage === 'steeping' || this.state.currentStage === 'brewing') {
            const remaining = this.state.timeRemaining;
            
            if (remaining <= 10) {
                // Last 10 seconds - high urgency
                timerDisplay.classList.add('urgency-high');
            } else if (remaining <= 30) {
                // Last 30 seconds - medium urgency
                timerDisplay.classList.add('urgency-medium');
            } else {
                // More than 30 seconds remaining - low urgency
                timerDisplay.classList.add('urgency-low');
            }
        } else {
            // Default state for idle, stir, and complete stages
            timerDisplay.classList.add('urgency-low');
        }
    }

    updateStageDisplay() {
        const stageIndicator = document.querySelector('.stage-indicator');
        const timerDisplay = document.querySelector('.timer-display');
        
        // Remove all stage classes from both elements
        stageIndicator.classList.remove('stage-idle', 'stage-steeping', 'stage-stir', 'stage-brewing', 'stage-complete');
        timerDisplay.classList.remove('stage-idle', 'stage-steeping', 'stage-stir', 'stage-brewing', 'stage-complete');
        
        switch (this.state.currentStage) {
            case 'idle':
                this.stageTitle.textContent = 'Ready to Start';
                this.stageDescription.textContent = 'Press "Start Brewing" to begin';
                this.timeDisplay.textContent = `${Math.floor(this.state.settings.steepTime / 60)}:00`;
                stageIndicator.classList.add('stage-idle');
                timerDisplay.classList.add('stage-idle');
                break;
            case 'steeping':
                this.stageTitle.textContent = 'Steeping';
                this.stageDescription.textContent = 'Let the coffee steep...';
                stageIndicator.classList.add('stage-steeping');
                timerDisplay.classList.add('stage-steeping');
                break;
            case 'stir':
                this.stageTitle.textContent = 'Stir Coffee';
                this.stageDescription.textContent = 'Give the coffee a gentle stir, then continue';
                this.timeDisplay.textContent = '0:00';
                stageIndicator.classList.add('stage-stir');
                timerDisplay.classList.add('stage-stir');
                break;
            case 'brewing':
                this.stageTitle.textContent = 'Final Brewing';
                this.stageDescription.textContent = 'Almost ready...';
                stageIndicator.classList.add('stage-brewing');
                timerDisplay.classList.add('stage-brewing');
                break;
            case 'complete':
                this.stageTitle.textContent = 'Ready to Pour!';
                this.stageDescription.textContent = 'Your coffee is ready to enjoy';
                this.timeDisplay.textContent = '0:00';
                stageIndicator.classList.add('stage-complete');
                timerDisplay.classList.add('stage-complete');
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
        
        // Enhanced visual flash effect with stage-specific colors
        this.playVisualAlert(type);
    }

    playVisualAlert(type = 'default') {
        const colors = {
            'steeping_complete': '#DCA561', // autumnYellow for steeping complete
            'stir_reminder': '#7E9CD8',     // crystalBlue for stir reminder
            'brewing_complete': '#76946A',  // autumnGreen for brewing complete
            'default': '#76946A'            // autumnGreen default
        };

        const color = colors[type] || colors['default'];
        
        // Set CSS variable for flash color
        document.body.style.setProperty('--flash-color', color);
        document.body.classList.add('flash-alert');
        
        // Multiple flash effect for important alerts
        if (type === 'stir_reminder' || type === 'brewing_complete') {
            setTimeout(() => {
                document.body.classList.remove('flash-alert');
                setTimeout(() => {
                    document.body.classList.add('flash-alert');
                    setTimeout(() => {
                        document.body.classList.remove('flash-alert');
                    }, 500);
                }, 100);
            }, 500);
        } else {
            // Single flash for less critical alerts
            setTimeout(() => {
                document.body.classList.remove('flash-alert');
            }, 500);
        }

        // Add border flash to timer circle for extra visibility
        this.flashTimerCircle(color);
    }

    flashTimerCircle(color) {
        const progressCircle = document.getElementById('progressCircle');
        const originalStrokeWidth = progressCircle.style.strokeWidth || '8';
        
        // Create a subtle pulse effect on the progress circle instead of harsh box shadow
        progressCircle.style.strokeWidth = '12';
        progressCircle.style.transition = 'stroke-width 0.3s ease, opacity 0.3s ease';
        progressCircle.style.opacity = '0.8';
        
        setTimeout(() => {
            progressCircle.style.strokeWidth = '10';
            progressCircle.style.opacity = '0.9';
            
            setTimeout(() => {
                progressCircle.style.strokeWidth = originalStrokeWidth;
                progressCircle.style.opacity = '1';
            }, 300);
        }, 300);
    }

    async playAudioNotification(type = 'default') {
        try {
            // Check if audio is enabled in settings
            if (!this.settings.audioEnabled) {
                console.log('Audio disabled in settings');
                return;
            }

            console.log(`Playing audio notification: ${type}`);
            
            // Try to play arpeggio audio file first, fallback to synthesized beeps
            const audioPlayed = await this.playArpeggioAudio(type);
            if (!audioPlayed) {
                console.log('Arpeggio audio failed, falling back to synthesized beeps');
                // Fallback to synthesized beeps for compatibility
                this.playSynthesizedAudio(type);
            }
        } catch (error) {
            console.warn('Audio notification failed:', error);
            // Final fallback to synthesized beeps
            try {
                this.playSynthesizedAudio(type);
            } catch (fallbackError) {
                console.error('Both audio systems failed:', fallbackError);
            }
        }
    }

    async playArpeggioAudio(type = 'default') {
        try {
            // Map notification types to audio files
            const audioFiles = {
                'steeping_complete': './assets/audio/steeping-complete.wav',
                'stir_reminder': './assets/audio/stir-reminder.wav',
                'brewing_complete': './assets/audio/brewing-complete.wav',
                'default': './assets/audio/default-notification.wav'
            };

            const audioFile = audioFiles[type] || audioFiles['default'];
            console.log(`Attempting to play arpeggio audio: ${type} -> ${audioFile}`);
            
            // Check cache first
            if (this.audioCache.has(audioFile)) {
                console.log('Using cached audio file');
                const audio = this.audioCache.get(audioFile).cloneNode();
                audio.volume = this.settings.audioVolume || 0.5;
                await this.playAudioElement(audio);
                return true;
            }

            // Load and cache audio file
            console.log('Loading new audio file');
            const audio = new Audio(audioFile);
            audio.volume = this.settings.audioVolume || 0.5;
            audio.preload = 'auto';
            
            // iOS compatibility: ensure audio can play
            if (typeof audio.play === 'function') {
                await this.playAudioElement(audio);
                this.audioCache.set(audioFile, audio);
                console.log('Successfully played and cached arpeggio audio');
                return true;
            }
            
            console.warn('Audio.play not available');
            return false;
        } catch (error) {
            console.warn('Arpeggio audio failed, using fallback:', error);
            return false;
        }
    }

    async playAudioElement(audio) {
        return new Promise((resolve, reject) => {
            console.log('Setting up audio element for playback');
            
            // iOS compatibility: handle audio context unlock
            const playAudio = async () => {
                try {
                    console.log('Audio can play through, attempting playback');
                    
                    // Create audio context for iOS unlock if needed
                    if (!this.audioContext) {
                        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
                    }
                    
                    if (this.audioContext.state === 'suspended') {
                        await this.audioContext.resume();
                    }
                    
                    const playPromise = audio.play();
                    if (playPromise !== undefined) {
                        await playPromise;
                        console.log('Audio playback successful');
                    }
                    resolve();
                } catch (playError) {
                    console.error('Audio playback failed:', playError);
                    reject(playError);
                }
            };
            
            const handleError = (error) => {
                console.error('Audio loading failed:', error);
                reject(error);
            };
            
            audio.addEventListener('canplaythrough', playAudio, { once: true });
            audio.addEventListener('error', handleError, { once: true });
            
            // Add timeout in case loading takes too long
            const timeout = setTimeout(() => {
                console.warn('Audio loading timeout, trying to play anyway');
                playAudio().catch(reject);
            }, 2000);
            
            audio.addEventListener('canplaythrough', () => clearTimeout(timeout), { once: true });
            audio.addEventListener('error', () => clearTimeout(timeout), { once: true });
            
            // Start loading
            console.log('Starting audio load');
            audio.load();
        });
    }

    playSynthesizedAudio(type = 'default') {
        try {
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
            console.warn('Synthesized audio failed:', error);
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
        const steepMinutes = parseInt(this.firstTimerMinutesInput.value);
        const steepSeconds = parseInt(this.firstTimerSecondsInput.value);
        const brewMinutes = parseInt(this.secondTimerMinutesInput.value);
        const brewSeconds = parseInt(this.secondTimerSecondsInput.value);

        // Check for non-numeric inputs
        if (isNaN(steepMinutes) || isNaN(steepSeconds) || isNaN(brewMinutes) || isNaN(brewSeconds)) {
            alert('Please enter valid times. Each timer must be between 1 second and 30 minutes.');
            return;
        }

        // Use 0 as fallback for valid parsed values
        const totalSteepTime = (steepMinutes || 0) * 60 + (steepSeconds || 0);
        const totalBrewTime = (brewMinutes || 0) * 60 + (brewSeconds || 0);

        // Validate: total time should be between 1 second and 30 minutes (1800 seconds)
        // At least one timer must have a meaningful time (> 0)
        if ((totalSteepTime > 0 && totalSteepTime <= 1800) && 
            (totalBrewTime > 0 && totalBrewTime <= 1800)) {
            this.state.settings.steepTime = totalSteepTime;
            this.state.settings.brewTime = totalBrewTime;
            this.settings.audioEnabled = this.audioEnabledInput.checked;
            this.settings.audioVolume = parseFloat(this.audioVolumeInput.value);
            
            this.saveSettingsToStorage();
            this.closeSettings();
            
            // Update display if we're in idle state
            if (this.state.currentStage === 'idle') {
                this.updateDisplay();
            }
        } else {
            alert('Please enter valid times. Each timer must be between 1 second and 30 minutes.');
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

    testAudio() {
        console.log('Testing audio system...');
        
        // Test all arpeggio types in sequence
        const testSequence = [
            { type: 'steeping_complete', delay: 0 },
            { type: 'stir_reminder', delay: 2000 },
            { type: 'brewing_complete', delay: 4000 },
            { type: 'default', delay: 6000 }
        ];
        
        testSequence.forEach(({ type, delay }) => {
            setTimeout(() => {
                console.log(`Testing ${type} audio...`);
                this.playAudioNotification(type);
            }, delay);
        });
        
        // Also show a message to user
        const originalText = this.testAudioBtn.textContent;
        this.testAudioBtn.textContent = '🎵 Playing...';
        this.testAudioBtn.disabled = true;
        
        setTimeout(() => {
            this.testAudioBtn.textContent = originalText;
            this.testAudioBtn.disabled = false;
        }, 8000);
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