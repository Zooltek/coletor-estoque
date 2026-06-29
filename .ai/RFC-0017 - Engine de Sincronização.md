# RFC-0017 - Engine de Sincronização

**Status:** Aprovado

**Prioridade:** Alta

**Dependências:**

* RFC-0009 - Pipeline Centralizado
* RFC-0009A - Scanner Session Manager
* RFC-0015 - Sistema Centralizado de Configurações
* RFC-0016 - Centro de Diagnóstico

---

# Objetivo

Implementar uma Engine de Sincronização totalmente desacoplada do Inventário.

Toda sincronização deverá ocorrer através de uma fila de operações persistente, permitindo funcionamento online e offline.

O Inventário nunca deverá conhecer detalhes de APIs, protocolos ou ERPs.

---

# Objetivos

Permitir:

* funcionamento offline;
* sincronização automática;
* sincronização manual;
* múltiplos provedores;
* retomada após falhas;
* monitoramento de progresso.

---

# Regras

Não alterar:

* Inventário;
* ScannerPipeline;
* ScannerSessionManager;
* StateMachine;
* Histórico;
* Scanner.

A sincronização deverá consumir apenas os eventos gerados pela aplicação.

---

# Arquitetura

```text
Inventário

↓

SyncEvent

↓

SyncQueue

↓

SyncEngine

↓

SyncProvider

↓

ERP / API / Arquivo
```

Toda comunicação externa deverá ocorrer exclusivamente através da SyncEngine.

---

# Estrutura

Criar:

```text
src/

core/

sync/

SyncEngine.js

SyncQueue.js

SyncJob.js

SyncManager.js

SyncRepository.js

SyncScheduler.js

SyncRetryPolicy.js

SyncConflictResolver.js

SyncEvents.js

SyncSnapshot.js

providers/

ISyncProvider.js

HttpSyncProvider.js

FileSyncProvider.js

LocalSyncProvider.js

hooks/

useSync.js

useSyncQueue.js

useSyncStatus.js

components/

sync/

SyncStatus.jsx

SyncQueuePanel.jsx

SyncProgress.jsx

SyncIndicator.jsx

SyncHistory.jsx
```

---

# SyncEngine

Responsável por:

* iniciar sincronização;
* pausar;
* retomar;
* cancelar;
* processar fila;
* emitir eventos.

Nunca acessar React.

---

# SyncQueue

Fila persistente.

Cada item deverá conter:

```text
id

type

payload

createdAt

attempts

status

priority
```

A fila deverá sobreviver ao fechamento da aplicação.

---

# SyncJob

Representa uma única operação.

Exemplos:

```text
Enviar Inventário

Atualizar Produto

Enviar Contagem

Enviar Arquivo

Importar Cadastro
```

Cada Job deverá ser independente.

---

# SyncProvider

Criar interface:

```text
initialize()

connect()

disconnect()

send()

receive()

validate()

healthCheck()
```

Nenhum ERP deverá ser acessado diretamente.

---

# Providers

Implementar inicialmente:

```text
HttpSyncProvider

FileSyncProvider

LocalSyncProvider
```

Preparar arquitetura para futuros conectores.

---

# Retry Policy

Implementar política de tentativas.

```text
1ª tentativa

↓

2 segundos

↓

2ª tentativa

↓

5 segundos

↓

3ª tentativa

↓

15 segundos

↓

Falha permanente
```

Número máximo de tentativas configurável.

---

# Conflict Resolver

Preparar infraestrutura para resolver conflitos.

Estratégias:

```text
Servidor vence

Cliente vence

Mais recente vence

Manual
```

Nesta RFC apenas implementar a estrutura.

---

# Scheduler

Responsável por decidir quando sincronizar.

Modos:

```text
Manual

Automático

Ao finalizar inventário

Ao conectar à internet

Intervalo configurável
```

---

# Persistência

Toda fila deverá ser armazenada localmente.

Nenhum Job poderá ser perdido em caso de fechamento inesperado.

---

# Snapshot

Criar objeto:

```text
SyncSnapshot

↓

status

jobs

queue

provider

progress

errors
```

Somente leitura.

---

# Eventos

Criar:

```text
SYNC_STARTED

SYNC_FINISHED

SYNC_FAILED

SYNC_RETRY

SYNC_JOB_COMPLETED

SYNC_JOB_FAILED

SYNC_QUEUE_UPDATED

SYNC_PROVIDER_CHANGED
```

---

# Indicador

Adicionar indicador discreto na interface.

Estados:

```text
● Sincronizado

● Sincronizando

● Offline

● Erro
```

Não bloquear o operador.

---

# Painel

Layout.

```text
══════════════════════

Sincronização

══════════════════════

Status

Fila

Última sincronização

Próxima tentativa

Provedor

══════════════════════

Jobs

══════════════════════
```

---

# Configurações

Integrar ao ConfigurationManager.

Permitir:

```text
Modo automático

Intervalo

Retry

Provider padrão

Logs

Sincronização em segundo plano
```

---

# Performance

Processamento assíncrono.

Nunca bloquear:

* Scanner;
* Pipeline;
* Interface.

Utilizar processamento em lote quando possível.

---

# Segurança

Preparar infraestrutura para:

* autenticação;
* tokens;
* criptografia;
* certificados.

Não implementar nesta RFC.

---

# Logs

Adicionar:

```text
Sync Started

Sync Finished

Sync Failed

Retry

Provider Connected

Provider Disconnected

Queue Updated
```

Somente desenvolvimento.

---

# Compatibilidade

Android

Web

PWA

Desktop

Todos utilizando a mesma Engine.

Cada plataforma poderá possuir Providers específicos.

---

# Critérios de Aceite

✔ SyncEngine implementada.

✔ Fila persistente.

✔ Retry Policy funcionando.

✔ Scheduler implementado.

✔ Providers desacoplados.

✔ Indicador de sincronização.

✔ Snapshot imutável.

✔ Eventos implementados.

✔ Integração com ConfigurationManager.

✔ Build funcionando.

✔ Nenhuma regressão.

---

# Não Fazer

Não alterar ScannerPipeline.

Não alterar ScannerSessionManager.

Não alterar StateMachine.

Não alterar Inventário.

Não acessar APIs diretamente a partir do Inventário.

Não criar lógica de sincronização dentro de componentes React.

Não implementar autenticação.

Não implementar criptografia.

Não implementar sincronização em tempo real.

Não implementar WebSockets.

Não implementar resolução automática de conflitos.

Não criar dependência entre a Engine de Sincronização e qualquer ERP específico.

A Engine de Sincronização deverá funcionar como uma camada de infraestrutura independente, baseada em filas persistentes e provedores desacoplados, permitindo que novos conectores sejam adicionados futuramente sem qualquer impacto na lógica do inventário, do scanner ou da interface do usuário.
