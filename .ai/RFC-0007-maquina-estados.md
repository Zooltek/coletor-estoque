# RFC-0007 - Máquina de Estados do Scanner

**Status:** Aprovado

**Prioridade:** Crítica

**Dependências:**

* RFC-0000 - Design System
* RFC-0001 - Layout
* RFC-0002 - Overlay Inteligente
* RFC-0003 - Scanner Contínuo
* RFC-0004 - Feedback
* RFC-0005 - Painel Inferior
* RFC-0006 - Toolbar

---

# Objetivo

Centralizar todo o comportamento do Scanner em uma Máquina de Estados (Finite State Machine - FSM).

Após esta RFC:

* nenhum componente React poderá controlar diretamente estados do Scanner;
* nenhum timeout poderá alterar estados diretamente;
* nenhuma tela poderá assumir estados próprios.

Todo o Scanner deverá obedecer exclusivamente à FSM.

---

# Objetivos

Eliminar:

* estados inconsistentes;
* race conditions;
* múltiplas leituras simultâneas;
* timeouts espalhados;
* lógica duplicada.

---

# Arquitetura

```text
ScannerService

↓

ScannerPipeline

↓

ScannerStateMachine

↓

Eventos

↓

Interface
```

A Interface nunca altera estados.

Ela apenas reage.

---

# Estrutura

Criar:

```text
src/

core/

scanner/

state/

ScannerStateMachine.js

ScannerState.js

ScannerTransition.js

ScannerEvent.js

ScannerContext.js

StateValidator.js

StateLogger.js

index.js
```

---

# Responsabilidades

ScannerStateMachine

Controlar toda mudança de estado.

---

ScannerState

Enumeração oficial.

---

ScannerTransition

Mapa de transições.

---

ScannerEvent

Eventos públicos.

---

ScannerContext

Informações da sessão.

---

StateValidator

Validar mudanças.

---

StateLogger

Registrar histórico.

---

# Estados Oficiais

```text
IDLE

INITIALIZING

READY

DETECTING

PROCESSING

SUCCESS

ERROR

COOLDOWN

PAUSED

STOPPED
```

Nenhum outro estado poderá existir.

---

# Fluxo Principal

```text
IDLE

↓

INITIALIZING

↓

READY

↓

DETECTING

↓

PROCESSING

↓

SUCCESS

↓

COOLDOWN

↓

READY
```

---

# Fluxo de Erro

```text
READY

↓

DETECTING

↓

ERROR

↓

READY
```

---

# Fluxo de Pausa

```text
READY

↓

PAUSED

↓

READY
```

Utilizado por futuras funcionalidades.

---

# Fluxo de Encerramento

```text
READY

↓

STOPPED
```

Apenas ao sair do Scanner.

---

# Transições Permitidas

IDLE

↓

INITIALIZING

---

INITIALIZING

↓

READY

↓

ERROR

---

READY

↓

DETECTING

↓

PAUSED

↓

STOPPED

---

DETECTING

↓

PROCESSING

↓

ERROR

---

PROCESSING

↓

SUCCESS

↓

ERROR

---

SUCCESS

↓

COOLDOWN

---

COOLDOWN

↓

READY

---

ERROR

↓

READY

↓

STOPPED

---

PAUSED

↓

READY

↓

STOPPED

---

STOPPED

Nenhuma transição.

Estado final.

---

# Transições Proibidas

READY

↓

SUCCESS

❌

---

IDLE

↓

PROCESSING

❌

---

PROCESSING

↓

READY

❌

---

SUCCESS

↓

DETECTING

❌

---

COOLDOWN

↓

PROCESSING

❌

---

Qualquer transição inválida deverá ser rejeitada.

---

# StateValidator

Toda mudança deverá passar por:

```text
canTransition()

↓

true

↓

executa

ou

↓

false

↓

ignora
```

Nunca lançar exceção.

---

# ScannerContext

Armazenar:

```text
currentState

previousState

sessionId

startedAt

lastBarcode

lastAcceptedBarcode

lastTransition

transitionCount

error

cooldownUntil
```

Nenhum componente React poderá modificar essas informações.

---

# Eventos

Criar eventos oficiais.

```text
STATE_CHANGED

READY

DETECTING

PROCESSING

SUCCESS

ERROR

COOLDOWN

PAUSED

STOPPED
```

Todos emitidos pela FSM.

---

# Interface

Overlay

↓

escuta eventos.

---

Feedback

↓

escuta eventos.

---

Toolbar

↓

escuta eventos.

---

Painel

↓

escuta eventos.

Nenhum deles altera estados.

---

# ScannerPipeline

ScannerPipeline apenas solicita:

```text
transition()

```

Jamais modifica estados diretamente.

---

# Timeouts

Nenhum timeout poderá alterar estado.

Exemplo proibido.

```javascript
setTimeout(() => state = READY)
```

Sempre utilizar:

```javascript
stateMachine.transition("READY")
```

---

# Cooldown

Durante COOLDOWN.

Ignorar leituras.

Ao terminar.

FSM muda para READY.

---

# Logs

Criar:

StateLogger

Registrar.

```text
READY

↓

DETECTING

↓

PROCESSING

↓

SUCCESS

↓

COOLDOWN

↓

READY
```

Registrar timestamp.

Registrar duração.

Registrar motivo.

---

# Histórico

Armazenar últimas:

100 transições.

FIFO.

Facilitar depuração.

---

# Performance

StateMachine não depende de React.

Não utilizar:

useState

useReducer

Context

para armazenar estados internos.

A FSM deve funcionar como módulo independente.

---

# React

Criar Hook.

```text
useScannerState()
```

Responsável apenas por observar.

Nunca alterar.

---

# Componentes

Overlay

Toolbar

Footer

Feedback

Dashboard

Consumirão apenas:

```text
currentState
```

---

# Estado READY

Interface.

Overlay branco.

Scanner ativo.

Toolbar habilitada.

---

# Estado DETECTING

Overlay amarelo.

Linha de scan desacelera.

Scanner bloqueia novas leituras.

---

# Estado PROCESSING

Produto sendo validado.

Nenhuma interação necessária.

---

# Estado SUCCESS

Overlay verde.

Feedback executado.

Produto atualizado.

---

# Estado ERROR

Overlay vermelho.

Mensagem.

↓

READY.

---

# Estado PAUSED

Scanner continua inicializado.

Leituras ignoradas.

Interface permanece aberta.

---

# Estado STOPPED

Encerrar sessão.

Liberar recursos.

Fechar Scanner.

---

# Critérios de Aceite

✔ Existe apenas uma FSM.

✔ Estados centralizados.

✔ Nenhum componente altera estados diretamente.

✔ Todas as transições passam pelo Validator.

✔ Histórico funcionando.

✔ Logs funcionando.

✔ ScannerPipeline utiliza apenas transition().

✔ React apenas observa estados.

✔ Projeto compila.

✔ Sem regressões.

---

# Não Fazer

Não alterar ScannerService.

Não alterar Inventário.

Não alterar Sincronização.

Não alterar Layout.

Não alterar Overlay.

Não alterar Feedback.

Não alterar Toolbar.

Não alterar Painel.

Não implementar Dashboard.

Não implementar ML Kit.

Não implementar Zoom Inteligente.

Não implementar Torch Inteligente.

Não adicionar regras de negócio na FSM.

A Máquina de Estados deve controlar exclusivamente o ciclo de vida do Scanner, funcionando como a única fonte de verdade para todos os estados da aplicação.
