/**
 * DictaLearn - Keyboard Shortcuts Controller
 * Centralizes keyboard interactions: Space, Ctrl+Space, Enter, Tab, Navigation.
 */

class ShortcutsController {
  constructor(app) {
    this.app = app;
    this.isEnabled = true;
    this.initListeners();
  }

  initListeners() {
    window.addEventListener('keydown', (e) => {
      if (!this.isEnabled) return;

      const activeEl = document.activeElement;
      const isInputFocused = activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA');

      // 1. Enter key -> Check answer or Proceed to next
      if (e.key === 'Enter') {
        if (!e.shiftKey) {
          e.preventDefault();
          this.app.handleEnterKey();
        }
        return;
      }

      // 2. Space keys
      if (e.code === 'Space') {
        if (e.ctrlKey || e.altKey || e.metaKey || !isInputFocused) {
          e.preventDefault();
          this.app.toggleAudio();
        }
        return;
      }

      // 3. Tab or Ctrl+H -> Request Hint
      if (e.key === 'Tab' || (e.ctrlKey && e.key.toLowerCase() === 'h')) {
        e.preventDefault();
        this.app.requestHint();
        return;
      }

      // 4. Ctrl + ArrowRight -> Next Item
      if (e.ctrlKey && e.key === 'ArrowRight') {
        e.preventDefault();
        this.app.nextItem();
        return;
      }

      // 5. Ctrl + ArrowLeft -> Previous Item
      if (e.ctrlKey && e.key === 'ArrowLeft') {
        e.preventDefault();
        this.app.prevItem();
        return;
      }

      // 6. Escape -> Close Modals or clear
      if (e.key === 'Escape') {
        this.app.closeAllModals();
        return;
      }

      // 7. SRS ratings 1, 2, 3, 4 when results panel is visible
      if (this.app.isResultsVisible && !isInputFocused) {
        if (e.key === '1') this.app.rateItem(1);
        if (e.key === '2') this.app.rateItem(3);
        if (e.key === '3') this.app.rateItem(4);
        if (e.key === '4') this.app.rateItem(5);
      }
    });
  }

  enable() { this.isEnabled = true; }
  disable() { this.isEnabled = false; }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = ShortcutsController;
} else {
  window.ShortcutsController = ShortcutsController;
}
