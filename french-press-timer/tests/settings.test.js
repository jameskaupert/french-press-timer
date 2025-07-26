const FrenchPressTimer = require('../script.js');

describe.skip('FrenchPressTimer Settings', () => {
  let timer;

  // Set up fresh localStorage mocks before each test
  beforeEach(() => {
    // Clear any existing mocks
    jest.clearAllMocks();
    
    // Mock localStorage directly on global object
    const mockLocalStorage = {
      getItem: jest.fn(() => null),
      setItem: jest.fn(),
      removeItem: jest.fn(),
      clear: jest.fn()
    };
    
    Object.defineProperty(global, 'localStorage', {
      value: mockLocalStorage,
      writable: true
    });
  });
  
  // Helper function to create timer after localStorage is set up for specific test
  const createTimer = () => {
    timer = new FrenchPressTimer();
    return timer;
  };

  afterEach(() => {
    if (timer && timer.timerInterval) {
      clearInterval(timer.timerInterval);
    }
  });

  describe('Settings Persistence', () => {
    test('should save settings to localStorage', () => {
      createTimer();
      
      timer.state.settings.steepTime = 300;
      timer.state.settings.brewTime = 600;
      timer.settings.audioEnabled = false;
      timer.settings.audioVolume = 0.8;
      
      timer.saveSettingsToStorage();
      
      expect(global.localStorage.setItem).toHaveBeenCalledWith(
        'frenchPressSettings',
        JSON.stringify({
          steepTime: 300,
          brewTime: 600,
          audioEnabled: false,
          audioVolume: 0.8
        })
      );
    });

    test('should handle localStorage save errors gracefully', () => {
      global.localStorage.setItem.mockImplementationOnce(() => {
        throw new Error('localStorage full');
      });
      
      createTimer();
      
      expect(() => timer.saveSettingsToStorage()).not.toThrow();
      expect(console.warn).toHaveBeenCalledWith(
        'Could not save settings to localStorage:',
        expect.any(Error)
      );
    });

    test('should load settings from localStorage', () => {
      const savedSettings = {
        steepTime: 180,
        brewTime: 360,
        audioEnabled: false,
        audioVolume: 0.3
      };
      global.localStorage.getItem.mockReturnValueOnce(JSON.stringify(savedSettings));
      
      const newTimer = createTimer();
      
      expect(newTimer.state.settings.steepTime).toBe(180);
      expect(newTimer.state.settings.brewTime).toBe(360);
      expect(newTimer.settings.audioEnabled).toBe(false);
      expect(newTimer.settings.audioVolume).toBe(0.3);
    });

    test('should handle malformed localStorage data', () => {
      global.localStorage.getItem.mockReturnValueOnce('invalid json');
      
      expect(() => new FrenchPressTimer()).not.toThrow();
      expect(console.warn).toHaveBeenCalledWith(
        'Could not load settings from localStorage:',
        expect.any(Error)
      );
      
      const newTimer = new FrenchPressTimer();
      expect(newTimer.state.settings.steepTime).toBe(240); // default
      expect(newTimer.state.settings.brewTime).toBe(480); // default
      expect(newTimer.settings.audioEnabled).toBe(true); // default
      expect(newTimer.settings.audioVolume).toBe(0.5); // default
    });

    test('should handle partial localStorage data', () => {
      const partialSettings = {
        steepTime: 300
        // Missing brewTime, audioEnabled, audioVolume
      };
      global.localStorage.getItem.mockReturnValueOnce(JSON.stringify(partialSettings));
      
      const newTimer = new FrenchPressTimer();
      
      expect(newTimer.state.settings.steepTime).toBe(300); // loaded
      expect(newTimer.state.settings.brewTime).toBe(480); // default fallback
      expect(newTimer.settings.audioEnabled).toBe(true); // default fallback
      expect(newTimer.settings.audioVolume).toBe(0.5); // default fallback
    });

    test('should handle empty localStorage', () => {
      global.localStorage.getItem.mockReturnValueOnce(null);
      
      const newTimer = new FrenchPressTimer();
      
      expect(newTimer.state.settings.steepTime).toBe(240); // default
      expect(newTimer.state.settings.brewTime).toBe(480); // default
      expect(newTimer.settings.audioEnabled).toBe(true); // default
      expect(newTimer.settings.audioVolume).toBe(0.5); // default
    });

    test('should persist settings end-to-end through saveSettings workflow', () => {
      // Set up form inputs
      timer.firstTimerInput.value = '6';
      timer.secondTimerInput.value = '12';
      timer.audioEnabledInput.checked = false;
      timer.audioVolumeInput.value = '0.7';
      
      // Save settings (this should trigger persistence)
      timer.saveSettings();
      
      // Verify localStorage was called with complete settings
      expect(global.localStorage.setItem).toHaveBeenCalledWith(
        'frenchPressSettings',
        JSON.stringify({
          steepTime: 360, // 6 minutes
          brewTime: 720,  // 12 minutes
          audioEnabled: false,
          audioVolume: 0.7
        })
      );
      
      // Verify internal state was updated
      expect(timer.state.settings.steepTime).toBe(360);
      expect(timer.state.settings.brewTime).toBe(720);
      expect(timer.settings.audioEnabled).toBe(false);
      expect(timer.settings.audioVolume).toBe(0.7);
    });
  });

  describe('Settings Validation', () => {
    beforeEach(() => {
      // Mock alert to avoid actual browser dialogs
      global.alert = jest.fn();
      
      // Reset timer to default state for validation tests
      timer.state.settings.steepTime = 240; // 4 minutes default
      timer.state.settings.brewTime = 480; // 8 minutes default
    });

    test('should save valid settings', () => {
      timer.firstTimerInput.value = '5:00';
      timer.secondTimerInput.value = '10:00';
      
      jest.spyOn(timer, 'saveSettingsToStorage').mockImplementation(() => {});
      jest.spyOn(timer, 'closeSettings').mockImplementation(() => {});
      
      timer.saveSettings();
      
      expect(timer.state.settings.steepTime).toBe(300); // 5 minutes
      expect(timer.state.settings.brewTime).toBe(600); // 10 minutes
      expect(timer.saveSettingsToStorage).toHaveBeenCalled();
      expect(timer.closeSettings).toHaveBeenCalled();
    });

    test('should reject invalid steep time (too low)', () => {
      timer.firstTimerInput.value = '0:00';
      timer.secondTimerInput.value = '8:00';
      
      timer.saveSettings();
      
      expect(alert).toHaveBeenCalledWith('Please enter valid times between 0:01 and 30:00 in MM:SS format.');
      expect(timer.state.settings.steepTime).toBe(240); // unchanged
    });

    test('should reject invalid steep time (too high)', () => {
      timer.firstTimerInput.value = '31:00';
      timer.secondTimerInput.value = '8:00';
      
      timer.saveSettings();
      
      expect(alert).toHaveBeenCalledWith('Please enter valid times between 0:01 and 30:00 in MM:SS format.');
      expect(timer.state.settings.steepTime).toBe(240); // unchanged
    });

    test('should reject invalid brew time (too low)', () => {
      timer.firstTimerInput.value = '4:00';
      timer.secondTimerInput.value = '0:00';
      
      timer.saveSettings();
      
      expect(alert).toHaveBeenCalledWith('Please enter valid times between 0:01 and 30:00 in MM:SS format.');
      expect(timer.state.settings.brewTime).toBe(480); // unchanged
    });

    test('should reject invalid brew time (too high)', () => {
      timer.firstTimerInput.value = '4:00';
      timer.secondTimerInput.value = '31:00';
      
      timer.saveSettings();
      
      expect(alert).toHaveBeenCalledWith('Please enter valid times between 0:01 and 30:00 in MM:SS format.');
      expect(timer.state.settings.brewTime).toBe(480); // unchanged
    });

    test('should handle non-numeric input', () => {
      timer.firstTimerInput.value = 'abc';
      timer.secondTimerInput.value = '8:00';
      
      timer.saveSettings();
      
      expect(alert).toHaveBeenCalledWith('Please enter valid times between 0:01 and 30:00 in MM:SS format.');
      expect(timer.state.settings.steepTime).toBe(240); // unchanged
      expect(timer.state.settings.brewTime).toBe(480); // unchanged
    });

    test('should handle empty input values', () => {
      timer.firstTimerInput.value = '';
      timer.secondTimerInput.value = '8:00';
      
      timer.saveSettings();
      
      expect(alert).toHaveBeenCalledWith('Please enter valid times between 0:01 and 30:00 in MM:SS format.');
      expect(timer.state.settings.steepTime).toBe(240); // unchanged
    });

    test('should handle decimal input values', () => {
      timer.firstTimerInput.value = '4.5';
      timer.secondTimerInput.value = '8:00';
      
      timer.saveSettings();
      
      expect(timer.state.settings.steepTime).toBe(240); // 4 minutes (parseInt floors)
      expect(timer.state.settings.brewTime).toBe(480); // 8 minutes
    });

    test('should handle negative input values', () => {
      timer.firstTimerInput.value = '-5';
      timer.secondTimerInput.value = '8:00';
      
      timer.saveSettings();
      
      expect(alert).toHaveBeenCalledWith('Please enter valid times between 0:01 and 30:00 in MM:SS format.');
      expect(timer.state.settings.steepTime).toBe(240); // unchanged
    });

    test('should handle boundary values correctly', () => {
      // Test minimum valid values
      timer.firstTimerInput.value = '1';
      timer.secondTimerInput.value = '1';
      
      timer.saveSettings();
      
      expect(timer.state.settings.steepTime).toBe(60); // 1 minute
      expect(timer.state.settings.brewTime).toBe(60); // 1 minute
      expect(alert).not.toHaveBeenCalled();
      
      // Test maximum valid values
      timer.firstTimerInput.value = '30';
      timer.secondTimerInput.value = '30';
      
      timer.saveSettings();
      
      expect(timer.state.settings.steepTime).toBe(1800); // 30 minutes
      expect(timer.state.settings.brewTime).toBe(1800); // 30 minutes
      expect(alert).not.toHaveBeenCalled();
    });

    test.skip('should not save settings when localStorage fails', () => {
      global.localStorage.setItem.mockImplementationOnce(() => {
        throw new Error('localStorage error');
      });
      
      timer.firstTimerInput.value = '5';
      timer.secondTimerInput.value = '10';
      
      // Should still update internal state even if localStorage fails
      timer.saveSettings();
      
      expect(timer.state.settings.steepTime).toBe(300);
      expect(timer.state.settings.brewTime).toBe(600);
      expect(console.warn).toHaveBeenCalledWith(
        'Could not save settings to localStorage:',
        expect.any(Error)
      );
    });
  });

  describe('Settings UI', () => {
    test('should update settings display inputs', () => {
      timer.state.settings.steepTime = 300; // 5 minutes
      timer.state.settings.brewTime = 600; // 10 minutes
      
      timer.updateSettingsDisplay();
      
      expect(timer.firstTimerInput.value).toBe('5');
      expect(timer.secondTimerInput.value).toBe('10');
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
      timer.firstTimerInput.value = '5';
      timer.secondTimerInput.value = '10';
      
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

    test.skip('should close settings modal', () => {
      timer.settingsModal.style.display = 'flex';
      
      timer.closeSettings();
      
      expect(timer.settingsModal.style.display).toBe('none');
    });
  });
});