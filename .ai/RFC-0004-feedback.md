# RFC-0004 - Feedback Visual, Sonoro e Tátil

**Status:** Aprovado

**Prioridade:** Alta

**Dependências:**

* RFC-0000 - Design System
* RFC-0001 - Layout do Scanner
* RFC-0002 - Overlay Inteligente
* RFC-0003 - Scanner Contínuo

---

# Objetivo

Implementar um sistema de feedback imediato para que cada leitura gere uma resposta perceptível ao operador.

O feedback deve confirmar que a leitura foi processada sem exigir que o operador desvie o olhar do código de barras.

O sistema deve funcionar tanto no Scanner HTML5 quanto no Scanner Nativo.

---

# Objetivos de UX

Após uma leitura válida o operador deve perceber imediatamente:

* confirmação visual;
* confirmação sonora;
* confirmação tátil;
* atualização das informações do produto.

Todo o feedback deve ocorrer em menos de 300 ms.

---

# Regras

Não alterar:

* Layout
* ScannerService
* ScannerPipeline
* Inventário
* Sincronização
* Regras de negócio

Esta RFC implementa apenas a camada de feedback.

---

# Diretórios

Criar:

```text
src/

components/

scanner/

feedback/

    ScanFeedback.jsx

    SuccessBanner.jsx

    ErrorBanner.jsx

    FeedbackAnimator.jsx

    FeedbackSound.js

    FeedbackVibration.js

    index.js

hooks/

useFeedback.js

services/

feedback/

FeedbackService.js
```

---

# Arquitetura

```text
ScannerPipeline

↓

FeedbackService

↓

Visual

Som

Vibração

↓

Scanner READY
```

O ScannerPipeline apenas dispara eventos.

FeedbackService decide quais feedbacks executar.

---

# Eventos

Consumir os eventos existentes:

```text
SCAN_ACCEPTED

SCAN_REJECTED

SCAN_DUPLICATED

ERROR
```

Nenhum componente deve acessar ScannerService.

---

# Feedback Visual

Quando:

SCAN_ACCEPTED

Executar:

Overlay verde.

↓

Banner de sucesso.

↓

Atualização do painel inferior.

↓

Fade-out.

---

# Banner

Exibir imediatamente.

Layout:

```text
══════════════════════════════

✔ Produto encontrado

Coca-Cola 2L

Quantidade

5

══════════════════════════════
```

Tempo:

300 ms

Nunca bloquear a câmera.

---

# Produto

Sempre mostrar:

Descrição

Código

Quantidade

Caso disponível.

---

# Overlay

Ao confirmar leitura:

Cinza

↓

Amarelo

↓

Verde

↓

READY

Sem desmontar.

---

# Feedback Sonoro

Criar:

FeedbackSound

Responsável apenas por reproduzir sons.

Não acessar React.

---

# Sons

Aceito

Beep curto.

Erro

Beep grave.

Duplicado

Beep discreto.

Nunca utilizar arquivos longos.

Tempo máximo:

120 ms

---

# Vibração

Criar:

FeedbackVibration

---

# Padrões

Aceito

```text
40 ms
```

Erro

```text
150 ms
```

Duplicado

Sem vibração.

---

# Desktop

Caso a plataforma não suporte vibração:

Ignorar silenciosamente.

Nunca lançar exceções.

---

# FeedbackService

Responsável por coordenar:

Som

Vibração

Banner

Overlay

Sem acessar componentes React.

---

# Hook

Criar:

```text
useFeedback()
```

Responsável por:

Escutar eventos.

↓

Disparar feedback.

↓

Encerrar animações.

---

# Estados

IDLE

Nenhum feedback.

---

SUCCESS

Overlay verde.

Banner.

Beep.

Vibração.

↓

Fade.

↓

READY

---

ERROR

Overlay vermelho.

Mensagem.

Beep grave.

↓

READY

---

DUPLICATE

Mensagem discreta.

Beep curto.

Sem vibração.

↓

READY

---

# Banner de Erro

Exemplo.

```text
═══════════════════════

⚠ Produto não encontrado

═══════════════════════
```

Tempo:

500 ms

---

# Banner de Duplicidade

```text
═══════════════════════

Código já processado

═══════════════════════
```

Tempo:

250 ms

Não interromper scanner.

---

# Animações

Utilizar apenas:

Fade

Scale

Opacity

Máximo:

300 ms

Nunca utilizar animações complexas.

---

# Performance

Todo feedback deve ocorrer de forma assíncrona.

Nunca bloquear:

Scanner

Camera

Pipeline

Renderização

---

# React

Utilizar:

React.memo

useCallback

Evitar re-renderizações.

---

# Responsabilidades

FeedbackService

Coordenação.

---

FeedbackSound

Som.

---

FeedbackVibration

Vibração.

---

FeedbackAnimator

Animações.

---

SuccessBanner

Mensagem positiva.

---

ErrorBanner

Mensagem negativa.

---

ScanFeedback

Componente agregador.

---

# Configuração

Criar opções:

```text
soundEnabled

vibrationEnabled

visualFeedbackEnabled
```

Inicialmente:

Todos habilitados.

Preparar para RFC de Configurações.

---

# Compatibilidade

HTML5

Android

Capacitor

Desktop

Caso algum recurso não exista:

Ignorar.

Nunca lançar erro.

---

# Logs

Adicionar logs.

```text
Feedback SUCCESS

Feedback ERROR

Feedback DUPLICATE
```

Facilitar depuração.

---

# Critérios de Aceite

Após leitura válida:

✔ Overlay muda para verde.

✔ Banner aparece.

✔ Produto exibido.

✔ Beep executado.

✔ Vibração executada.

✔ Scanner permanece ativo.

✔ Banner desaparece automaticamente.

✔ Scanner retorna para READY.

Após erro:

✔ Overlay vermelho.

✔ Banner de erro.

✔ Beep de erro.

✔ Retorno automático para READY.

Após duplicidade:

✔ Mensagem discreta.

✔ Sem vibração.

✔ Scanner continua ativo.

---

# Não Fazer

Não alterar ScannerPipeline.

Não alterar ScannerService.

Não alterar regras de inventário.

Não alterar sincronização.

Não implementar novas validações.

Não reinicializar câmera.

Não desmontar componentes.

Não bloquear renderização.

Não utilizar popups.

Não utilizar dialogs.

Não utilizar alert().

Todo o feedback deve ocorrer dentro da própria tela do scanner, mantendo o operador focado na coleta e permitindo leituras contínuas sem interrupções.
