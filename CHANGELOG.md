# Changelog

Todas as mudanças notáveis deste projeto serão documentadas neste arquivo.
O formato é baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/), e este projeto adere ao [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-06-29

### Adicionado
- **RFC-0009**: Scanner Pipeline para serialização de processamento de quadros e debounce.
- **RFC-0009A**: Scanner Session Manager e State Machine para bloqueios de concorrência no gatilho.
- **RFC-0012**: Scanner Inteligente (Integração ML Kit + Câmera Nativa via Capacitor).
- **RFC-0013**: Smart Zoom automático baseado na proximidade do frame e densidade de leitura.
- **RFC-0014**: Smart Light Controller com detecção de iluminação em tempo real.
- **RFC-0015**: Sistema centralizado de configurações persisistidas com abas no painel de Ajustes.
- **RFC-0016**: Centro de Diagnósticos e telemetria invisível para debugging (Dashboard Oculto).
- **RFC-0017**: Sync Engine (Fila Local Persistente, Retry Policies e Providers Desacoplados).
- **RFC-0018**: Polimento Final (Limpeza de código, dependências e versionamento 1.0.0).

### Modificado
- Design System atualizado para padrão Glassmorphism, melhorando contraste.
- Roteamento interno sem dependências externas (App.jsx State Router).
- Unificação das lógicas de exportação TXT/CSV/PDF no painel unificado gerido pela Sync Engine.

### Removido
- Hooks legados de câmera e performance (`useAndroidPerformance`, `useCameraMetrics`, `useScannerConfiguration`, `useCameraConfiguration`).
- Interações diretas e bloqueantes de API no meio do processo de inventário.
