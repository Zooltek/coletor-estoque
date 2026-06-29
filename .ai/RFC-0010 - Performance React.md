# RFC-0010 - Performance React

**Status:** Aprovado

**Prioridade:** Crítica

**Dependências:**

* RFC-0003 - Scanner Contínuo
* RFC-0007 - Máquina de Estados
* RFC-0008 - Histórico Inteligente
* RFC-0009 - Pipeline Centralizado
* RFC-0009A - Scanner Session Manager

---

# Objetivo

Garantir que a interface permaneça fluida durante sessões prolongadas de inventário.

O React nunca deverá bloquear:

* Scanner
* Pipeline
* Camera
* Feedback

Mesmo após milhares de leituras consecutivas.

---

# Objetivos

Reduzir:

* re-renderizações;
* criação de objetos;
* recriação de funções;
* atualização de Contexts;
* renders em cascata.

---

# Problema Atual

Hoje uma única leitura pode atualizar diversos estados React.

Exemplo.

```text
Leitura

↓

Provider

↓

Overlay

↓

Toolbar

↓

Footer

↓

History

↓

Feedback

↓

Scanner

↓

App
```

Diversos componentes renderizam sem necessidade.

---

# Meta

Após esta RFC apenas os componentes afetados deverão renderizar.

Exemplo.

```text
Leitura

↓

Pipeline

↓

History

↓

HistoryList
```

Overlay permanece estático.

Toolbar permanece estática.

Camera permanece estática.

---

# Estrutura

Criar:

```text
src/

hooks/

performance/

useRenderTracker.js

useStableCallback.js

useStableObject.js

usePreviousValue.js

utils/

performance/

RenderCounter.js

MemoComparator.js

ObjectPool.js

BatchUpdater.js

PerformanceLogger.js
```

---

# Contextos

Dividir Contexts grandes.

Evitar:

```text
ScannerContext

↓

Tudo
```

Criar contextos específicos.

Exemplo.

```text
ScannerStateContext

HistoryContext

FeedbackContext

ToolbarContext

SessionContext
```

Cada componente deverá consumir apenas o necessário.

---

# React.memo

Aplicar em componentes puramente visuais.

Obrigatório em:

```text
Overlay

Toolbar

HistoryCard

HistoryList

Footer

ProductCard

StatusIndicator

ScannerFrame

ScannerMask
```

---

# Comparadores

Criar comparadores próprios.

```text
MemoComparator.js
```

Evitar comparação profunda.

Comparar apenas propriedades relevantes.

---

# useCallback

Obrigatório para:

* callbacks enviados via props;
* handlers de botões;
* eventos do scanner.

Nunca criar funções inline em listas.

---

# useMemo

Aplicar apenas quando houver ganho real.

Utilizar para:

* listas;
* objetos derivados;
* cálculos.

Não utilizar indiscriminadamente.

---

# Objetos

Evitar:

```javascript
<Component
    config={{
        zoom: zoom,
        torch: torch
    }}
/>
```

Criar objetos estáveis.

Utilizar:

```text
useStableObject()
```

---

# Arrays

Nunca recriar listas sem necessidade.

Exemplo proibido.

```javascript
const history=[...history];
```

Atualizar apenas quando houver alteração real.

---

# History

Renderizar apenas itens modificados.

Novo item.

↓

Inserir no topo.

↓

Itens antigos permanecem intactos.

Nunca reconstruir toda a lista.

---

# Scanner

O componente da câmera nunca deverá renderizar novamente após inicialização.

Critério.

```text
Render

↓

Inicialização

↓

Nunca mais
```

---

# Overlay

Overlay só poderá renderizar quando mudar:

* estado;
* animação.

Nunca por alteração de histórico.

---

# Toolbar

Toolbar só renderiza quando:

* zoom;
* lanterna;
* estado.

Nunca renderizar após leitura válida.

---

# Footer

Atualizar apenas:

* último produto;
* quantidade;
* resumo.

Não atualizar controles estáticos.

---

# Feedback

Utilizar estado interno.

Nunca atualizar App inteiro.

---

# ScannerProvider

Deixar de armazenar estados visuais.

Responsabilidades:

* fornecer serviços;
* expor Hooks;
* inicializar sessão.

Não armazenar estado transitório.

---

# SessionManager

Responsável por:

* métricas;
* último produto;
* última leitura.

React apenas observa Snapshot.

---

# Pipeline

Pipeline nunca poderá acessar Hooks.

Pipeline nunca poderá disparar renderizações.

Pipeline apenas emite eventos.

---

# Eventos

Utilizar EventEmitter interno.

Fluxo.

```text
Pipeline

↓

Evento

↓

Hook

↓

Componente
```

Nunca:

```text
Pipeline

↓

setState()
```

---

# RenderTracker

Criar ferramenta de diagnóstico.

Registrar:

```text
Componente

↓

Quantidade de renders

↓

Tempo médio

↓

Último motivo
```

Disponível apenas em desenvolvimento.

---

# PerformanceLogger

Registrar:

```text
Render Overlay

Render History

Render Toolbar

Render Footer

Render Camera
```

Não registrar em produção.

---

# ObjectPool

Criar pool para objetos reutilizáveis.

Evitar criação excessiva.

Aplicar em:

* PipelineContext;
* HistoryEntry;
* FeedbackEvent.

---

# BatchUpdater

Agrupar alterações.

Exemplo.

```text
Produto

+

Quantidade

+

Histórico

↓

Uma única atualização
```

---

# StrictMode

Garantir compatibilidade.

Nenhum efeito colateral poderá depender de render único.

---

# Profiling

Preparar projeto para React DevTools Profiler.

Sem dependências obrigatórias.

---

# Performance Esperada

Meta.

Renderização.

```text
Overlay

< 1 ms
```

Toolbar.

```text
< 1 ms
```

Footer.

```text
< 3 ms
```

History.

```text
< 5 ms
```

Render total por leitura.

```text
< 10 ms
```

---

# Uso de Memória

Sessão com:

10.000 leituras.

Não deverá apresentar crescimento contínuo de memória.

Evitar retenção de referências.

---

# React Dev

Adicionar logs opcionais.

```text
Render Overlay

Render Toolbar

Render Footer

Render History

Render Camera
```

Ativados apenas em desenvolvimento.

---

# Critérios de Aceite

✔ Camera renderiza apenas uma vez.

✔ Overlay renderiza apenas quando necessário.

✔ Toolbar não renderiza após leituras.

✔ History atualiza incrementalmente.

✔ Footer atualiza apenas dados alterados.

✔ ScannerProvider reduz responsabilidades.

✔ Contextos especializados.

✔ React.memo aplicado.

✔ Callbacks estabilizados.

✔ Objetos estáveis.

✔ Logs apenas em desenvolvimento.

✔ Projeto compilando.

✔ Nenhuma regressão.

---

# Não Fazer

Não alterar regras de inventário.

Não alterar ScannerPipeline.

Não alterar ScannerService.

Não alterar Layout.

Não alterar Feedback.

Não alterar Overlay.

Não alterar Toolbar.

Não alterar Histórico.

Não utilizar otimizações prematuras sem medição.

Não aplicar useMemo e useCallback indiscriminadamente.

Não criar estados duplicados.

Não mover lógica de negócio para componentes React.

A performance deve ser obtida principalmente pela separação correta de responsabilidades, renderizações previsíveis e fluxo orientado a eventos, e não por micro-otimizações isoladas.
