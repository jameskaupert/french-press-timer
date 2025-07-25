// Test setup file for Jest
// Mock DOM elements and localStorage

// Mock localStorage
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: jest.fn((key) => store[key] || null),
    setItem: jest.fn((key, value) => { store[key] = value; }),
    removeItem: jest.fn((key) => { delete store[key]; }),
    clear: jest.fn(() => { store = {}; }),
  };
})();
global.localStorage = localStorageMock;

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  warn: jest.fn(),
  log: jest.fn(),
};

// Reset mocks before each test
beforeEach(() => {
  jest.clearAllMocks();
  
  // Reset localStorage mock
  localStorageMock.clear();
  localStorageMock.getItem.mockReturnValue(null);
  
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
              <label for="firstTimer">Steeping Time (minutes):</label>
              <input type="number" id="firstTimer" min="1" max="30" value="4">
            </div>
            <div class="setting-group">
              <label for="secondTimer">Final Brewing Time (minutes):</label>
              <input type="number" id="secondTimer" min="1" max="30" value="8">
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