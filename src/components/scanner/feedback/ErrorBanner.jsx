import React from 'react';

const ErrorBanner = React.memo(({ message, type = 'error' }) => {
  const isDuplicate = type === 'duplicate';
  const className = isDuplicate ? 'feedback-banner feedback-banner-duplicate' : 'feedback-banner feedback-banner-error';
  
  return (
    <div className={className}>
      <h3>{isDuplicate ? 'ℹ️ Aviso' : '⚠ Erro de Leitura'}</h3>
      <p>{message || (isDuplicate ? 'Código já processado' : 'Produto não encontrado')}</p>
    </div>
  );
});

export default ErrorBanner;
