# RFC-000 - Sprint 0
## Refatoração Estrutural

### Objetivo

Preparar a arquitetura do projeto para futuras implementações sem alterar comportamento, regras de negócio, interface ou fluxo da aplicação.

Esta Sprint é exclusivamente uma refatoração estrutural.

---

# Regras Obrigatórias

- NÃO alterar funcionalidades.
- NÃO alterar regras de negócio.
- NÃO alterar layout.
- NÃO alterar sincronização.
- NÃO alterar banco de dados.
- NÃO alterar APIs.
- NÃO alterar comportamento do Scanner.
- NÃO implementar novas funcionalidades.
- NÃO remover funcionalidades existentes.

---

# Objetivo Arquitetural

Separar responsabilidades entre:

- Interface
- Estado
- Serviços
- Scanner
- Hardware

Toda comunicação do Scanner deve passar pelo ScannerService.

Nenhuma página React poderá acessar diretamente qualquer implementação do Scanner.

---

# Estrutura

Criar ou reorganizar para:

```text
src/

components/
    scanner/
        ScannerView.jsx
        ScannerOverlay.jsx
        ScannerToolbar.jsx
        ScannerBottomPanel.jsx
        ScannerStatus.jsx

contexts/
    ScannerContext.jsx

hooks/
    useScanner.js

services/
    scanner/

utils/
    scanner/

core/
    events/
    types/
    constants/
    errors/
```

Caso algum componente já exista, apenas mover para a estrutura acima.

---

# Core

Criar:

ScannerEvents

```text
READY
STARTED
STOPPED
DETECTED
ERROR
TORCH_CHANGED
ZOOM_CHANGED
```

ScannerState

```text
IDLE
INITIALIZING
READY
SCANNING
PAUSED
ERROR
```

ScannerResult

```ts
code

format

timestamp
```

Criar ScannerError.

---

# Scanner Context

Criar ScannerContext.

Responsável por:

- estado
- scanner ativo
- eventos
- inicialização
- parada

Nenhuma página poderá controlar diretamente o scanner.

---

# Hook

Criar:

```text
useScanner()
```

Responsabilidades:

- iniciar
- parar
- pausar
- continuar
- última leitura
- estado
- eventos

Toda lógica do scanner deve sair das páginas.

---

# Scanner Service

Padronizar interface.

Todos os scanners devem implementar:

```ts
initialize()

start()

stop()

pause()

resume()

destroy()

setZoom()

toggleTorch()

isTorchAvailable()

isZoomAvailable()
```

Não alterar implementações.

Somente padronizar.

---

# Componentização

ScannerView

Responsável apenas pela câmera.

---

ScannerToolbar

Responsável apenas por:

- fechar
- zoom
- lanterna

---

ScannerStatus

Responsável apenas pelos estados.

---

ScannerOverlay

Responsável apenas pelo desenho do overlay.

Sem lógica.

---

ScannerBottomPanel

Responsável apenas por exibir:

- último código
- produto
- quantidade

Mesmo que ainda não sejam utilizados.

---

# Organização

Mover funções utilitárias para:

```text
utils/scanner/
```

Separar:

camera.js

events.js

validation.js

---

# Responsabilidades

Componentes

Somente interface.

Hooks

Somente estado.

Context

Compartilhamento.

Services

Comunicação.

Plugin

Hardware.

Android

Implementação.

---

# Limpeza

Eliminar:

- imports duplicados
- constantes duplicadas
- código morto
- funções duplicadas
- comentários desnecessários

Não alterar funcionamento.

---

# Critérios

Projeto deve compilar.

Projeto deve executar normalmente.

Nenhuma regressão.

Nenhuma mudança visual.

Nenhuma mudança funcional.

Arquitetura preparada para futuras implementações.

---

# Resultado Esperado

Após esta Sprint será possível implementar facilmente:

- Overlay profissional
- Scanner contínuo
- Feedback visual
- Painel inferior
- Histórico
- Zoom inteligente
- Torch automática

Sem necessidade de nova refatoração estrutural.

---

# Observações

Priorizar:

- Baixo acoplamento.
- Componentes pequenos.
- Uma responsabilidade por classe.
- Código reutilizável.
- Preparação para crescimento do projeto.

Não otimizar prematuramente.

Não alterar lógica existente.

Apenas reorganizar a arquitetura.