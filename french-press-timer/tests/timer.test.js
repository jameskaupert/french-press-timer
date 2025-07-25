const FrenchPressTimer = require('../script.js');

describe('FrenchPressTimer', () => {
  let timer;

  beforeEach(() => {
    timer = new FrenchPressTimer();
  });

  afterEach(() => {
    if (timer.timerInterval) {
      clearInterval(timer.timerInterval);
    }
  });

  describe('Initialization', () => {
    test('should initialize with correct default state', () => {
      expect(timer.state.currentStage).toBe('idle');
      expect(timer.state.timeRemaining).toBe(0);
      expect(timer.state.totalTime).toBe(0);
      expect(timer.state.isRunning).toBe(false);
      expect(timer.state.settings.steepTime).toBe(240); // 4 minutes in seconds
      expect(timer.state.settings.brewTime).toBe(480); // 8 minutes in seconds
    });

    test('should initialize DOM elements', () => {
      expect(timer.timeDisplay).toBeTruthy();
      expect(timer.stageTitle).toBeTruthy();
      expect(timer.stageDescription).toBeTruthy();
      expect(timer.startBtn).toBeTruthy();
      expect(timer.resetBtn).toBeTruthy();
      expect(timer.continueBtn).toBeTruthy();
    });

    test.skip('should load settings from localStorage if available [Issue #8 - localStorage persistence]', () => {
      const mockSettings = {
        steepTime: 300, // 5 minutes
        brewTime: 600   // 10 minutes
      };
      localStorage.getItem.mockReturnValue(JSON.stringify(mockSettings));
      
      const timerWithSettings = new FrenchPressTimer();
      
      expect(timerWithSettings.state.settings.steepTime).toBe(300);
      expect(timerWithSettings.state.settings.brewTime).toBe(600);
    });

    test.skip('should handle localStorage errors gracefully [Issue #8 - localStorage persistence]', () => {
      localStorage.getItem.mockImplementation(() => {
        throw new Error('localStorage error');
      });
      
      expect(() => new FrenchPressTimer()).not.toThrow();
      
      const timerWithError = new FrenchPressTimer();
      expect(timerWithError.state.settings.steepTime).toBe(240); // default
      expect(timerWithError.state.settings.brewTime).toBe(480); // default
    });
  });

  describe.skip('Timer State Management [Issue #3 - Core timer logic]', () => {
    test('should start steeping timer correctly', () => {
      timer.startTimer();
      
      expect(timer.state.currentStage).toBe('steeping');
      expect(timer.state.timeRemaining).toBe(240);
      expect(timer.state.totalTime).toBe(240);
      expect(timer.state.isRunning).toBe(true);
      expect(timer.timerInterval).toBeTruthy();
    });

    test('should reset timer to idle state', () => {
      timer.startTimer();
      timer.resetTimer();
      
      expect(timer.state.currentStage).toBe('idle');
      expect(timer.state.timeRemaining).toBe(0);
      expect(timer.state.totalTime).toBe(0);
      expect(timer.state.isRunning).toBe(false);
      expect(timer.timerInterval).toBe(null);
    });

    test('should transition from steeping to stir stage', () => {
      jest.spyOn(timer, 'playNotification').mockImplementation(() => {});
      
      timer.startTimer();
      timer.state.timeRemaining = 0;
      timer.handleTimerComplete();
      
      expect(timer.state.currentStage).toBe('stir');
      expect(timer.state.isRunning).toBe(false);
    });

    test('should continue to final brewing stage', () => {
      timer.state.currentStage = 'stir';
      timer.continueToFinalBrewing();
      
      expect(timer.state.currentStage).toBe('brewing');
      expect(timer.state.timeRemaining).toBe(480);
      expect(timer.state.totalTime).toBe(480);
      expect(timer.state.isRunning).toBe(true);
    });

    test('should complete brewing and reach final stage', () => {
      jest.spyOn(timer, 'playNotification').mockImplementation(() => {});
      
      timer.state.currentStage = 'brewing';
      timer.state.timeRemaining = 0;
      timer.handleTimerComplete();
      
      expect(timer.state.currentStage).toBe('complete');
      expect(timer.state.isRunning).toBe(false);
    });
  });

  describe.skip('Timer Countdown Logic [Issue #3 - Core timer logic]', () => {
    beforeEach(() => {
      jest.useFakeTimers();
      jest.spyOn(timer, 'updateDisplay').mockImplementation(() => {});
      jest.spyOn(timer, 'playNotification').mockImplementation(() => {});
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    test('should countdown correctly during steeping', () => {
      timer.startTimer();
      
      expect(timer.state.timeRemaining).toBe(240);
      
      jest.advanceTimersByTime(1000);
      expect(timer.state.timeRemaining).toBe(239);
      
      jest.advanceTimersByTime(5000);
      expect(timer.state.timeRemaining).toBe(234);
    });

    test('should handle timer completion correctly', () => {
      timer.startTimer();
      timer.state.timeRemaining = 1;
      
      jest.advanceTimersByTime(1000);
      
      expect(timer.state.timeRemaining).toBe(0);
      expect(timer.playNotification).toHaveBeenCalled();
      expect(timer.state.currentStage).toBe('stir');
    });

    test('should stop countdown when timer reaches zero', () => {
      timer.startTimer();
      
      // Fast forward to completion
      jest.advanceTimersByTime(240000);
      
      expect(timer.state.timeRemaining).toBe(0);
      expect(timer.state.isRunning).toBe(false);
    });
  });

  describe('Display Updates', () => {
    test('should show correct stage information for idle state', () => {
      timer.state.currentStage = 'idle';
      timer.updateDisplay();
      
      expect(timer.stageTitle.textContent).toBe('Ready to Start');
      expect(timer.stageDescription.textContent).toBe('Press start to begin brewing');
    });

    test.skip('should format time display correctly [Issue #4 - UI Design]', () => {
      timer.state.timeRemaining = 125; // 2:05
      timer.updateDisplay();
      
      expect(timer.timeDisplay.textContent).toBe('2:05');
    });

    test.skip('should format time display with leading zeros [Issue #4 - UI Design]', () => {
      timer.state.timeRemaining = 65; // 1:05
      timer.updateDisplay();
      
      expect(timer.timeDisplay.textContent).toBe('1:05');
    });

    test.skip('should show correct stage information for steeping [Issue #3 - Core timer logic]', () => {
      timer.state.currentStage = 'steeping';
      timer.updateDisplay();
      
      expect(timer.stageTitle.textContent).toBe('Steeping');
      expect(timer.stageDescription.textContent).toBe('Let the coffee steep...');
    });

    test.skip('should show correct stage information for stir reminder [Issue #3 - Core timer logic]', () => {
      timer.state.currentStage = 'stir';
      timer.updateDisplay();
      
      expect(timer.stageTitle.textContent).toBe('Stir Coffee');
      expect(timer.stageDescription.textContent).toBe('Give the coffee a gentle stir, then continue');
    });

    test.skip('should show correct stage information for brewing [Issue #3 - Core timer logic]', () => {
      timer.state.currentStage = 'brewing';
      timer.updateDisplay();
      
      expect(timer.stageTitle.textContent).toBe('Final Brewing');
      expect(timer.stageDescription.textContent).toBe('Almost ready...');
    });

    test.skip('should show correct stage information for complete [Issue #3 - Core timer logic]', () => {
      timer.state.currentStage = 'complete';
      timer.updateDisplay();
      
      expect(timer.stageTitle.textContent).toBe('Ready to Pour!');
      expect(timer.stageDescription.textContent).toBe('Your coffee is ready to enjoy');
    });
  });
});