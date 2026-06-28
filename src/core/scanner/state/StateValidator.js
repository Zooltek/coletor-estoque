import { ScannerTransition } from './ScannerTransition';

export class StateValidator {
  static canTransition(from, to) {
    if (!ScannerTransition[from]) return false;
    return ScannerTransition[from].includes(to);
  }
}
