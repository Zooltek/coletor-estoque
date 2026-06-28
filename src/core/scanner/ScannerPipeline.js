import { ScannerStateMachine, ScannerState, ScannerEvent } from './state';
import { 
  PipelineExecutor, 
  PipelineContext, 
  PipelineResult,
  PipelineEvent 
} from './pipeline';

import DuplicateReadGuard from './pipeline/guards/DuplicateReadGuard';
import CooldownGuard from './pipeline/guards/CooldownGuard';
import BarcodeValidator from './pipeline/validators/BarcodeValidator';
import ChecksumValidator from './pipeline/validators/ChecksumValidator';
import BusinessValidator from './pipeline/validators/BusinessValidator';

import HistoryService from '../../services/history/HistoryService';
import FeedbackService from '../../services/feedback/FeedbackService';
import { ScannerSessionManager } from './session';

export const ScannerPipelineEvents = ScannerEvent;

export default class ScannerPipeline {
  constructor(onEvent) {
    this.onEvent = onEvent;
    
    // Assegura que uma sessão existe
    if (!ScannerSessionManager.getSnapshot()) {
      ScannerSessionManager.createSession();
    }

    
    this.fsm = new ScannerStateMachine(ScannerState.INITIALIZING);
    this.fsm.subscribe((event, state, payload) => {
      if (this.onEvent && event === ScannerEvent.STATE_CHANGED) {
        this.onEvent(state, payload);
      }
    });

    // Guards
    this.duplicateGuard = new DuplicateReadGuard(1000);
    this.cooldownGuard = new CooldownGuard();
    
    // Configura estágios fixos
    this.businessValidator = new BusinessValidator(null); // Será injetado dinamicamente

    this.executor = new PipelineExecutor();
    this.executor
      .addStage(this.cooldownGuard)
      .addStage(this.duplicateGuard)
      .addStage(new BarcodeValidator())
      .addStage(new ChecksumValidator())
      .addStage(this.businessValidator);

    // Escuta finalização do pipeline para gravar histórico e feedback
    this.executor.subscribe((event, context) => {
      if (event === PipelineEvent.PIPELINE_FINISHED) {
        this._handlePipelineFinished(context);
      }
    });

    this.isPaused = false;
  }

  get state() {
    return this.fsm.getState();
  }

  transition(newState, payload = null, reason = null) {
    return this.fsm.transition(newState, payload, reason);
  }

  pause() {
    this.isPaused = true;
    this.transition(ScannerState.PAUSED, null, 'User paused');
  }

  resume() {
    this.isPaused = false;
    this.duplicateGuard.reset();
    this.cooldownGuard.cancel();
    this.transition(ScannerState.READY, null, 'User resumed');
  }

  async processRead(code, onValidate) {
    if (this.isPaused || this.state !== ScannerState.READY) {
      return;
    }

    // Autorização de início (StateMachine)
    if (!this.transition(ScannerState.DETECTING, { barcode: code }, 'Scan detected')) return;

    // Atualiza o validador de negócio localmente se fornecido
    this.businessValidator.setCallback(onValidate);

    const context = new PipelineContext(code);
    await this.executor.execute(context);
  }

  _handlePipelineFinished(context) {
    // Stage 7: History Service
    // Stage 8: Feedback Service
    
    const { barcode, result, product, validation } = context;
    const desc = product ? product.description : '';
    const pid = product ? product.id : null;
    const errorMsg = validation.errors.length > 0 ? validation.errors[0].message || validation.errors[0] : '';

    // Atualiza o contexto de sessão central
    ScannerSessionManager.updateFromPipelineContext(context);

    if (result === PipelineResult.SUCCESS) {
      this.transition(ScannerState.PROCESSING, { barcode }, 'Processing success');
      HistoryService.add(barcode, 'SUCCESS', pid, desc, 1);
      FeedbackService.triggerSuccess();
      this.transition(ScannerState.SUCCESS, { barcode }, 'Validation accepted');
      
      // Cooldown e Retorno
      this.transition(ScannerState.COOLDOWN, null, 'Start cooldown');
      this.cooldownGuard.setCooldown(500);
      setTimeout(() => this._returnToReady(), 500);

    } else if (result === PipelineResult.DUPLICATE) {
      HistoryService.add(barcode, 'DUPLICATE', null, 'Leitura Duplicada', 1);
      FeedbackService.triggerDuplicate();
      if (this.onEvent) this.onEvent(ScannerEvent.DUPLICATED, barcode);
      this._returnToReady();

    } else if (result === PipelineResult.INVALID || result === PipelineResult.ERROR) {
      this.transition(ScannerState.PROCESSING, { barcode }, 'Processing error');
      HistoryService.add(barcode, 'ERROR', null, errorMsg, 1);
      FeedbackService.triggerError();
      this.transition(ScannerState.ERROR, { error: new Error(errorMsg) }, 'Validation rejected');
      
      // Cooldown estendido e Retorno
      this.cooldownGuard.setCooldown(1000);
      setTimeout(() => this._returnToReady(), 1000);
    } else {
      this._returnToReady();
    }
  }

  _returnToReady() {
    if (!this.isPaused && (this.state === ScannerState.COOLDOWN || this.state === ScannerState.ERROR || this.state === ScannerState.DETECTING)) {
      this.transition(ScannerState.READY, null, 'Cooldown finished');
    }
  }

  destroy() {
    this.cooldownGuard.cancel();
    if (this.state !== ScannerState.STOPPED) {
      this.transition(ScannerState.STOPPED, null, 'Destroy called');
    }
  }
}
