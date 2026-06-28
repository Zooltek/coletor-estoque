# RFC-0009 - Pipeline Centralizado do Scanner

**Status:** Aprovado

**Prioridade:** Crítica

**Dependências:**

* RFC-0000 - Design System
* RFC-0003 - Scanner Contínuo
* RFC-0007 - Máquina de Estados
* RFC-0008 - Histórico

---

# Objetivo

Criar um Pipeline único para processamento de leituras de código de barras.

Após esta RFC:

* HTML5ScannerService
* NativeScannerService
* ML Kit
* CameraX

deverão possuir exatamente o mesmo comportamento.

Nenhum ScannerService poderá tomar decisões de negócio.

Toda decisão será centralizada no ScannerPipeline.

---

# Problema Atual

Hoje parte das decisões ocorre dentro do ScannerService.

Exemplos:

* debounce
* timeout
* bloqueio de leitura
* validações locais

Isso cria diferenças entre implementações.

Após esta RFC isso será eliminado.

---

# Nova Arquitetura

```text
Camera

↓

ScannerService

↓

BarcodeDetected

↓

ScannerPipeline

↓

StateMachine

↓

DuplicateReadGuard

↓

BarcodeValidator

↓

BusinessValidator

↓

HistoryService

↓

FeedbackService

↓

Interface
```

ScannerService apenas detecta.

Nunca interpreta.

---

# Estrutura

Criar:

```text
src/

core/

scanner/

pipeline/

ScannerPipeline.js

PipelineContext.js

PipelineResult.js

PipelineEvent.js

PipelineStage.js

PipelineExecutor.js

PipelineLogger.js

PipelineMetrics.js

guards/

DuplicateReadGuard.js

CooldownGuard.js

ValidationGuard.js

validators/

BarcodeValidator.js

BusinessValidator.js

ChecksumValidator.js

```

---

# Responsabilidades

ScannerPipeline

Coordenador principal.

Executa todas as etapas.

---

PipelineExecutor

Executa as etapas na ordem correta.

---

PipelineContext

Contexto compartilhado durante uma leitura.

---

PipelineMetrics

Coleta métricas.

---

PipelineLogger

Registra eventos.

---

DuplicateReadGuard

Evita leituras duplicadas.

---

CooldownGuard

Impede novas leituras durante cooldown.

---

BarcodeValidator

Valida formato do código.

Nunca consulta inventário.

---

BusinessValidator

Consulta regras existentes da aplicação.

Não altera regras.

---

ChecksumValidator

Valida códigos que possuem dígito verificador.

Preparar arquitetura.

Implementar apenas interface.

---

# Fluxo Oficial

```text
ScannerService

↓

Pipeline

↓

StateMachine

↓

CooldownGuard

↓

DuplicateReadGuard

↓

BarcodeValidator

↓

ChecksumValidator

↓

BusinessValidator

↓

HistoryService

↓

FeedbackService

↓

READY
```

A ordem é obrigatória.

---

# PipelineContext

Criar estrutura:

```text
barcode

rawValue

scannerType

startedAt

finishedAt

duration

currentState

metadata

validation

product

result
```

Compartilhado entre todas as etapas.

---

# PipelineResult

Estados possíveis:

```text
SUCCESS

ERROR

INVALID

DUPLICATE

COOLDOWN

IGNORED
```

Nenhum outro resultado.

---

# PipelineStage

Cada estágio deverá implementar:

```text
execute(context)

↓

PipelineResult
```

Nunca acessar React.

---

# Ordem

1

ScannerStateMachine

↓

READY?

---

2

CooldownGuard

↓

OK?

---

3

DuplicateReadGuard

↓

OK?

---

4

BarcodeValidator

↓

OK?

---

5

ChecksumValidator

↓

OK?

---

6

BusinessValidator

↓

Produto encontrado?

---

7

HistoryService

↓

Registrar

---

8

FeedbackService

↓

Executar

---

9

READY

↓

Nova leitura.

---

# ScannerService

Após detectar código.

Executar apenas:

```text
emitBarcodeDetected(barcode)
```

Nada mais.

---

# HTML5ScannerService

Remover:

debounce

timeout

duplicidade

cooldown

qualquer decisão.

Responsabilidade exclusiva:

Detectar.

Emitir.

---

# NativeScannerService

Mesmo comportamento.

Nunca implementar lógica própria.

---

# StateMachine

Apenas receber:

```text
transition()
```

Jamais executar validações.

---

# Guards

Cada Guard possui apenas uma responsabilidade.

DuplicateGuard

↓

Duplicidade.

CooldownGuard

↓

Cooldown.

ValidationGuard

↓

Validação.

Nunca misturar responsabilidades.

---

# Validações

BarcodeValidator

Formato.

Comprimento.

Caracteres.

---

BusinessValidator

Consultar exatamente a lógica existente.

Não alterar inventário.

Não alterar regras.

---

# Eventos

Criar:

```text
PIPELINE_STARTED

PIPELINE_SUCCESS

PIPELINE_ERROR

PIPELINE_DUPLICATE

PIPELINE_INVALID

PIPELINE_FINISHED
```

Emitidos pelo ScannerPipeline.

---

# PipelineLogger

Registrar:

```text
barcode

scanner

tempo

resultado

produto

estado
```

---

# PipelineMetrics

Coletar:

```text
tempo médio

tempo máximo

leituras válidas

leituras inválidas

duplicadas

cooldown

fps médio

scanner utilizado
```

Preparar Dashboard futuro.

Não implementar interface.

---

# Erros

Qualquer erro interno.

↓

PipelineResult.ERROR

↓

Feedback

↓

READY

Nunca travar Scanner.

---

# Performance

Pipeline totalmente síncrono até a validação de negócio.

Apenas consultas assíncronas quando necessário.

Nunca utilizar:

setTimeout()

como mecanismo de controle.

---

# React

Nenhum componente React poderá participar do Pipeline.

React apenas observa resultados.

---

# Testabilidade

Cada Guard.

Cada Validator.

Cada Stage.

Deve ser independente.

Preparar para testes unitários.

---

# Compatibilidade

HTML5

Native

CameraX

ML Kit

Scanners USB

Scanners Bluetooth

Todos utilizarão exatamente o mesmo Pipeline.

---

# Logs

Adicionar:

```text
Pipeline Started

Cooldown Passed

Duplicate Passed

Barcode Valid

Business Valid

History Saved

Feedback Executed

Pipeline Finished
```

---

# Critérios de Aceite

✔ ScannerService apenas detecta.

✔ Toda lógica centralizada no Pipeline.

✔ HTML5 e Native compartilham o mesmo comportamento.

✔ Debounce removido do ScannerService.

✔ Cooldown controlado pelo Pipeline.

✔ Duplicidade controlada pelo Pipeline.

✔ Validações desacopladas.

✔ Eventos funcionando.

✔ Métricas registradas.

✔ Logs implementados.

✔ Projeto compilando.

✔ Nenhuma regressão funcional.

---

# Não Fazer

Não alterar regras de inventário.

Não alterar sincronização.

Não alterar Layout.

Não alterar Overlay.

Não alterar Toolbar.

Não alterar Painel Inferior.

Não implementar Dashboard.

Não implementar estatísticas visuais.

Não implementar IA de leitura.

Não adicionar regras de negócio ao ScannerService.

Não utilizar debounce dentro do ScannerService.

Não utilizar timeouts para controlar o fluxo.

O ScannerPipeline passa a ser a única camada responsável por decidir quando uma leitura é aceita, rejeitada ou ignorada. Todos os serviços de captura devem se limitar a emitir eventos de leitura, garantindo comportamento consistente independentemente da tecnologia utilizada.
