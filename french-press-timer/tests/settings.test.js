const FrenchPressTimer = require('../script.js');

describe('FrenchPressTimer Settings [Issues #5 & #6 - Settings & localStorage]', () => {
  let timer;

  beforeEach(() => {
    // Mock localStorage with proper Jest functions
    Object.defineProperty(global, 'localStorage', {
      value: {
        getItem: jest.fn(() => null),
        setItem: jest.fn(),
        removeItem: jest.fn(),
        clear: jest.fn()
      },
      writable: true
    });
    
    // Mock console.warn to avoid noise in tests
    global.console.warn = jest.fn();
    
    timer = new FrenchPressTimer();
  });

  afterEach(() => {
    if (timer.timerInterval) {
      clearInterval(timer.timerInterval);
    }
  });

  describe('Settings Persistence', () => {
    test('should save settings to localStorage', () => {
      timer.state.settings.steepTime = 300;
      timer.state.settings.brewTime = 600;
      
      timer.saveSettingsToStorage();
      
      expect(global.localStorage.setItem).toHaveBeenCalledWith(
        'frenchPressSettings',
        JSON.stringify({
          steepTime: 300,
          brewTime: 600,
          audioEnabled: true,
          audioVolume: 0.5
        })
      );
    });

    test('should handle localStorage save errors gracefully', () => {
      global.localStorage.setItem.mockImplementationOnce(() => {
        throw new Error('localStorage full');
      });
      
      expect(() => timer.saveSettingsToStorage()).not.toThrow();
      expect(global.console.warn).toHaveBeenCalledWith(
        'Could not save settings to localStorage:',
        expect.any(Error)
      );
    });

    test('should load settings from localStorage', () => {
      const savedSettings = {
        steepTime: 180,
        brewTime: 360,
        audioEnabled: true,
        audioVolume: 0.5
      };
      global.localStorage.getItem.mockReturnValueOnce(JSON.stringify(savedSettings));
      
      const newTimer = new FrenchPressTimer();
      
      expect(newTimer.state.settings.steepTime).toBe(180);
      expect(newTimer.state.settings.brewTime).toBe(360);
      expect(global.localStorage.getItem).toHaveBeenCalledWith('frenchPressSettings');
    });

    test('should handle malformed localStorage data', () => {
      global.localStorage.getItem.mockReturnValueOnce('invalid json');
      
      expect(() => new FrenchPressTimer()).not.toThrow();
      expect(global.console.warn).toHaveBeenCalledWith(
        'Could not load settings from localStorage:',
        expect.any(Error)
      );
      
      const newTimer = new FrenchPressTimer();
      expect(newTimer.state.settings.steepTime).toBe(240); // default
      expect(newTimer.state.settings.brewTime).toBe(480); // default
    });
  });

  describe('Settings Validation', () => {
    beforeEach(() => {
      // Mock alert to avoid actual browser dialogs
      global.alert = jest.fn();
      
      // Store original settings for validation tests
      timer.originalSteepTime = timer.state.settings.steepTime;
      timer.originalBrewTime = timer.state.settings.brewTime;
    });

    test('should save valid settings', () => {
      timer.firstTimerMinutesInput.value = '5';
      timer.firstTimerSecondsInput.value = '30';
      timer.secondTimerMinutesInput.value = '10';
      timer.secondTimerSecondsInput.value = '15';
      
      jest.spyOn(timer, 'saveSettingsToStorage').mockImplementation(() => {});
      jest.spyOn(timer, 'closeSettings').mockImplementation(() => {});
      
      timer.saveSettings();
      
      expect(timer.state.settings.steepTime).toBe(330); // 5:30
      expect(timer.state.settings.brewTime).toBe(615); // 10:15
      expect(timer.saveSettingsToStorage).toHaveBeenCalled();
      expect(timer.closeSettings).toHaveBeenCalled();
    });

    test('should reject invalid steep time (too low)', () => {
      timer.firstTimerMinutesInput.value = '0';
      timer.firstTimerSecondsInput.value = '0';
      timer.secondTimerMinutesInput.value = '8';
      timer.secondTimerSecondsInput.value = '0';
      
      timer.saveSettings();
      
      expect(alert).toHaveBeenCalledWith('Please enter valid times. Each timer must be between 1 second and 30 minutes.');
      expect(timer.state.settings.steepTime).toBe(timer.originalSteepTime); // unchanged
    });

    test('should reject invalid steep time (too high)', () => {
      timer.firstTimerMinutesInput.value = '31';
      timer.firstTimerSecondsInput.value = '0';
      timer.secondTimerMinutesInput.value = '8';
      timer.secondTimerSecondsInput.value = '0';
      
      timer.saveSettings();
      
      expect(alert).toHaveBeenCalledWith('Please enter valid times. Each timer must be between 1 second and 30 minutes.');
      expect(timer.state.settings.steepTime).toBe(timer.originalSteepTime); // unchanged
    });

    test('should reject invalid brew time (too low)', () => {
      timer.firstTimerMinutesInput.value = '4';
      timer.firstTimerSecondsInput.value = '0';
      timer.secondTimerMinutesInput.value = '0';
      timer.secondTimerSecondsInput.value = '0';
      
      timer.saveSettings();
      
      expect(alert).toHaveBeenCalledWith('Please enter valid times. Each timer must be between 1 second and 30 minutes.');
      expect(timer.state.settings.brewTime).toBe(timer.originalBrewTime); // unchanged
    });

    test('should reject invalid brew time (too high)', () => {
      timer.firstTimerMinutesInput.value = '4';
      timer.firstTimerSecondsInput.value = '0';
      timer.secondTimerMinutesInput.value = '31';
      timer.secondTimerSecondsInput.value = '0';
      
      timer.saveSettings();
      
      expect(alert).toHaveBeenCalledWith('Please enter valid times. Each timer must be between 1 second and 30 minutes.');
      expect(timer.state.settings.brewTime).toBe(timer.originalBrewTime); // unchanged
    });

    test('should handle non-numeric input', () => {
      timer.firstTimerMinutesInput.value = 'abc';
      timer.firstTimerSecondsInput.value = '30';
      timer.secondTimerMinutesInput.value = '8';
      timer.secondTimerSecondsInput.value = '0';
      
      timer.saveSettings();
      
      expect(alert).toHaveBeenCalledWith('Please enter valid times. Each timer must be between 1 second and 30 minutes.');
    });
  });

  describe('Settings UI', () => {
    test('should update settings display inputs', () => {
      timer.state.settings.steepTime = 330; // 5 minutes 30 seconds
      timer.state.settings.brewTime = 615; // 10 minutes 15 seconds
      
      timer.updateSettingsDisplay();
      
      expect(timer.firstTimerMinutesInput.value).toBe('5');
      expect(timer.firstTimerSecondsInput.value).toBe('30');
      expect(timer.secondTimerMinutesInput.value).toBe('10');
      expect(timer.secondTimerSecondsInput.value).toBe('15');
    });

    test('should reset to default settings', () => {
      timer.state.settings.steepTime = 300;
      timer.state.settings.brewTime = 600;
      
      jest.spyOn(timer, 'updateSettingsDisplay').mockImplementation(() => {});
      jest.spyOn(timer, 'saveSettingsToStorage').mockImplementation(() => {});
      jest.spyOn(timer, 'updateDisplay').mockImplementation(() => {});
      
      timer.resetToDefaults();
      
      expect(timer.state.settings.steepTime).toBe(240); // 4 minutes
      expect(timer.state.settings.brewTime).toBe(480); // 8 minutes
      expect(timer.updateSettingsDisplay).toHaveBeenCalled();
      expect(timer.saveSettingsToStorage).toHaveBeenCalled();
    });

    test('should update display when resetting defaults in idle state', () => {
      timer.state.currentStage = 'idle';
      
      jest.spyOn(timer, 'updateDisplay').mockImplementation(() => {});
      jest.spyOn(timer, 'updateSettingsDisplay').mockImplementation(() => {});
      jest.spyOn(timer, 'saveSettingsToStorage').mockImplementation(() => {});
      
      timer.resetToDefaults();
      
      expect(timer.updateDisplay).toHaveBeenCalled();
    });

    test('should not update main display when resetting defaults in active state', () => {
      timer.state.currentStage = 'steeping';
      
      jest.spyOn(timer, 'updateDisplay').mockImplementation(() => {});
      jest.spyOn(timer, 'updateSettingsDisplay').mockImplementation(() => {});
      jest.spyOn(timer, 'saveSettingsToStorage').mockImplementation(() => {});
      
      timer.resetToDefaults();
      
      expect(timer.updateDisplay).not.toHaveBeenCalled();
    });

    test('should update display when saving settings in idle state', () => {
      timer.state.currentStage = 'idle';
      timer.firstTimerMinutesInput.value = '5';
      timer.firstTimerSecondsInput.value = '0';
      timer.secondTimerMinutesInput.value = '10';
      timer.secondTimerSecondsInput.value = '0';
      
      jest.spyOn(timer, 'saveSettingsToStorage').mockImplementation(() => {});
      jest.spyOn(timer, 'closeSettings').mockImplementation(() => {});
      jest.spyOn(timer, 'updateDisplay').mockImplementation(() => {});
      
      timer.saveSettings();
      
      expect(timer.updateDisplay).toHaveBeenCalled();
    });
  });

  describe('Settings Modal', () => {
    test('should open settings modal', () => {
      jest.spyOn(timer, 'updateSettingsDisplay').mockImplementation(() => {});
      
      timer.openSettings();
      
      expect(timer.updateSettingsDisplay).toHaveBeenCalled();
      expect(timer.settingsModal.style.display).toBe('flex');
    });

    test('should close settings modal', () => {
      timer.settingsModal.style.display = 'flex';
      
      timer.closeSettings();
      
      expect(timer.settingsModal.style.display).toBe('none');
    });
  });
});