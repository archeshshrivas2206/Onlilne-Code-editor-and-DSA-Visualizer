/**
 * VisualizationEngine — Global Playback Controller
 * 
 * Centralizes play/pause/step-forward/step-backward across ALL DSA visualizers.
 * Each visualizer loads its steps via engine.load(steps, renderFn) and the engine
 * drives the animation loop, speed slider, and step counter.
 */

class VisualizationEngine {

    constructor() {
        this.steps = [];
        this.currentIdx = 0;
        this.isPlaying = false;
        this.timeout = null;
        this.renderFn = null;       // Visualizer-provided render callback
        this.onCompleteFn = null;   // Optional callback when playback finishes

        // DOM references (set once during init)
        this.controls = null;
        this.playPauseBtn = null;
        this.stepCounter = null;
        this.speedSlider = null;
        this.progressBar = null;
    }

    /** One-time binding to the DOM controls. Called from app.js after page load. */
    init() {
        this.controls = document.getElementById('globalPlaybackControls');
        this.playPauseBtn = document.getElementById('globalPlayPauseBtn');
        this.stepCounter = document.getElementById('stepCounter');
        this.speedSlider = document.getElementById('globalSpeed');
        this.progressBar = document.getElementById('progressFill');
    }

    /**
     * Load a new set of steps and a render function for the active visualizer.
     * Resets state and shows the playback controls.
     * 
     * @param {Array} steps — Array of step objects (structure depends on visualizer)
     * @param {Function} renderFn — (step, index, allSteps) => void
     * @param {Function} [onComplete] — Optional callback on playback finish
     */
    load(steps, renderFn, onComplete = null) {
        this.stop();    // Clear any ongoing animation
        this.steps = steps;
        this.renderFn = renderFn;
        this.onCompleteFn = onComplete;
        this.currentIdx = 0;

        // Show controls and update counter
        if (this.controls) {
            this.controls.style.display = 'flex';
        }
        this._updateUI();
    }

    /** Start or resume automatic playback */
    play() {
        if (this.steps.length === 0 || !this.renderFn) return;

        // If we're at the end, restart
        if (this.currentIdx >= this.steps.length) {
            this.currentIdx = 0;
        }

        this.isPlaying = true;
        this._updatePlayButton();
        this._loop();
    }

    /** Pause automatic playback */
    pause() {
        this.isPlaying = false;
        if (this.timeout) {
            clearTimeout(this.timeout);
            this.timeout = null;
        }
        this._updatePlayButton();
    }

    /** Fully stop and reset */
    stop() {
        this.pause();
        this.steps = [];
        this.currentIdx = 0;
        this.renderFn = null;
        this.onCompleteFn = null;
        if (this.controls) {
            this.controls.style.display = 'none';
        }
        this._updateUI();
    }

    /** Toggle play/pause */
    toggle() {
        if (this.isPlaying) {
            this.pause();
        } else {
            this.play();
        }
    }

    /** Step forward one frame */
    stepForward() {
        this.pause();
        if (this.currentIdx < this.steps.length - 1) {
            this.currentIdx++;
            this._renderCurrent();
        }
    }

    /** Step backward one frame */
    stepBackward() {
        this.pause();
        if (this.currentIdx > 0) {
            this.currentIdx--;
            this._renderCurrent();
        }
    }

    /** Auto-start playback immediately after loading */
    autoPlay() {
        this.play();
    }

    /** Get current speed delay in ms from the speed slider */
    _getDelay() {
        if (this.speedSlider) {
            return Math.max(20, Number(this.speedSlider.value));
        }
        return 300;  // default fallback
    }

    /** Internal playback loop */
    _loop() {
        if (!this.isPlaying) return;

        if (this.currentIdx >= this.steps.length) {
            this.pause();
            if (this.onCompleteFn) this.onCompleteFn();
            return;
        }

        this._renderCurrent();
        this.currentIdx++;

        this.timeout = setTimeout(() => this._loop(), this._getDelay());
    }

    /** Render the current step and update UI indicators */
    _renderCurrent() {
        if (!this.renderFn || this.currentIdx < 0 || this.currentIdx >= this.steps.length) return;

        const step = this.steps[this.currentIdx];
        this.renderFn(step, this.currentIdx, this.steps);
        this._updateUI();
    }

    /** Update step counter and progress bar */
    _updateUI() {
        if (this.stepCounter) {
            if (this.steps.length > 0) {
                this.stepCounter.textContent = `${this.currentIdx + 1} / ${this.steps.length}`;
            } else {
                this.stepCounter.textContent = '- / -';
            }
        }
        if (this.progressBar && this.steps.length > 0) {
            const pct = ((this.currentIdx + 1) / this.steps.length) * 100;
            this.progressBar.style.width = pct + '%';
        } else if (this.progressBar) {
            this.progressBar.style.width = '0%';
        }
    }

    /** Swap the play/pause button icon */
    _updatePlayButton() {
        if (this.playPauseBtn) {
            this.playPauseBtn.textContent = this.isPlaying ? '⏸' : '▶';
        }
    }
}

// Create global singleton
window.engine = new VisualizationEngine();
