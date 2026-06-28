# RFC-0001 - Layout Profissional do Scanner

**Status:** Aprovado

**Dependência:** RFC-0000 - Design System

**Prioridade:** Alta

---

# Objetivo

Redesenhar completamente a tela do Scanner para que ela tenha aparência de um coletor profissional de inventário.

O usuário deve sentir que está utilizando um equipamento dedicado e não apenas uma câmera de celular.

Esta RFC altera exclusivamente a interface.

Nenhuma regra de negócio poderá ser modificada.

---

# Objetivos de UX

O operador deve conseguir identificar imediatamente:

* Quantos itens já foram coletados.
* Qual o status do scanner.
* Qual foi o último produto lido.
* Qual a quantidade informada.
* Se o scanner está pronto para nova leitura.

Toda informação deve permanecer visível durante toda a operação.

Nunca utilizar telas intermediárias.

Nunca esconder informações importantes.

---

# Regras Obrigatórias

Não alterar:

* ScannerService
* ScannerProvider
* Hooks
* Regras de Inventário
* Fluxo de leitura
* Sincronização

Alterar apenas a camada de apresentação.

---

# Estrutura

Criar:

```text
src/components/scanner/

ScannerLayout.jsx

ScannerHeader.jsx

ScannerCameraArea.jsx

ScannerFooter.jsx

ScannerInfoCard.jsx

ScannerCounter.jsx

ScannerStatusChip.jsx
```

Caso algum componente exista, reutilizar.

Não duplicar código.

---

# Estrutura da Tela

```
┌────────────────────────────────────────────┐
│ ← Inventário                 🔦   ⚙️   ✕    │
├────────────────────────────────────────────┤
│                                            │
│ Itens                    143               │
│                                            │
│ Status             🟢 Pronto               │
├────────────────────────────────────────────┤
│                                            │
│                                            │
│                                            │
│         Área da câmera                     │
│                                            │
│                                            │
│                                            │
├────────────────────────────────────────────┤
│ Último código                              │
│                                            │
│ 7891234567890                              │
│                                            │
│ Produto                                    │
│ Coca-Cola 2L                               │
│                                            │
│ Quantidade          [-]   5   [+]          │
├────────────────────────────────────────────┤
│ Últimas Leituras                           │
│                                            │
│ ✔ 7891234567890                            │
│ ✔ 7891234567880                            │
│ ✔ 7891234567001                            │
└────────────────────────────────────────────┘
```

---

# Header

Altura aproximada:

64px

Componentes:

* botão voltar
* título Inventário
* botão lanterna
* botão configurações
* botão fechar

Não utilizar AppBar padrão.

Criar componente próprio.

---

# Informações Superiores

Logo abaixo do Header.

Exibir:

Itens Coletados

```
143
```

Status

```
Pronto
```

Utilizar dois Cards.

Mesmo tamanho.

Mesmo alinhamento.

---

# Área da Câmera

Ocupar aproximadamente:

55% da altura útil.

Nunca ocupar a tela inteira.

A câmera deve parecer incorporada ao aplicativo.

Nunca parecer uma Activity separada.

---

# Scanner Camera Area

Responsável apenas por exibir:

* Preview
* Overlay
* Bounding Box

Nenhuma lógica.

---

# Footer

Sempre visível.

Nunca esconder.

Mesmo durante leitura.

---

# Informações

Exibir:

Último Código

Produto

Quantidade

Nunca utilizar popup.

Nunca utilizar modal.

---

# Quantidade

Utilizar controles laterais.

```
[-]     5     [+]
```

Botões grandes.

48x48.

Área de toque confortável.

---

# Histórico

Exibir as três últimas leituras.

Formato:

```
✔ 7891234567890

✔ Coca-Cola 2L
```

Apenas leitura.

Sem ações.

---

# Cores

Header

Background Card

Scanner

Seguir RFC-0000.

Não criar novas cores.

---

# Componentes

ScannerLayout

Responsável pela composição.

ScannerHeader

Somente Header.

ScannerCameraArea

Somente Preview.

ScannerFooter

Somente painel inferior.

ScannerInfoCard

Cards reutilizáveis.

ScannerCounter

Quantidade.

ScannerStatusChip

Status.

---

# Responsabilidades

Cada componente deve possuir apenas uma responsabilidade.

Máximo recomendado:

250 linhas.

---

# Estados

Header

Sempre visível.

Footer

Sempre visível.

Camera

Sempre visível.

Nunca desmontar componentes.

---

# Responsividade

Suportar:

Telefone

Tablet

Orientação retrato.

---

# Espaçamentos

Seguir RFC-0000.

Grid de 8.

Nunca utilizar margens aleatórias.

---

# Tipografia

Seguir RFC-0000.

Não criar fontes novas.

---

# Ícones

Utilizar apenas uma biblioteca.

Todos:

24x24.

---

# Animações

Fade de entrada.

Máximo:

300 ms.

Nenhuma animação longa.

---

# Performance

Evitar re-renderizações.

Utilizar React.memo quando aplicável.

Separar componentes de apresentação.

---

# Critérios de Aceite

* Layout semelhante a um coletor profissional.
* Header sempre visível.
* Área da câmera centralizada.
* Footer sempre visível.
* Informações organizadas.
* Nenhuma alteração funcional.
* Nenhuma regressão.
* Build executando normalmente.

---

# Não Fazer

Não alterar ScannerProvider.

Não alterar ScannerService.

Não alterar Hooks.

Não alterar Inventário.

Não alterar Sincronização.

Não implementar Scanner Contínuo.

Não implementar Overlay.

Não adicionar lógica ao Layout.

A RFC trata exclusivamente da composição visual da tela.
