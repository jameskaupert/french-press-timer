/**
 * Visual alerts and stage indicators tests for Issue #4
 * Tests enhanced visual feedback functionality
 */

const FrenchPressTimer = require('../script.js');

describe('FrenchPressTimer Visual Alerts', () => {
  let timer;

  beforeEach(() => {
    timer = new FrenchPressTimer();
  });

  afterEach(() => {
    if (timer.timerInterval) {
      clearInterval(timer.timerInterval);
    }
  });

  describe('Stage Indicators', () => {
    test('should apply correct CSS class for idle stage', () => {
      timer.state.currentStage = 'idle';
      timer.updateStageDisplay();
      
      const stageIndicator = document.querySelector('.stage-indicator');
      expect(stageIndicator.classList.contains('stage-idle')).toBe(true);
    });

    test('should apply correct CSS class for steeping stage', () => {
      timer.state.currentStage = 'steeping';
      timer.updateStageDisplay();
      
      const stageIndicator = document.querySelector('.stage-indicator');
      expect(stageIndicator.classList.contains('stage-steeping')).toBe(true);
    });

    test('should apply correct CSS class for stir stage', () => {
      timer.state.currentStage = 'stir';
      timer.updateStageDisplay();
      
      const stageIndicator = document.querySelector('.stage-indicator');
      expect(stageIndicator.classList.contains('stage-stir')).toBe(true);
    });

    test('should apply correct CSS class for brewing stage', () => {
      timer.state.currentStage = 'brewing';
      timer.updateStageDisplay();
      
      const stageIndicator = document.querySelector('.stage-indicator');
      expect(stageIndicator.classList.contains('stage-brewing')).toBe(true);
    });

    test('should apply correct CSS class for complete stage', () => {
      timer.state.currentStage = 'complete';
      timer.updateStageDisplay();
      
      const stageIndicator = document.querySelector('.stage-indicator');
      expect(stageIndicator.classList.contains('stage-complete')).toBe(true);
    });

    test('should remove previous stage classes when changing stages', () => {
      timer.state.currentStage = 'steeping';
      timer.updateStageDisplay();
      
      timer.state.currentStage = 'brewing';
      timer.updateStageDisplay();
      
      const stageIndicator = document.querySelector('.stage-indicator');
      expect(stageIndicator.classList.contains('stage-steeping')).toBe(false);
      expect(stageIndicator.classList.contains('stage-brewing')).toBe(true);
    });
  });

  describe('Urgency Indicators', () => {
    test('should apply low urgency when more than 25% time remaining', () => {
      timer.state.currentStage = 'steeping';
      timer.state.totalTime = 100;
      timer.state.timeRemaining = 50; // 50% remaining
      
      timer.updateUrgencyIndicators();
      
      const timerDisplay = document.querySelector('.timer-display');
      expect(timerDisplay.classList.contains('urgency-low')).toBe(true);
    });

    test('should apply medium urgency when 10-25% time remaining', () => {
      timer.state.currentStage = 'steeping';
      timer.state.totalTime = 100;
      timer.state.timeRemaining = 20; // 20% remaining
      
      timer.updateUrgencyIndicators();
      
      const timerDisplay = document.querySelector('.timer-display');
      expect(timerDisplay.classList.contains('urgency-medium')).toBe(true);
    });

    test('should apply high urgency when less than 10% time remaining', () => {
      timer.state.currentStage = 'brewing';
      timer.state.totalTime = 100;
      timer.state.timeRemaining = 5; // 5% remaining
      
      timer.updateUrgencyIndicators();
      
      const timerDisplay = document.querySelector('.timer-display');
      expect(timerDisplay.classList.contains('urgency-high')).toBe(true);
    });

    test('should only apply urgency during active timer stages', () => {
      timer.state.currentStage = 'idle';
      timer.state.totalTime = 100;
      timer.state.timeRemaining = 5;
      
      timer.updateUrgencyIndicators();
      
      const timerDisplay = document.querySelector('.timer-display');
      expect(timerDisplay.classList.contains('urgency-high')).toBe(false);
      expect(timerDisplay.classList.contains('urgency-low')).toBe(true);
    });

    test('should remove previous urgency classes when updating', () => {
      const timerDisplay = document.querySelector('.timer-display');
      timerDisplay.classList.add('urgency-high');
      
      timer.state.currentStage = 'steeping';
      timer.state.totalTime = 100;
      timer.state.timeRemaining = 50;
      
      timer.updateUrgencyIndicators();
      
      expect(timerDisplay.classList.contains('urgency-high')).toBe(false);
      expect(timerDisplay.classList.contains('urgency-low')).toBe(true);
    });
  });

  describe('Visual Alert Effects', () => {
    test('should set correct flash color for steeping complete', () => {
      jest.spyOn(timer, 'flashTimerCircle').mockImplementation(() => {});
      
      timer.playVisualAlert('steeping_complete');
      
      expect(document.body.style.getPropertyValue('--flash-color')).toBe('#DCA561');
      expect(document.body.classList.contains('flash-alert')).toBe(true);
    });

    test('should set correct flash color for stir reminder', () => {
      jest.spyOn(timer, 'flashTimerCircle').mockImplementation(() => {});
      
      timer.playVisualAlert('stir_reminder');
      
      expect(document.body.style.getPropertyValue('--flash-color')).toBe('#7E9CD8');
      expect(document.body.classList.contains('flash-alert')).toBe(true);
    });

    test('should set correct flash color for brewing complete', () => {
      jest.spyOn(timer, 'flashTimerCircle').mockImplementation(() => {});
      
      timer.playVisualAlert('brewing_complete');
      
      expect(document.body.style.getPropertyValue('--flash-color')).toBe('#76946A');
      expect(document.body.classList.contains('flash-alert')).toBe(true);
    });

    test('should use default color for unknown alert types', () => {
      jest.spyOn(timer, 'flashTimerCircle').mockImplementation(() => {});
      
      timer.playVisualAlert('unknown_type');
      
      expect(document.body.style.getPropertyValue('--flash-color')).toBe('#76946A');
    });

    test('should call flashTimerCircle with correct color', () => {
      const flashSpy = jest.spyOn(timer, 'flashTimerCircle').mockImplementation(() => {});
      
      timer.playVisualAlert('stir_reminder');
      
      expect(flashSpy).toHaveBeenCalledWith('#7E9CD8');
    });
  });

  describe('Timer Circle Flash Effect', () => {
    test('should apply stroke width and opacity changes to progress circle', () => {
      const progressCircle = document.getElementById('progressCircle');
      const color = '#DCA561';
      
      timer.flashTimerCircle(color);
      
      expect(progressCircle.style.strokeWidth).toBe('12');
      expect(progressCircle.style.opacity).toBe('0.8');
      expect(progressCircle.style.transition).toBe('stroke-width 0.3s ease, opacity 0.3s ease');
    });

    test('should restore original stroke width after animation', (done) => {
      const progressCircle = document.getElementById('progressCircle');
      progressCircle.style.strokeWidth = '8';
      
      timer.flashTimerCircle('#DCA561');
      
      setTimeout(() => {
        expect(progressCircle.style.strokeWidth).toBe('8');
        expect(progressCircle.style.opacity).toBe('1');
        done();
      }, 700);
    });
  });

  describe('Integration with playNotification', () => {
    test('should call both audio and visual alerts', () => {
      const audioSpy = jest.spyOn(timer, 'playAudioNotification').mockImplementation(() => {});
      const visualSpy = jest.spyOn(timer, 'playVisualAlert').mockImplementation(() => {});
      
      timer.playNotification('steeping_complete');
      
      expect(audioSpy).toHaveBeenCalledWith('steeping_complete');
      expect(visualSpy).toHaveBeenCalledWith('steeping_complete');
    });
  });
});