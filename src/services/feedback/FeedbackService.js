import FeedbackSound from '../../components/scanner/feedback/FeedbackSound';
import FeedbackVibration from '../../components/scanner/feedback/FeedbackVibration';

class FeedbackService {
  constructor() {
    this.soundEnabled = true;
    this.vibrationEnabled = true;
  }

  triggerSuccess() {
    if (this.soundEnabled) FeedbackSound.playSuccess();
    if (this.vibrationEnabled) FeedbackVibration.playSuccess();
    console.log("Feedback SUCCESS");
  }

  triggerError() {
    if (this.soundEnabled) FeedbackSound.playError();
    if (this.vibrationEnabled) FeedbackVibration.playError();
    console.log("Feedback ERROR");
  }

  triggerDuplicate() {
    if (this.soundEnabled) FeedbackSound.playDuplicate();
    if (this.vibrationEnabled) FeedbackVibration.playDuplicate();
    console.log("Feedback DUPLICATE");
  }

  setSoundEnabled(enabled) {
    this.soundEnabled = enabled;
  }

  setVibrationEnabled(enabled) {
    this.vibrationEnabled = enabled;
  }
}

export default new FeedbackService();
