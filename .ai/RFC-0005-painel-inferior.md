# RFC-0005 - Painel Inferior Inteligente

**Status:** Aprovado

**Prioridade:** Alta

**Dependências:**

* RFC-0000 - Design System
* RFC-0001 - Layout Profissional
* RFC-0002 - Overlay Inteligente
* RFC-0003 - Scanner Contínuo
* RFC-0004 - Feedback

---

# Objetivo

Transformar o painel inferior em um HUD (Heads-Up Display) permanente.

O painel deve concentrar todas as informações necessárias para o operador, evitando qualquer navegação ou popup durante a coleta.

O operador nunca deverá perder o contexto da leitura.

---

# Objetivos de UX

Após cada leitura o operador deve visualizar imediatamente:

* Código lido
* Produto encontrado
* Quantidade atual
* Total de itens coletados
* Histórico recente

Sem mover a câmera.

Sem trocar de tela.

Sem abrir modais.

---

# Regras

Não alterar:

* ScannerPipeline
* ScannerService
* ScannerProvider
* Inventário
* Sincronização
* Layout superior

Esta RFC altera apenas o painel inferior.

---

# Estrutura

Criar:

```text
src/components/scanner/footer/

ScannerFooter.jsx

LastReadCard.jsx

ProductCard.jsx

QuantityControl.jsx

InventorySummary.jsx

HistoryPanel.jsx

HistoryItem.jsx

FooterDivider.jsx

index.js
```

Caso algum componente já exista:

Refatorar.

Não duplicar.

---

# Estrutura Geral

```text
══════════════════════════════════════

Último Código

7891234567890

──────────────────────────────────────

Produto

Coca-Cola 2L

Refrigerante 2 Litros

──────────────────────────────────────

Quantidade

[-]      5      [+]

──────────────────────────────────────

Itens Coletados

143

──────────────────────────────────────

Últimas Leituras

✔ 7891234567890

✔ 7891234567888

✔ 7891234567001

══════════════════════════════════════
```

O painel permanece sempre visível.

---

# Layout

O painel deve ocupar aproximadamente:

35% da altura útil.

Nunca ocultar completamente.

Nunca utilizar Drawer.

Nunca utilizar BottomSheet.

---

# Último Código

Sempre mostrar:

Código de barras.

Fonte grande.

Monoespaçada.

Exemplo:

```text
7891234567890
```

Caso não exista leitura:

```text
Aguardando leitura...
```

---

# Produto

Sempre mostrar:

Descrição principal.

Descrição secundária (quando disponível).

Exemplo:

```text
Coca-Cola 2L

Refrigerante PET
```

Caso não encontrado:

```text
Produto não localizado
```

---

# Quantidade

Utilizar componente próprio.

Layout:

```text
[-]     5     [+]
```

Botões:

48x48.

Área confortável.

Nunca utilizar Input numérico simples.

---

# Regras da Quantidade

Incremento:

+1

Decremento:

-1

Nunca permitir valor menor que 1.

As regras de inventário permanecem inalteradas.

---

# Itens Coletados

Sempre mostrar contador.

Formato:

```text
Itens

143
```

Atualização imediata.

Sem animações exageradas.

---

# Histórico

Mostrar apenas:

Últimas 5 leituras.

Formato:

```text
✔ 7891234567890

Coca-Cola 2L
```

Cada item deve possuir:

Código.

Descrição.

Horário (quando disponível).

---

# Atualização

Nova leitura.

↓

Novo item inserido.

↓

Itens antigos descem.

↓

Último excedente removido.

Nunca recriar toda a lista.

---

# HistoryItem

Responsável apenas por renderizar uma leitura.

Receber dados via props.

Sem lógica.

---

# InventorySummary

Responsável apenas por:

Itens coletados.

Quantidade total.

Nenhuma regra.

---

# ProductCard

Responsável apenas por:

Nome.

Descrição.

Código.

---

# LastReadCard

Responsável apenas por:

Último código.

---

# QuantityControl

Responsável apenas pela interface.

Toda regra permanece fora.

---

# FooterDivider

Componente reutilizável.

Padronizar separadores.

---

# Cores

Seguir RFC-0000.

Não criar novas cores.

Produto encontrado:

Texto normal.

Produto não encontrado:

Cor de alerta.

---

# Estados

## READY

```text
Aguardando leitura...
```

---

## SUCCESS

Mostrar produto.

Mostrar quantidade.

Atualizar histórico.

---

## ERROR

Manter último produto válido.

Mostrar mensagem temporária.

Nunca limpar painel.

---

## DUPLICATE

Não alterar painel.

Exibir apenas feedback discreto.

---

# Persistência Visual

Mesmo durante:

PROCESSING

SUCCESS

COOLDOWN

O painel permanece visível.

Nunca desmontar.

---

# Performance

Histórico:

Utilizar lista limitada.

Máximo:

5 itens.

Evitar renderizações completas.

Utilizar React.memo.

---

# React

Separar componentes.

Cada componente deve possuir uma única responsabilidade.

Utilizar:

React.memo

useMemo

useCallback

quando necessário.

---

# Animações

Permitidas apenas:

Fade.

Slide Vertical.

Duração:

200 ms.

Nunca utilizar animações longas.

---

# Acessibilidade

Contraste adequado.

Botões grandes.

Área mínima de toque:

48x48.

---

# Logs

Adicionar logs.

```text
History Updated

Quantity Updated

Last Product Updated
```

---

# Critérios de Aceite

✔ Painel permanece sempre visível.

✔ Último código atualizado imediatamente.

✔ Produto atualizado imediatamente.

✔ Quantidade permanece acessível.

✔ Histórico limitado às últimas cinco leituras.

✔ Nenhum popup.

✔ Nenhum modal.

✔ Nenhuma troca de tela.

✔ Componentes reutilizáveis.

✔ Build funcionando.

✔ Sem regressões.

---

# Não Fazer

Não alterar ScannerPipeline.

Não alterar ScannerService.

Não alterar ScannerProvider.

Não alterar Layout superior.

Não alterar Overlay.

Não alterar Feedback.

Não implementar Dashboard.

Não alterar regras de inventário.

Não adicionar lógica de negócio aos componentes visuais.

Não limpar o painel após uma leitura.

Não esconder informações durante PROCESSING ou COOLDOWN.

O painel inferior deve funcionar como um HUD permanente, oferecendo ao operador todas as informações necessárias para uma operação contínua de inventário sem interrupções.
