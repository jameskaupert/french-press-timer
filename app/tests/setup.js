// Test setup file for Jest
// Mock DOM elements and localStorage

// Simple localStorage mock without Jest spies (tests will add their own)
global.localStorage = {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {},
  clear: () => {}
};

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  warn: jest.fn(),
  log: jest.fn(),
};

// Reset mocks before each test
beforeEach(() => {
  jest.clearAllMocks();
  
  // Reset localStorage to clean state
  global.localStorage = {
    getItem: () => null,
    setItem: () => {},
    removeItem: () => {},
    clear: () => {}
  };
  
  // Ensure localStorage methods are fresh mocks for each test
  if (global.localStorage && global.localStorage.setItem && global.localStorage.setItem.mockClear) {
    global.localStorage.setItem.mockClear();
    global.localStorage.getItem.mockClear();
  }
  
  // Set up basic DOM structure
  document.body.innerHTML = `
    <div class="container">
      <header>
        <h1>French Press Timer</h1>
        <button class="settings-btn" id="settingsBtn">⚙️</button>
      </header>
      <main class="timer-display">
        <div class="stage-indicator">
          <h2 id="stageTitle">Ready to Start</h2>
          <p id="stageDescription">Press start to begin brewing</p>
        </div>
        <div class="timer-circle">
          <div class="time-display" id="timeDisplay">4:00</div>
          <div class="progress-ring">
            <svg class="progress-ring-svg" width="300" height="300">
              <circle class="progress-ring-circle-bg" cx="150" cy="150" r="140"></circle>
              <circle class="progress-ring-circle" cx="150" cy="150" r="140" id="progressCircle"></circle>
            </svg>
          </div>
        </div>
        <div class="controls">
          <button class="btn btn-primary" id="startBtn">Start Brewing</button>
          <button class="btn btn-secondary" id="resetBtn" style="display: none;">Reset</button>
          <button class="btn btn-secondary" id="continueBtn" style="display: none;">Continue to Final Brewing</button>
        </div>
      </main>
      <div class="settings-modal" id="settingsModal" style="display: none;">
        <div class="modal-content">
          <div class="modal-header">
            <h3>Timer Settings</h3>
            <button class="close-btn" id="closeBtn">&times;</button>
          </div>
          <div class="modal-body">
            <div class="setting-group">
              <label for="firstTimer">Steeping Time:</label>
              <div class="time-input-group">
                <input type="number" id="firstTimerMinutes" min="0" max="30" value="4" class="time-input">
                <span class="time-label">min</span>
                <input type="number" id="firstTimerSeconds" min="0" max="59" value="0" class="time-input">
                <span class="time-label">sec</span>
              </div>
            </div>
            <div class="setting-group">
              <label for="secondTimer">Final Brewing Time:</label>
              <div class="time-input-group">
                <input type="number" id="secondTimerMinutes" min="0" max="30" value="8" class="time-input">
                <span class="time-label">min</span>
                <input type="number" id="secondTimerSeconds" min="0" max="59" value="0" class="time-input">
                <span class="time-label">sec</span>
              </div>
            </div>
            <div class="setting-group">
              <label for="audioEnabled">
                <input type="checkbox" id="audioEnabled" checked>
                Enable Audio Notifications
              </label>
            </div>
            <div class="setting-group">
              <label for="audioVolume">Audio Volume:</label>
              <input type="range" id="audioVolume" min="0" max="1" step="0.1" value="0.5">
              <span id="volumeDisplay">50%</span>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary" id="resetDefaults">Reset to Defaults</button>
            <button class="btn btn-primary" id="saveSettings">Save Settings</button>
          </div>
        </div>
      </div>
    </div>
  `;
  
  // Mock SVG circle properties
  const circle = document.getElementById('progressCircle');
  if (circle) {
    circle.r = { baseVal: { value: 140 } };
    circle.style = {};
  }
});