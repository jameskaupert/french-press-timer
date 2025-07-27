/**
 * Audio System Tests
 * Tests for Issue #15: Musical arpeggio audio system and iOS compatibility
 */

const FrenchPressTimer = require('../script.js');

describe('Issue #15: Musical Arpeggio Audio System', () => {
    let timer;
    let originalAudio;
    let originalAudioContext;

    beforeEach(() => {
        // Mock Audio constructor
        originalAudio = global.Audio;
        global.Audio = jest.fn().mockImplementation((src) => {
            const mockAudio = {
                src,
                volume: 0.5,
                preload: 'auto',
                play: jest.fn().mockResolvedValue(undefined),
                load: jest.fn(),
                cloneNode: jest.fn().mockReturnValue({
                    volume: 0.5,
                    play: jest.fn().mockResolvedValue(undefined)
                }),
                addEventListener: jest.fn((event, callback) => {
                    // Simulate successful load
                    if (event === 'canplaythrough') {
                        setTimeout(callback, 0);
                    }
                }),
                removeEventListener: jest.fn()
            };
            return mockAudio;
        });

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
        global.Audio = originalAudio;
        global.AudioContext = originalAudioContext;
        jest.clearAllMocks();
    });

    describe('Arpeggio Audio Files', () => {
        test('should attempt to play correct audio file for steeping complete', async () => {
            await timer.playAudioNotification('steeping_complete');
            
            expect(global.Audio).toHaveBeenCalledWith('./assets/audio/steeping-complete.wav');
        });

        test('should attempt to play correct audio file for stir reminder', async () => {
            await timer.playAudioNotification('stir_reminder');
            
            expect(global.Audio).toHaveBeenCalledWith('./assets/audio/stir-reminder.wav');
        });

        test('should attempt to play correct audio file for brewing complete', async () => {
            await timer.playAudioNotification('brewing_complete');
            
            expect(global.Audio).toHaveBeenCalledWith('./assets/audio/brewing-complete.wav');
        });

        test('should use default notification for unknown types', async () => {
            await timer.playAudioNotification('unknown_type');
            
            expect(global.Audio).toHaveBeenCalledWith('./assets/audio/default-notification.wav');
        });

        test('should set correct volume based on settings', async () => {
            await timer.playAudioNotification('steeping_complete');
            
            const audioInstance = global.Audio.mock.results[0].value;
            expect(audioInstance.volume).toBe(0.7);
        });
    });

    describe('Audio Caching', () => {
        test('should cache audio files after first play', async () => {
            // First play
            await timer.playAudioNotification('steeping_complete');
            expect(global.Audio).toHaveBeenCalledTimes(1);
            
            // Second play should use cache
            await timer.playAudioNotification('steeping_complete');
            expect(global.Audio).toHaveBeenCalledTimes(1); // Still only called once
            
            // Should call cloneNode on cached audio
            const audioInstance = global.Audio.mock.results[0].value;
            expect(audioInstance.cloneNode).toHaveBeenCalled();
        });

        test('should create separate cache entries for different audio types', async () => {
            await timer.playAudioNotification('steeping_complete');
            await timer.playAudioNotification('stir_reminder');
            
            expect(global.Audio).toHaveBeenCalledTimes(2);
            expect(global.Audio).toHaveBeenNthCalledWith(1, './assets/audio/steeping-complete.wav');
            expect(global.Audio).toHaveBeenNthCalledWith(2, './assets/audio/stir-reminder.wav');
        });
    });

    describe('iOS Compatibility', () => {
        test('should create AudioContext for iOS unlock', async () => {
            timer.audioContext = null;
            
            await timer.playAudioNotification('steeping_complete');
            
            expect(global.AudioContext).toHaveBeenCalled();
        });

        test('should resume suspended AudioContext', async () => {
            const mockAudioContext = {
                state: 'suspended',
                resume: jest.fn().mockResolvedValue(undefined)
            };
            timer.audioContext = mockAudioContext;
            
            await timer.playAudioNotification('steeping_complete');
            
            expect(mockAudioContext.resume).toHaveBeenCalled();
        });

        test('should handle audio play promise correctly', async () => {
            const mockPlay = jest.fn().mockResolvedValue(undefined);
            global.Audio = jest.fn().mockImplementation(() => ({
                volume: 0.5,
                preload: 'auto',
                play: mockPlay,
                load: jest.fn(),
                addEventListener: jest.fn((event, callback) => {
                    if (event === 'canplaythrough') {
                        setTimeout(callback, 0);
                    }
                })
            }));
            
            await timer.playAudioNotification('steeping_complete');
            
            expect(mockPlay).toHaveBeenCalled();
        });
    });

    describe('Fallback to Synthesized Audio', () => {
        test('should fall back to synthesized beeps when audio file fails', async () => {
            // Mock Audio constructor to throw error
            global.Audio = jest.fn().mockImplementation(() => {
                throw new Error('Audio file not found');
            });
            
            const synthesizedSpy = jest.spyOn(timer, 'playSynthesizedAudio');
            
            await timer.playAudioNotification('steeping_complete');
            
            expect(synthesizedSpy).toHaveBeenCalledWith('steeping_complete');
        });

        test('should create oscillators for synthesized fallback', async () => {
            // Force fallback by making Audio fail
            global.Audio = jest.fn().mockImplementation(() => {
                throw new Error('Audio not supported');
            });
            
            await timer.playAudioNotification('steeping_complete');
            
            expect(global.AudioContext).toHaveBeenCalled();
            const contextInstance = global.AudioContext.mock.results[0].value;
            expect(contextInstance.createOscillator).toHaveBeenCalled();
            expect(contextInstance.createGain).toHaveBeenCalled();
        });
    });

    describe('Audio Settings Integration', () => {
        test('should respect audio enabled setting', async () => {
            timer.settings.audioEnabled = false;
            
            await timer.playAudioNotification('steeping_complete');
            
            expect(global.Audio).not.toHaveBeenCalled();
        });

        test('should apply volume setting to audio files', async () => {
            timer.settings.audioVolume = 0.3;
            
            await timer.playAudioNotification('steeping_complete');
            
            const audioInstance = global.Audio.mock.results[0].value;
            expect(audioInstance.volume).toBe(0.3);
        });

        test('should handle missing volume setting gracefully', async () => {
            timer.settings.audioVolume = undefined;
            
            await timer.playAudioNotification('steeping_complete');
            
            const audioInstance = global.Audio.mock.results[0].value;
            expect(audioInstance.volume).toBe(0.5); // Default fallback
        });
    });

    describe('Error Handling', () => {
        test('should handle audio load errors gracefully', async () => {
            global.Audio = jest.fn().mockImplementation(() => ({
                volume: 0.5,
                preload: 'auto',
                play: jest.fn().mockRejectedValue(new Error('Play failed')),
                load: jest.fn(),
                addEventListener: jest.fn((event, callback) => {
                    if (event === 'error') {
                        setTimeout(() => callback(new Error('Load failed')), 0);
                    }
                })
            }));
            
            // Should not throw error
            await expect(timer.playAudioNotification('steeping_complete')).resolves.toBeUndefined();
        });

        test('should continue timer functionality when audio fails', async () => {
            global.Audio = jest.fn().mockImplementation(() => {
                throw new Error('Audio completely broken');
            });
            global.AudioContext = jest.fn().mockImplementation(() => {
                throw new Error('AudioContext broken too');
            });
            
            // Should not throw error and not break timer functionality
            await expect(timer.playAudioNotification('steeping_complete')).resolves.toBeUndefined();
            
            // Timer should still work
            timer.startTimer();
            expect(timer.state.isRunning).toBe(true);
        });
    });

    describe('Integration with Timer Events', () => {
        test('should call correct audio notification on steeping complete', () => {
            const audioSpy = jest.spyOn(timer, 'playAudioNotification');
            
            // Simulate steeping completion by calling handleTimerComplete in steeping stage
            timer.state.currentStage = 'steeping';
            timer.handleTimerComplete();
            
            expect(audioSpy).toHaveBeenCalledWith('steeping_complete');
        });

        test('should call correct audio notification on brewing complete', () => {
            const audioSpy = jest.spyOn(timer, 'playAudioNotification');
            
            // Simulate brewing completion by calling handleTimerComplete in brewing stage
            timer.state.currentStage = 'brewing';
            timer.handleTimerComplete();
            
            expect(audioSpy).toHaveBeenCalledWith('brewing_complete');
        });

        test('should call stir reminder audio on stir stage', (done) => {
            const audioSpy = jest.spyOn(timer, 'playAudioNotification');
            
            // Set up steeping completion which triggers stir reminder
            timer.state.currentStage = 'steeping';
            timer.handleTimerComplete(); // This calls showStirReminder which has timeout
            
            // Wait for timeout to complete
            setTimeout(() => {
                expect(audioSpy).toHaveBeenCalledWith('stir_reminder');
                done();
            }, 600);
        });
    });
});