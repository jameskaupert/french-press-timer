const FrenchPressTimer = require('../script.js');

describe.skip('FrenchPressTimer Settings [Issues #7 & #8 - Settings & localStorage]', () => {
  let timer;

  beforeEach(() => {
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
      
      expect(localStorage.setItem).toHaveBeenCalledWith(
        'frenchPressSettings',
        JSON.stringify({
          steepTime: 300,
          brewTime: 600
        })
      );
    });

    test('should handle localStorage save errors gracefully', () => {
      localStorage.setItem.mockImplementation(() => {
        throw new Error('localStorage full');
      });
      
      expect(() => timer.saveSettingsToStorage()).not.toThrow();
      expect(console.warn).toHaveBeenCalledWith(
        'Could not save settings to localStorage:',
        expect.any(Error)
      );
    });

    test('should load settings from localStorage', () => {
      const savedSettings = {
        steepTime: 180,
        brewTime: 360
      };
      localStorage.getItem.mockReturnValue(JSON.stringify(savedSettings));
      
      const newTimer = new FrenchPressTimer();
      
      expect(newTimer.state.settings.steepTime).toBe(180);
      expect(newTimer.state.settings.brewTime).toBe(360);
    });

    test('should handle malformed localStorage data', () => {
      localStorage.getItem.mockReturnValue('invalid json');
      
      expect(() => new FrenchPressTimer()).not.toThrow();
      
      const newTimer = new FrenchPressTimer();
      expect(newTimer.state.settings.steepTime).toBe(240); // default
      expect(newTimer.state.settings.brewTime).toBe(480); // default
    });
  });

  describe('Settings Validation', () => {
    beforeEach(() => {
      // Mock alert to avoid actual browser dialogs
      global.alert = jest.fn();
      
      // Set up input values
      timer.firstTimerInput.value = '5';
      timer.secondTimerInput.value = '10';
    });

    test('should save valid settings', () => {
      jest.spyOn(timer, 'saveSettingsToStorage').mockImplementation(() => {});
      jest.spyOn(timer, 'closeSettings').mockImplementation(() => {});
      
      timer.saveSettings();
      
      expect(timer.state.settings.steepTime).toBe(300); // 5 minutes
      expect(timer.state.settings.brewTime).toBe(600); // 10 minutes
      expect(timer.saveSettingsToStorage).toHaveBeenCalled();
      expect(timer.closeSettings).toHaveBeenCalled();
    });

    test('should reject invalid steep time (too low)', () => {
      timer.firstTimerInput.value = '0';
      timer.secondTimerInput.value = '8';
      
      timer.saveSettings();
      
      expect(alert).toHaveBeenCalledWith('Please enter valid times between 1 and 30 minutes.');
      expect(timer.state.settings.steepTime).toBe(240); // unchanged
    });

    test('should reject invalid steep time (too high)', () => {
      timer.firstTimerInput.value = '31';
      timer.secondTimerInput.value = '8';
      
      timer.saveSettings();
      
      expect(alert).toHaveBeenCalledWith('Please enter valid times between 1 and 30 minutes.');
      expect(timer.state.settings.steepTime).toBe(240); // unchanged
    });

    test('should reject invalid brew time (too low)', () => {
      timer.firstTimerInput.value = '4';
      timer.secondTimerInput.value = '0';
      
      timer.saveSettings();
      
      expect(alert).toHaveBeenCalledWith('Please enter valid times between 1 and 30 minutes.');
      expect(timer.state.settings.brewTime).toBe(480); // unchanged
    });

    test('should reject invalid brew time (too high)', () => {
      timer.firstTimerInput.value = '4';
      timer.secondTimerInput.value = '31';
      
      timer.saveSettings();
      
      expect(alert).toHaveBeenCalledWith('Please enter valid times between 1 and 30 minutes.');
      expect(timer.state.settings.brewTime).toBe(480); // unchanged
    });

    test('should handle non-numeric input', () => {
      timer.firstTimerInput.value = 'abc';
      timer.secondTimerInput.value = '8';
      
      timer.saveSettings();
      
      expect(alert).toHaveBeenCalledWith('Please enter valid times between 1 and 30 minutes.');
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

    test('should close settings modal', () => {
      timer.settingsModal.style.display = 'flex';
      
      timer.closeSettings();
      
      expect(timer.settingsModal.style.display).toBe('none');
    });
  });
});