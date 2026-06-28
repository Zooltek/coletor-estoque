export default class CooldownManager {
  constructor(defaultCooldownMs = 500) {
    this.defaultCooldownMs = defaultCooldownMs;
    this.timer = null;
  }

  startCooldown(callback, overrideMs) {
    this.cancel();
    const ms = overrideMs !== undefined ? overrideMs : this.defaultCooldownMs;
    this.timer = setTimeout(() => {
      if (callback) callback();
    }, ms);
  }

  cancel() {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
  }
}
