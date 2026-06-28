# RFC-0006 - Toolbar Inteligente do Scanner

**Status:** Aprovado

**Prioridade:** Alta

**Dependências:**

* RFC-0000 - Design System
* RFC-0001 - Layout Profissional
* RFC-0002 - Overlay Inteligente
* RFC-0003 - Scanner Contínuo
* RFC-0004 - Feedback
* RFC-0005 - Painel Inferior

---

# Objetivo

Transformar a Toolbar em um painel de controle profissional do scanner.

A Toolbar deve fornecer acesso rápido às funções do scanner sem interromper o fluxo de inventário.

Ela deve permanecer fixa durante toda a sessão.

Nenhuma ação da Toolbar poderá desmontar ou reinicializar o scanner, exceto o botão de fechar.

---

# Objetivos de UX

O operador deve conseguir:

* visualizar o status do scanner;
* ligar/desligar a lanterna;
* controlar o zoom;
* acessar configurações rápidas;
* sair do scanner.

Tudo com apenas um toque.

---

# Regras

Não alterar:

* ScannerPipeline
* ScannerService
* Inventário
* Sincronização
* Overlay
* Painel Inferior

Esta RFC altera apenas a Toolbar e sua integração com os serviços existentes.

---

# Estrutura

Criar:

```text
src/components/scanner/toolbar/

ScannerToolbar.jsx

ToolbarButton.jsx

TorchButton.jsx

ZoomButton.jsx

SettingsButton.jsx

CloseButton.jsx

ScannerStatusIndicator.jsx

ToolbarDivider.jsx

index.js
```

Criar:

```text
src/hooks/

useToolbar.js
```

Criar:

```text
src/services/toolbar/

ToolbarService.js
```

---

# Layout

```text
┌──────────────────────────────────────────────┐

← Inventário

                    🟢

           🔦   ➖   ➕   ⚙️   ✕

└──────────────────────────────────────────────┘
```

A Toolbar deve permanecer fixa no topo.

Nunca esconder durante a coleta.

---

# Componentes

ScannerToolbar

Componente agregador.

Responsável apenas pela composição.

---

ToolbarButton

Componente base reutilizável.

Todos os botões deverão herdar deste componente.

---

TorchButton

Responsável apenas pela lanterna.

---

ZoomButton

Responsável apenas pelo zoom.

---

SettingsButton

Responsável apenas pelo acesso às configurações.

Nesta RFC apenas emitir evento.

Não abrir tela de configurações.

---

CloseButton

Responsável por encerrar a sessão do scanner.

Deve utilizar o fluxo atual da aplicação.

Nunca finalizar serviços diretamente.

---

ScannerStatusIndicator

Exibir apenas o estado atual do scanner.

Receber estado via props.

Nunca acessar ScannerService.

---

ToolbarDivider

Separador visual reutilizável.

---

# Status

Mostrar indicador discreto.

Estados:

READY

```text
🟢
```

PROCESSING

```text
🟡
```

ERROR

```text
🔴
```

PAUSED

```text
⏸
```

Sem textos.

Apenas indicador visual.

---

# Lanterna

Estados:

Desligada

```text
🔦
```

Ligada

Ícone destacado.

Ao tocar:

Solicitar alteração ao ScannerService.

Caso não exista suporte:

Botão permanece desabilitado.

Nunca lançar erro.

---

# Zoom

Dois botões.

```text
➖

➕
```

Incremento padrão:

0.5x

Nunca ultrapassar os limites informados pelo ScannerService.

Caso não exista suporte:

Desabilitar controles.

---

# Configurações

Nesta RFC:

Emitir apenas:

```text
OPEN_SCANNER_SETTINGS
```

Nenhuma tela deverá ser aberta.

A implementação ocorrerá na RFC de Configurações.

---

# Fechar

Ao pressionar:

Utilizar exatamente o fluxo atual da aplicação.

Nunca destruir manualmente:

Camera

Pipeline

ScannerProvider

ScannerService

Toda finalização deve ocorrer pelos mecanismos existentes.

---

# ToolbarService

Responsável por:

receber comandos da interface;

validar disponibilidade;

delegar ao ScannerService.

Nenhuma lógica de renderização.

---

# useToolbar()

Responsável por:

estado da Toolbar;

disponibilidade de recursos;

eventos.

Não acessar diretamente a interface.

---

# Disponibilidade

Cada botão deve consultar:

```text
torchAvailable

zoomAvailable
```

Botões indisponíveis:

Desabilitados.

Nunca ocultos.

---

# Estados Visuais

Botão normal.

Botão pressionado.

Botão ativo.

Botão desabilitado.

Seguir RFC-0000.

---

# Área de Toque

Todos os botões:

48 x 48 px

Espaçamento uniforme.

---

# Animações

Permitidas:

Fade

Scale

Opacity

Máximo:

150 ms

Nunca utilizar animações longas.

---

# Performance

Todos os botões devem utilizar:

React.memo

Evitar renderizações desnecessárias.

Mudanças de estado devem afetar apenas o botão correspondente.

---

# Responsabilidades

ScannerToolbar

Layout.

ToolbarButton

Componente base.

TorchButton

Lanterna.

ZoomButton

Zoom.

SettingsButton

Configurações.

CloseButton

Fechar.

ScannerStatusIndicator

Estado.

ToolbarService

Integração.

useToolbar

Estado.

---

# Logs

Adicionar logs:

```text
Torch Enabled

Torch Disabled

Zoom +

Zoom -

Open Settings

Close Scanner
```

---

# Compatibilidade

HTML5

Capacitor

Android

Caso algum recurso não exista:

Desabilitar botão.

Nunca remover.

Nunca lançar exceção.

---

# Critérios de Aceite

✔ Toolbar fixa.

✔ Botões reutilizáveis.

✔ Indicador de status funcionando.

✔ Lanterna integrada ao ScannerService.

✔ Zoom integrado ao ScannerService.

✔ Botões desabilitados quando indisponíveis.

✔ Fechar utiliza fluxo atual.

✔ Nenhuma regressão.

✔ Build funcionando.

---

# Não Fazer

Não implementar tela de Configurações.

Não alterar ScannerPipeline.

Não alterar ScannerProvider.

Não alterar Inventário.

Não alterar Sincronização.

Não alterar Overlay.

Não alterar Painel Inferior.

Não implementar Zoom Inteligente.

Não implementar Torch Automática.

Não adicionar lógica de negócio aos componentes.

Não destruir serviços diretamente.

A Toolbar deve funcionar apenas como uma camada de comandos da interface, delegando toda a execução aos serviços já existentes e mantendo o scanner ativo durante toda a sessão de inventário.
