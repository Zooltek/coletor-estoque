class FeedbackVibration {
  vibrate(durationMs) {
    try {
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate(durationMs);
      }
      // If Capacitor Haptics is needed later, it can be injected here seamlessly
    } catch (err) {
      // Ignora silenciosamente (Desktop/Incompatível)
    }
  }

  playSuccess() {
    this.vibrate(40);
  }

  playError() {
    this.vibrate(150);
  }

  playDuplicate() {
    // Sem vibração conforme RFC
  }
}

export default new FeedbackVibration();
