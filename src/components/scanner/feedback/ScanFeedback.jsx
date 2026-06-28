import React, { useState, useEffect } from 'react';
import FeedbackAnimator from './FeedbackAnimator';
import SuccessBanner from './SuccessBanner';
import ErrorBanner from './ErrorBanner';
import { ScannerState, ScannerEvent } from '../../../core/scanner/state';

const ScanFeedback = React.memo(({ pipelineState, scannedProduct, errorMessage }) => {
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [showDuplicate, setShowDuplicate] = useState(false);
  const [overlayClass, setOverlayClass] = useState('');

  useEffect(() => {
    switch (pipelineState) {
      case ScannerState.SUCCESS:
        setShowSuccess(true);
        setOverlayClass('feedback-overlay-success');
        break;
      case ScannerState.ERROR:
        setShowError(true);
        setOverlayClass('feedback-overlay-error');
        break;
      case ScannerEvent.DUPLICATED:
        setShowDuplicate(true);
        setOverlayClass('feedback-overlay-duplicate');
        break;
      case ScannerState.READY:
        // Limpeza garantida
        setOverlayClass('');
        setShowSuccess(false);
        setShowError(false);
        setShowDuplicate(false);
        break;
      default:
        break;
    }
  }, [pipelineState]);

  return (
    <>
      <div className={`feedback-overlay-base ${overlayClass}`}></div>
      
      <div className="feedback-banner-container">
        <FeedbackAnimator show={showSuccess} duration={300} onComplete={() => setShowSuccess(false)}>
          <SuccessBanner product={scannedProduct} quantity={1} />
        </FeedbackAnimator>

        <FeedbackAnimator show={showError} duration={500} onComplete={() => setShowError(false)}>
          <ErrorBanner message={errorMessage?.message || errorMessage} type="error" />
        </FeedbackAnimator>

        <FeedbackAnimator show={showDuplicate} duration={250} onComplete={() => setShowDuplicate(false)}>
          <ErrorBanner type="duplicate" />
        </FeedbackAnimator>
      </div>
    </>
  );
});

export default ScanFeedback;
