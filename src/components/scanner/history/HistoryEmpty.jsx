import React from 'react';

const HistoryEmpty = React.memo(() => {
  return (
    <div className="history-empty">
      Nenhuma leitura realizada.
    </div>
  );
});

export default HistoryEmpty;
