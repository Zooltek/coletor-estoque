# RFC-0009A - Scanner Session Manager

**Status:** Aprovado

**Prioridade:** Crítica

**Dependências:**

* RFC-0003 - Scanner Contínuo
* RFC-0007 - Máquina de Estados
* RFC-0008 - Histórico Inteligente
* RFC-0009 - Pipeline Centralizado

---

# Objetivo

Criar uma camada única responsável por representar a sessão atual do Scanner.

Após esta RFC, nenhuma informação relacionada à sessão poderá ficar espalhada entre:

* ScannerProvider
* ScannerPipeline
* HistoryService
* FeedbackService
* StateMachine
* Componentes React

Todas essas informações deverão ser centralizadas no **ScannerSessionManager**.

O ScannerSessionManager passa a ser a única fonte de verdade da sessão ativa.

---

# Problema Atual

Hoje diversos módulos mantêm partes da sessão.

Exemplo:

ScannerPipeline

↓

último barcode

History

↓

histórico

Feedback

↓

último produto

StateMachine

↓

estado

Provider

↓

contadores

Isso dificulta manutenção e evolução.

---

# Nova Arquitetura

```text
Camera

↓

ScannerService

↓

ScannerPipeline

↓

ScannerSessionManager

↓

StateMachine

↓

HistoryService

↓

FeedbackService

↓

Interface
```

ScannerPipeline continua responsável pelo processamento.

ScannerSessionManager torna-se responsável por manter o contexto da sessão.

---

# Estrutura

Criar:

```text
src/

core/

scanner/

session/

ScannerSessionManager.js

ScannerSession.js

ScannerSessionEvent.js

ScannerSessionState.js

ScannerSessionMetrics.js

ScannerSessionSnapshot.js

ScannerSessionLogger.js

SessionValidator.js

index.js

hooks/

useScannerSession.js
```

---

# Responsabilidades

ScannerSessionManager

Responsável por:

* iniciar sessão;
* finalizar sessão;
* atualizar contexto;
* fornecer snapshots;
* emitir eventos.

Nunca acessar React.

Nunca acessar ScannerService.

---

ScannerSession

Representa a sessão ativa.

Objeto imutável sempre que possível.

---

ScannerSessionMetrics

Responsável por métricas.

---

ScannerSessionSnapshot

Objeto somente leitura.

Utilizado pela interface.

---

ScannerSessionLogger

Registrar alterações.

---

SessionValidator

Garantir consistência.

---

# Estrutura da Sessão

A sessão deverá armazenar:

```text
sessionId

startedAt

finishedAt

duration

currentState

scannerType

device

camera

```

---

# Leituras

Registrar:

```text
lastBarcode

lastAcceptedBarcode

lastRejectedBarcode

lastProduct

lastQuantity

lastReadTime

```

---

# Contadores

```text
totalReads

acceptedReads

rejectedReads

duplicateReads

invalidReads

manualReads

ignoredReads

```

Todos atualizados automaticamente.

---

# Estatísticas

Calcular continuamente:

```text
averageReadTime

fastestRead

slowestRead

readsPerMinute

sessionDuration

```

Preparar Dashboard futuro.

---

# Contexto Atual

Manter sempre disponível:

```text
currentProduct

currentBarcode

currentQuantity

currentState

lastError

cooldownUntil
```

---

# Snapshot

Criar método:

```text
getSnapshot()
```

Retornar objeto somente leitura.

Nunca permitir alterações externas.

---

# Eventos

Criar eventos oficiais.

```text
SESSION_STARTED

SESSION_UPDATED

SESSION_FINISHED

SESSION_RESET

SESSION_ERROR
```

Emitidos exclusivamente pelo ScannerSessionManager.

---

# Fluxo

Início.

```text
createSession()

↓

SESSION_STARTED

↓

Pipeline

↓

updateSession()

↓

Feedback

↓

History

↓

SESSION_UPDATED

↓

READY
```

Encerramento.

```text
finishSession()

↓

SESSION_FINISHED
```

---

# ScannerPipeline

Após concluir processamento.

Executar:

```text
ScannerSessionManager.update(...)
```

Nunca modificar sessão diretamente.

---

# HistoryService

Registrar leitura.

↓

Atualizar ScannerSession.

---

# FeedbackService

Consumir Snapshot.

Nunca alterar sessão.

---

# StateMachine

Atualizar apenas:

```text
currentState
```

Jamais controlar métricas.

---

# React

Criar Hook.

```text
useScannerSession()
```

Responsável apenas por observar.

Nunca modificar estado.

---

# Interface

Os componentes deverão consumir apenas o Snapshot.

Exemplos:

* Painel Inferior
* Histórico
* Toolbar
* Feedback
* Dashboard (futuro)

Nenhum componente deverá consultar múltiplos serviços.

---

# Persistência

Nesta RFC.

Não persistir.

Sessão existe apenas em memória.

Preparar arquitetura para futura persistência.

---

# Reset

Criar:

```text
resetSession()
```

Limpar:

* métricas;
* contadores;
* último produto;
* último código;
* histórico da sessão.

Não reinicializar Scanner.

---

# Performance

Utilizar estruturas leves.

Evitar clonagens profundas.

Atualizar apenas propriedades alteradas.

---

# Logs

Registrar:

```text
Session Started

Session Updated

Session Finished

Session Reset

Snapshot Generated
```

---

# Compatibilidade

HTML5

Native

CameraX

ML Kit

Scanner USB

Scanner Bluetooth

Todos deverão compartilhar exatamente a mesma estrutura de sessão.

---

# Preparação para Futuras RFCs

A arquitetura deverá suportar:

* Dashboard em tempo real;
* Exportação da sessão;
* Estatísticas de produtividade;
* Auditoria;
* Recuperação de sessão;
* Persistência Offline;
* Sincronização de sessão;
* Multioperador.

Nenhuma dessas funcionalidades deverá ser implementada nesta RFC.

---

# Critérios de Aceite

✔ Existe apenas um ScannerSessionManager.

✔ Toda informação da sessão está centralizada.

✔ Snapshot somente leitura.

✔ Eventos funcionando.

✔ Métricas atualizadas automaticamente.

✔ Contadores centralizados.

✔ React consome apenas o Hook.

✔ ScannerPipeline não mantém estado da sessão.

✔ Build executando normalmente.

✔ Nenhuma regressão.

---

# Não Fazer

Não alterar regras de inventário.

Não alterar ScannerService.

Não alterar ScannerPipeline.

Não alterar Layout.

Não alterar Overlay.

Não alterar Toolbar.

Não alterar Feedback.

Não alterar Histórico.

Não persistir dados em banco.

Não implementar Dashboard.

Não implementar exportação.

Não implementar sincronização.

Não implementar autenticação.

Não adicionar regras de negócio ao ScannerSessionManager.

O ScannerSessionManager deve ser exclusivamente o responsável pelo contexto da sessão ativa do scanner, centralizando métricas, estado operacional e informações da sessão, tornando-se a única fonte de verdade para qualquer funcionalidade relacionada ao ciclo de vida da coleta.
