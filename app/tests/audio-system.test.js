/**
 * Audio System Tests
 * Tests for synthesized audio notifications
 */

const FrenchPressTimer = require('../script.js');

describe('Synthesized Audio System', () => {
    let timer;
    let originalAudioContext;

    beforeEach(() => {
        // Mock AudioContext
        originalAudioContext = global.AudioContext;
        global.AudioContext = jest.fn().mockImplementation(() => ({
            state: 'running',
            currentTime: 0,
            resume: jest.fn().mockResolvedValue(undefined),
            createOscillator: jest.fn().mockReturnValue({
                connect: jest.fn(),
                frequency: { setValueAtTime: jest.fn() },
                type: 'sine',
                start: jest.fn(),
                stop: jest.fn()
            }),
            createGain: jest.fn().mockReturnValue({
                connect: jest.fn(),
                gain: {
                    setValueAtTime: jest.fn(),
                    linearRampToValueAtTime: jest.fn()
                }
            }),
            destination: {}
        }));

        timer = new FrenchPressTimer();
        timer.settings.audioEnabled = true;
        timer.settings.audioVolume = 0.7;
    });

    afterEach(() => {
        global.AudioContext = originalAudioContext;
        jest.clearAllMocks();
    });

    describe('Audio Context Creation', () => {
        test('should create AudioContext when playing audio', () => {
            timer.playAudioNotification('steeping_complete');
            
            expect(global.AudioContext).toHaveBeenCalled();
        });

        test('should resume suspended AudioContext', () => {
            const mockAudioContext = {
                state: 'suspended',
                currentTime: 0,
                resume: jest.fn().mockResolvedValue(undefined),
                createOscillator: jest.fn().mockReturnValue({
                    connect: jest.fn(),
                    frequency: { setValueAtTime: jest.fn() },
                    type: 'sine',
                    start: jest.fn(),
                    stop: jest.fn()
                }),
                createGain: jest.fn().mockReturnValue({
                    connect: jest.fn(),
                    gain: {
                        setValueAtTime: jest.fn(),
                        linearRampToValueAtTime: jest.fn()
                    }
                }),
                destination: {}
            };
            timer.audioContext = mockAudioContext;
            
            timer.playAudioNotification('steeping_complete');
            
            expect(mockAudioContext.resume).toHaveBeenCalled();
        });
    });

    describe('Audio Notification Types', () => {
        test('should play steeping complete notification', () => {
            const playBeepSequenceSpy = jest.spyOn(timer, 'playBeepSequence');
            
            timer.playAudioNotification('steeping_complete');
            
            expect(playBeepSequenceSpy).toHaveBeenCalledWith([800, 600], [0.3, 0.3], 200);
        });

        test('should play stir reminder notification', () => {
            const playBeepSequenceSpy = jest.spyOn(timer, 'playBeepSequence');
            
            timer.playAudioNotification('stir_reminder');
            
            expect(playBeepSequenceSpy).toHaveBeenCalledWith([400], [0.5], 0);
        });

        test('should play brewing complete arpeggio', () => {
            const playBeepSequenceSpy = jest.spyOn(timer, 'playBeepSequence');
            
            timer.playAudioNotification('brewing_complete');
            
            // C major arpeggio: C-E-G-C (1-3-5-1)
            expect(playBeepSequenceSpy).toHaveBeenCalledWith([523, 659, 784, 1047], [0.4, 0.4, 0.4, 0.6], 100);
        });

        test('should play default notification for unknown types', () => {
            const playBeepSequenceSpy = jest.spyOn(timer, 'playBeepSequence');
            
            timer.playAudioNotification('unknown_type');
            
            expect(playBeepSequenceSpy).toHaveBeenCalledWith([800], [0.3], 0);
        });
    });

    describe('Audio Settings Integration', () => {
        test('should respect audio enabled setting', () => {
            timer.settings.audioEnabled = false;
            const playBeepSequenceSpy = jest.spyOn(timer, 'playBeepSequence');
            
            timer.playAudioNotification('steeping_complete');
            
            expect(playBeepSequenceSpy).not.toHaveBeenCalled();
            expect(global.AudioContext).not.toHaveBeenCalled();
        });

        test('should use volume setting in beep generation', () => {
            timer.settings.audioVolume = 0.3;
            
            timer.playAudioNotification('steeping_complete');
            
            const contextInstance = global.AudioContext.mock.results[0].value;
            const gainNode = contextInstance.createGain.mock.results[0].value;
            
            // Volume should be applied via gain node
            expect(gainNode.gain.setValueAtTime).toHaveBeenCalledWith(0, expect.any(Number));
            expect(gainNode.gain.linearRampToValueAtTime).toHaveBeenCalledWith(0.3, expect.any(Number));
        });
    });

    describe('Error Handling', () => {
        test('should handle AudioContext creation errors gracefully', () => {
            global.AudioContext = jest.fn().mockImplementation(() => {
                throw new Error('AudioContext not supported');
            });
            
            // Should not throw error
            expect(() => timer.playAudioNotification('steeping_complete')).not.toThrow();
        });

        test('should continue timer functionality when audio fails', () => {
            global.AudioContext = jest.fn().mockImplementation(() => {
                throw new Error('Audio completely broken');
            });
            
            // Should not throw error and not break timer functionality
            expect(() => timer.playAudioNotification('steeping_complete')).not.toThrow();
            
            // Timer should still work
            timer.startTimer();
            expect(timer.state.currentStage).toBe('steeping');
        });
    });

    describe('Beep Generation', () => {
        test('should create oscillators for each frequency', () => {
            timer.playAudioNotification('brewing_complete');
            
            const contextInstance = global.AudioContext.mock.results[0].value;
            // Should create 4 oscillators for the arpeggio
            expect(contextInstance.createOscillator).toHaveBeenCalledTimes(4);
        });

        test('should create gain nodes for volume control', () => {
            timer.playAudioNotification('steeping_complete');
            
            const contextInstance = global.AudioContext.mock.results[0].value;
            // Should create 2 gain nodes for the two-beep sequence
            expect(contextInstance.createGain).toHaveBeenCalledTimes(2);
        });
    });
});