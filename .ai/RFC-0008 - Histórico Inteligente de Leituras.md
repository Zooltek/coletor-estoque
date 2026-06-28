# RFC-0008 - Histórico Inteligente de Leituras

**Status:** Aprovado

**Prioridade:** Alta

**Dependências:**

* RFC-0000 - Design System
* RFC-0001 - Layout
* RFC-0002 - Overlay
* RFC-0003 - Scanner Contínuo
* RFC-0004 - Feedback
* RFC-0005 - Painel Inferior
* RFC-0006 - Toolbar
* RFC-0007 - Máquina de Estados

---

# Objetivo

Implementar um Histórico Inteligente de Leituras para fornecer ao operador uma visão imediata das últimas leituras realizadas durante a sessão de inventário.

O histórico deve permitir auditoria visual rápida, identificação de leituras repetidas e suporte a futuras funcionalidades como desfazer última leitura e filtros.

O histórico representa apenas a sessão atual de inventário.

Não deve persistir em banco de dados nesta RFC.

---

# Objetivos

O operador deve conseguir visualizar:

* últimas leituras realizadas;
* horário da leitura;
* quantidade aplicada;
* status da leitura;
* produto associado.

Sem interromper a coleta.

---

# Regras

Não alterar:

* Inventário
* ScannerPipeline
* ScannerService
* ScannerProvider
* Sincronização

Esta RFC implementa apenas o gerenciamento e apresentação do histórico da sessão.

---

# Estrutura

Criar:

```text
src/

components/

scanner/

history/

HistoryPanel.jsx

HistoryList.jsx

HistoryCard.jsx

HistoryStatusChip.jsx

HistoryEmpty.jsx

HistoryTimestamp.jsx

HistoryQuantity.jsx

index.js

hooks/

useHistory.js

services/

history/

HistoryService.js

core/

history/

HistoryEntry.js

HistorySession.js

HistoryFilter.js

HistoryValidator.js
```

---

# Arquitetura

```text
ScannerPipeline

↓

HistoryService

↓

HistorySession

↓

HistoryPanel
```

O ScannerPipeline apenas informa que uma leitura foi concluída.

Toda a gestão do histórico pertence ao HistoryService.

---

# Responsabilidades

HistoryService

Gerenciar histórico.

Adicionar.

Atualizar.

Limitar quantidade.

Notificar interface.

---

HistorySession

Manter registros da sessão.

---

HistoryValidator

Validar consistência.

---

HistoryFilter

Preparar futuras filtragens.

Nesta RFC não haverá filtros visuais.

---

# Estrutura do Registro

Cada leitura deverá armazenar:

```text
id

barcode

productId

description

quantity

timestamp

status

scannerType

duration
```

Nenhum componente React deverá alterar essas informações.

---

# Status Permitidos

```text
SUCCESS

ERROR

DUPLICATE

MANUAL

IGNORED
```

Nenhum outro status poderá existir.

---

# Layout

Cada registro deverá possuir:

```text
✔ Coca-Cola 2L

7891234567890

Qtd: 5

14:32:08
```

Cada item ocupa uma linha visual.

Não utilizar tabelas.

---

# Ordenação

Sempre:

Mais recente

↓

Mais antiga

Inserção no topo.

---

# Limite

Histórico em memória:

100 registros.

Interface:

Exibir apenas os últimos 10.

Preparar paginação futura.

---

# Atualização

Nova leitura.

↓

HistoryService.add()

↓

Atualiza sessão.

↓

Notifica interface.

↓

Renderiza novo item.

Jamais reconstruir toda a lista.

---

# Remoção

Ao ultrapassar:

100 registros.

Remover automaticamente o mais antigo.

FIFO.

---

# HistoryCard

Responsável apenas por renderizar um registro.

Receber dados via props.

Sem lógica.

---

# HistoryStatusChip

Exibir status.

SUCCESS

Verde.

ERROR

Vermelho.

DUPLICATE

Amarelo.

MANUAL

Azul.

IGNORED

Cinza.

Seguir RFC-0000.

---

# Timestamp

Formato:

```text
14:32:08
```

Utilizar horário local.

---

# Quantidade

Formato:

```text
Qtd: 5
```

Sempre visível.

---

# Estado Vazio

Enquanto não houver leituras:

```text
Nenhuma leitura realizada.
```

Centralizado.

Sem animações.

---

# Pesquisa

Preparar arquitetura para:

```text
barcode

description

status
```

Nesta RFC não implementar interface.

---

# Eventos

Criar:

```text
HISTORY_ADDED

HISTORY_UPDATED

HISTORY_REMOVED

HISTORY_CLEARED
```

Emitidos pelo HistoryService.

---

# Sessão

Criar:

HistorySession.

Armazenar:

```text
sessionId

startedAt

totalReads

successReads

errorReads

duplicateReads

manualReads
```

Atualização automática.

---

# Performance

Utilizar lista virtual apenas se necessário.

Nesta RFC:

Renderizar no máximo:

10 registros.

Utilizar:

React.memo

para HistoryCard.

---

# React

Criar:

```text
useHistory()
```

Responsável apenas por observar alterações.

Nunca modificar dados diretamente.

---

# Logs

Adicionar:

```text
History Added

History Removed

History Updated

History Cleared
```

---

# Compatibilidade

HTML5

Android

Capacitor

Scanner Nativo

Sem dependências específicas da plataforma.

---

# Preparação para Futuras RFCs

O modelo deverá suportar futuramente:

* desfazer última leitura;
* exportação da sessão;
* pesquisa;
* filtros;
* agrupamento por produto;
* estatísticas;
* sincronização offline.

Não implementar essas funcionalidades nesta RFC.

---

# Critérios de Aceite

✔ Histórico atualizado automaticamente.

✔ Inserção no topo.

✔ Limite de 100 registros em memória.

✔ Exibição dos últimos 10 registros.

✔ Cada item exibe código, produto, quantidade, horário e status.

✔ Estado vazio implementado.

✔ Eventos funcionando.

✔ Build executando normalmente.

✔ Nenhuma regressão.

---

# Não Fazer

Não alterar ScannerPipeline.

Não alterar ScannerService.

Não alterar Inventário.

Não alterar Sincronização.

Não implementar exportação.

Não implementar filtros visuais.

Não implementar pesquisa.

Não implementar desfazer leitura.

Não persistir dados em banco.

Não utilizar tabelas.

Não adicionar lógica de negócio aos componentes React.

O Histórico deve funcionar como um registro de sessão desacoplado da lógica de inventário, servindo como fonte de informação para a interface e como base para futuras funcionalidades de auditoria e produtividade.
