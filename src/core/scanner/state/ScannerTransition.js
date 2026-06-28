import { ScannerState } from './ScannerState';

export const ScannerTransition = {
  [ScannerState.IDLE]: [ScannerState.INITIALIZING],
  
  [ScannerState.INITIALIZING]: [ScannerState.READY, ScannerState.ERROR],
  
  [ScannerState.READY]: [ScannerState.DETECTING, ScannerState.PAUSED, ScannerState.STOPPED],
  
  [ScannerState.DETECTING]: [ScannerState.PROCESSING, ScannerState.ERROR],
  
  [ScannerState.PROCESSING]: [ScannerState.SUCCESS, ScannerState.ERROR],
  
  [ScannerState.SUCCESS]: [ScannerState.COOLDOWN],
  
  [ScannerState.COOLDOWN]: [ScannerState.READY],
  
  [ScannerState.ERROR]: [ScannerState.READY, ScannerState.STOPPED],
  
  [ScannerState.PAUSED]: [ScannerState.READY, ScannerState.STOPPED],
  
  [ScannerState.STOPPED]: [] // Estado final
};
