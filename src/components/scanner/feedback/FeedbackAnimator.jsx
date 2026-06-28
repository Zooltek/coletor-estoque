import React, { useEffect, useState } from 'react';
import './feedback.css';

// Usar React.memo para evitar re-renderizações desnecessárias
const FeedbackAnimator = React.memo(({ show, duration, onComplete, children }) => {
  const [render, setRender] = useState(show);
  const [animState, setAnimState] = useState('exit-active');

  useEffect(() => {
    let timeoutId;
    if (show) {
      setRender(true);
      setAnimState('enter');
      // Request animation frame para garantir que a classe 'enter' foi aplicada antes de ir para 'active'
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setAnimState('enter-active');
        });
      });

      // Se houver duração, oculta automaticamente
      if (duration) {
        timeoutId = setTimeout(() => {
          setAnimState('exit-active');
          setTimeout(() => {
            setRender(false);
            if (onComplete) onComplete();
          }, 150); // tempo da transição CSS
        }, duration);
      }
    } else {
      setAnimState('exit-active');
      timeoutId = setTimeout(() => {
        setRender(false);
      }, 150);
    }

    return () => clearTimeout(timeoutId);
  }, [show, duration, onComplete]);

  if (!render) return null;

  return (
    <div className={`anim-fade-${animState}`}>
      {children}
    </div>
  );
});

export default FeedbackAnimator;
