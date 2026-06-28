import React from 'react';

// Um frame simulador de dispositivo móvel elegante para desktops.
// Em telas de celular, ele desaparece e exibe o conteúdo em tela cheia.
export default function DeviceFrame({ children }) {
  return (
    <div className="device-wrapper">
      <div className="device-container">
        
        {/* Tela do celular */}
        <div className="device-screen">
          {/* Status Bar */}
          <div className="device-status-bar">
            <div className="status-time">{new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</div>
            <div className="status-icons">
              <span className="icon-signal">📶</span>
              <span className="icon-wifi">📶</span>
              <span className="icon-battery">🔋 98%</span>
            </div>
          </div>
          
          {/* Conteúdo Real do Aplicativo */}
          <div className="device-app-content">
            {children}
          </div>

          {/* Barra inferior do iPhone / Android */}
          <div className="device-home-bar"></div>
        </div>
      </div>
      
      {/* Informação lateral para Desktop */}
      <div className="device-info-sidebar">
        <h2>
          <img src="/logo.ico" alt="Amura Logo" style={{ width: '32px', height: '32px', marginRight: '8px', verticalAlign: 'middle', objectFit: 'contain' }} />
          Amura Collector
        </h2>
        <p>Este simulador demonstra a experiência real em smartphones (Android & iOS).</p>
        
        <div className="info-feature-badge">
          <span>📶 Offline & Online</span>
          <span>📸 Câmera Ativa</span>
          <span>🔊 Bipe Sonoro (Amura)</span>
          <span>📊 Ajustes Kardex</span>
        </div>

        <div className="instruction-card">
          <h4>💡 Dicas de Teste:</h4>
          <ul>
            <li><strong>Leitor Bluetooth:</strong> Digite códigos de barra no campo e pressione Enter.</li>
            <li><strong>Bipes:</strong> Certifique-se de que o som do dispositivo está ativado.</li>
            <li><strong>Simulação Kardex:</strong> Acesse a aba <em>"Sinc & ERP"</em> para testar o painel do ERP e conciliação do Kardex.</li>
            <li><strong>Modo Pallet:</strong> Na contagem, clique no ícone de Pallet 📦 para calcular volumes fechados/abertos.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
