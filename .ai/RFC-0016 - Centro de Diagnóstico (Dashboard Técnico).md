# RFC-0016 - Centro de Diagnóstico (Dashboard Técnico)

**Status:** Aprovado

**Prioridade:** Média

**Dependências:**

* RFC-0007 - Máquina de Estados
* RFC-0008 - Histórico Inteligente
* RFC-0009 - Pipeline Centralizado
* RFC-0009A - Scanner Session Manager
* RFC-0010 - Performance React
* RFC-0011 - Performance Android
* RFC-0012 - ML Kit Scanner
* RFC-0013 - Zoom Inteligente
* RFC-0014 - Smart Light Controller
* RFC-0015 - Sistema Centralizado de Configurações

---

# Objetivo

Implementar um Centro de Diagnóstico destinado ao desenvolvimento e suporte técnico.

O Dashboard deverá permitir visualizar, em tempo real, o comportamento interno do Scanner sem alterar seu funcionamento.

Toda coleta será passiva.

Nenhuma funcionalidade do inventário poderá depender deste módulo.

---

# Objetivos

Monitorar em tempo real:

* Scanner
* Pipeline
* Camera
* ML Kit
* Performance
* Sessão
* Memória
* CPU
* Bateria
* Histórico
* Eventos

---

# Regras

Não alterar:

* Inventário
* ScannerPipeline
* ScannerSessionManager
* StateMachine
* Layout principal

Esta RFC apenas adiciona ferramentas de observação.

---

# Arquitetura

```text
Scanner

↓

EventBus

↓

MetricsCollector

↓

DashboardStore

↓

Dashboard UI
```

Toda informação deve chegar ao Dashboard através de eventos.

Nunca por acesso direto aos módulos.

---

# Estrutura

Criar:

```text
src/

core/

diagnostics/

DiagnosticsManager.js

MetricsCollector.js

MetricsSnapshot.js

MetricsStore.js

MetricsEvents.js

MetricsExporter.js

hooks/

useDiagnostics.js

useMetrics.js

usePerformanceMetrics.js

components/

diagnostics/

DiagnosticsPage.jsx

DiagnosticsSection.jsx

MetricCard.jsx

MetricGrid.jsx

MetricTimeline.jsx

MetricBadge.jsx

MetricValue.jsx

EventConsole.jsx

SessionPanel.jsx

CameraPanel.jsx

PipelinePanel.jsx

MemoryPanel.jsx

PerformancePanel.jsx
```

---

# DiagnosticsManager

Responsável por:

* iniciar coleta;
* parar coleta;
* gerar snapshots;
* exportar métricas;
* limpar sessão.

Nunca acessar componentes React.

---

# MetricsCollector

Escutar eventos provenientes de:

* Pipeline;
* Scanner;
* StateMachine;
* SessionManager;
* Camera;
* Performance.

Converter tudo em métricas.

---

# Snapshot

Criar objeto imutável.

```text
MetricsSnapshot

↓

session

scanner

camera

pipeline

performance

memory

battery

thermal

history
```

---

# Scanner

Exibir.

```text
Scanner

↓

Tipo

Estado

Último código

Formato

Tempo última leitura

Scanner ativo

Scanner disponível
```

---

# Camera

Exibir.

```text
FPS

Frames recebidos

Frames descartados

Zoom

Foco

Lanterna

Exposição

Resolução
```

---

# Pipeline

Exibir.

```text
Eventos

Leituras aceitas

Leituras rejeitadas

Duplicados

Tempo médio

Último evento
```

---

# StateMachine

Exibir.

```text
Estado atual

Última transição

Número de transições

Tempo em READY

Tempo em PROCESSING

Tempo em ERROR
```

---

# Sessão

Exibir.

```text
Tempo de sessão

Leituras

Leituras/min

Maior intervalo

Menor intervalo

Tempo médio

Tempo total
```

---

# Histórico

Exibir.

```text
Itens

Últimos códigos

Produtos

Duplicados

Últimas alterações
```

---

# Performance

Exibir.

```text
Render React

Tempo Pipeline

Tempo ML Kit

Tempo Feedback

Tempo Scanner

Tempo Camera
```

---

# Android

Exibir.

```text
Heap

Memória

CPU

Temperatura

Bateria

Tempo de câmera aberta
```

---

# Timeline

Registrar cronologicamente.

```text
14:33:12

READY

↓

14:33:13

BarcodeDetected

↓

14:33:13

PROCESSING

↓

14:33:13

SUCCESS

↓

14:33:13

READY
```

Máximo:

1000 eventos.

FIFO.

---

# Event Console

Console em tempo real.

Exemplo.

```text
[Scanner]

Camera Ready

[Pipeline]

Accepted Barcode

[StateMachine]

READY -> PROCESSING

[Feedback]

Success

[History]

Item Added
```

Somente desenvolvimento.

---

# Exportação

Criar.

```text
Export JSON

Export TXT

Limpar Sessão
```

Preparar exportação futura em ZIP.

---

# Interface

Layout.

```text
══════════════════════════════

Centro de Diagnóstico

══════════════════════════════

Scanner

Camera

Pipeline

Performance

Sessão

Eventos

══════════════════════════════

Timeline

══════════════════════════════
```

Cada seção expansível.

---

# Atualizações

Utilizar EventBus.

Nunca polling.

Nunca timers.

Atualizar somente quando houver eventos.

---

# Performance

Dashboard fechado.

↓

Nenhuma coleta visual.

↓

Somente armazenamento.

Dashboard aberto.

↓

Atualização em tempo real.

---

# Segurança

Dashboard disponível apenas quando:

```text
developer.enableDiagnostics == true
```

Nunca expor para usuários finais por padrão.

---

# Logs

Adicionar.

```text
Diagnostics Started

Diagnostics Stopped

Metrics Exported

Metrics Reset

Dashboard Opened

Dashboard Closed
```

Somente desenvolvimento.

---

# Critérios de Aceite

✔ DiagnosticsManager implementado.

✔ Dashboard desacoplado.

✔ EventBus utilizado.

✔ Snapshot imutável.

✔ Timeline funcionando.

✔ Console de eventos funcionando.

✔ Exportação JSON.

✔ Exportação TXT.

✔ Dashboard protegido por configuração.

✔ Atualização em tempo real.

✔ Build funcionando.

✔ Nenhuma regressão.

---

# Não Fazer

Não alterar ScannerPipeline.

Não alterar ScannerSessionManager.

Não alterar StateMachine.

Não alterar Inventário.

Não alterar Layout principal.

Não criar dependência entre Dashboard e regras de negócio.

Não utilizar polling.

Não adicionar gráficos complexos.

Não implementar sincronização online.

Não enviar telemetria para servidores.

Não adicionar autenticação.

Não tornar o Dashboard acessível por padrão.

O Centro de Diagnóstico deve funcionar exclusivamente como uma ferramenta técnica de observação e suporte, utilizando eventos e snapshots para fornecer informações detalhadas sobre o funcionamento interno da aplicação, sem impactar o desempenho do Scanner ou modificar qualquer regra de negócio existente.
