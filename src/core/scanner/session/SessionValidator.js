export default class SessionValidator {
  static validate(session, state, metrics) {
    if (!session || !session.sessionId) return false;
    return true;
  }
}
