import React from 'react';
import { useConfiguration } from '../../hooks/useConfiguration';
import { SettingsGroup } from './SettingsGroup';
import { SettingsItem } from './SettingsItem';

export default function SettingsPage() {
  const { config, updateConfig, resetConfig } = useConfiguration();

  if (!config) return <div className="p-4">Carregando configurações...</div>;

  const handleReset = () => {
    if (window.confirm("Deseja realmente restaurar todas as configurações para o padrão original?")) {
      resetConfig();
    }
  };

  return (
    <div className="settings-page animate-fade" style={{ padding: '20px', paddingBottom: '80px', overflowY: 'auto', height: '100%' }}>
      <h2 style={{ marginBottom: '20px' }}>Configurações Globais</h2>

      <SettingsGroup title="Scanner">
        <SettingsItem 
          label="Modo Contínuo" 
          description="Continua lendo códigos sem precisar reabrir a câmera (Bipagem contínua)"
          type="switch" 
          value={config.scanner.continuousMode} 
          onChange={(v) => updateConfig('scanner', 'continuousMode', v)} 
        />
        <SettingsItem 
          label="Contagem Cega" 
          description="Permitir bipar e registrar produtos que não existem no catálogo atual"
          type="switch" 
          value={config.scanner.blindCount} 
          onChange={(v) => updateConfig('scanner', 'blindCount', v)} 
        />
        <SettingsItem 
          label="Método Padrão" 
          description="Como deseja inserir o código de barras ao abrir o inventário"
          type="select" 
          options={[{label: 'Câmera Traseira', value: 'scan'}, {label: 'Digitação Manual', value: 'type'}]}
          value={config.scanner.method} 
          onChange={(v) => updateConfig('scanner', 'method', v)} 
        />
        <SettingsItem 
          label="Tempo Mínimo (ms)" 
          description="Tempo de bloqueio entre a leitura de dois códigos no modo contínuo"
          type="number" 
          value={config.scanner.minTimeBetweenScans} 
          onChange={(v) => updateConfig('scanner', 'minTimeBetweenScans', v)} 
        />
      </SettingsGroup>

      <SettingsGroup title="Câmera">
        <SettingsItem 
          label="Zoom Inteligente" 
          description="Aproxima ou afasta a lente automaticamente baseando-se no tamanho do código"
          type="switch" 
          value={config.camera.smartZoom} 
          onChange={(v) => updateConfig('camera', 'smartZoom', v)} 
        />
        <SettingsItem 
          label="Lanterna Inteligente" 
          description="Ativa o Flash automaticamente em ambientes escuros"
          type="switch" 
          value={config.camera.smartLight} 
          onChange={(v) => updateConfig('camera', 'smartLight', v)} 
        />
        <SettingsItem 
          label="Auto Focus Direcionado" 
          description="Força a lente a buscar foco na exata coordenada do código"
          type="switch" 
          value={config.camera.autoFocus} 
          onChange={(v) => updateConfig('camera', 'autoFocus', v)} 
        />
      </SettingsGroup>

      <SettingsGroup title="Feedback e Áudio">
        <SettingsItem 
          label="Silenciar Sons" 
          description="Desativa o beep ao confirmar leituras"
          type="switch" 
          value={config.feedback.soundMuted} 
          onChange={(v) => updateConfig('feedback', 'soundMuted', v)} 
        />
        <SettingsItem 
          label="Feedback Háptico" 
          description="Vibrar celular ao ler"
          type="switch" 
          value={config.feedback.vibrationEnabled} 
          onChange={(v) => updateConfig('feedback', 'vibrationEnabled', v)} 
        />
        <SettingsItem 
          label="Mostrar Overlay" 
          description="Exibe o banner flutuante informando o sucesso na tela"
          type="switch" 
          value={config.feedback.showOverlay} 
          onChange={(v) => updateConfig('feedback', 'showOverlay', v)} 
        />
      </SettingsGroup>

      <SettingsGroup title="Interface">
        <SettingsItem 
          label="Tema Visual" 
          type="select" 
          options={[{label: 'Escuro (Dark)', value: 'dark'}, {label: 'Claro (Light)', value: 'light'}]}
          value={config.interface.theme} 
          onChange={(v) => updateConfig('interface', 'theme', v)} 
        />
        <SettingsItem 
          label="Animações de Interface" 
          description="Pode melhorar a performance se desligado em dispositivos lentos"
          type="switch" 
          value={config.interface.animationsEnabled} 
          onChange={(v) => updateConfig('interface', 'animationsEnabled', v)} 
        />
        <SettingsItem 
          label="Histórico Recente" 
          description="Mostra os últimos itens lidos na tela de coleta"
          type="switch" 
          value={config.interface.showHistory} 
          onChange={(v) => updateConfig('interface', 'showHistory', v)} 
        />
      </SettingsGroup>

      <SettingsGroup title="Desenvolvedor (Debug)">
        <SettingsItem 
          label="Painel de Performance (FPS)" 
          type="switch" 
          value={config.interface.showFPS} 
          onChange={(v) => updateConfig('interface', 'showFPS', v)} 
        />
        <SettingsItem 
          label="Logs Detalhados" 
          type="switch" 
          value={config.developer.detailedLogs} 
          onChange={(v) => updateConfig('developer', 'detailedLogs', v)} 
        />
        <SettingsItem 
          label="Centro de Diagnóstico (Dashboard Técnico)" 
          description="Habilita uma nova aba no rodapé para visualizar o estado interno do Scanner e Câmera"
          type="switch" 
          value={config.developer.enableDiagnostics || false} 
          onChange={(v) => updateConfig('developer', 'enableDiagnostics', v)} 
        />
      </SettingsGroup>

      <div style={{ marginTop: '30px', textAlign: 'center' }}>
        <button 
          onClick={handleReset}
          className="btn-danger" 
          style={{ width: '100%', padding: '12px', borderRadius: '8px' }}
        >
          Restaurar Padrões
        </button>
        <div style={{ marginTop: '10px', fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>
          Core v{config.version}
        </div>
      </div>
    </div>
  );
}
