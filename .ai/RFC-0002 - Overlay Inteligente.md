# RFC-0002 - Overlay Inteligente

**Status:** Aprovado

**Dependência:** RFC-0000, RFC-0001

**Prioridade:** Alta

---

# Objetivo

Criar um Overlay profissional para o Scanner.

O Overlay deve transmitir confiança ao operador durante todo o processo de leitura.

Ele deve indicar visualmente:

* onde posicionar o código
* quando um código foi detectado
* quando a leitura foi confirmada
* quando ocorreu erro

Nenhuma lógica de leitura será implementada nesta RFC.

O Overlay será apenas visual.

---

# Regras

Não alterar:

* ScannerService
* ScannerProvider
* Hooks
* Pipeline de leitura
* ML Kit
* HTML5 Scanner

Implementar somente interface.

---

# Estrutura

Criar:

```text
src/components/scanner/

ScannerOverlay/

    ScannerOverlay.jsx

    OverlayFrame.jsx

    OverlayMask.jsx

    OverlayCorners.jsx

    OverlayAnimation.jsx

    OverlayStatus.jsx

    index.js
```

Separar responsabilidades.

Nenhum componente deverá possuir múltiplas funções.

---

# Hierarquia

```text
ScannerCameraArea

↓

ScannerOverlay

↓

OverlayMask

↓

OverlayFrame

↓

OverlayCorners

↓

OverlayAnimation

↓

OverlayStatus
```

---

# Layout

O Overlay deve ocupar toda a área da câmera.

```text
▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒

▒                                  ▒

▒      ╔══════════════════════╗     ▒

▒      ║                      ║     ▒

▒      ║                      ║     ▒

▒      ║      Código          ║     ▒

▒      ║                      ║     ▒

▒      ║                      ║     ▒

▒      ╚══════════════════════╝     ▒

▒                                  ▒

▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒
```

Área externa:

escurecida.

Área interna:

totalmente transparente.

Nunca aplicar blur.

---

# Dimensões

Janela de leitura:

Largura:

80%

Altura:

28%

Centralizada verticalmente.

Centralizada horizontalmente.

---

# Máscara

Escurecer toda a câmera.

Opacity:

0.55

Nunca esconder completamente a imagem.

---

# Frame

Criar moldura.

Espessura:

3px

Border Radius:

16px

Cor inicial:

Cinza.

---

# Cantos

Os quatro cantos devem ser destacados.

Formato:

```text
┌

┐

└

┘
```

Comprimento:

28px

Espessura:

4px

Radius:

8px

---

# Estados

## Estado

INITIALIZING

Frame:

Cinza

Texto:

Inicializando câmera...

---

## Estado

READY

Frame:

Branco

Texto:

Posicione o código dentro da área.

---

## Estado

DETECTING

Frame:

Amarelo

Texto:

Código detectado...

---

## Estado

SUCCESS

Frame:

Verde

Texto:

Leitura confirmada.

---

## Estado

ERROR

Frame:

Vermelho

Texto:

Não foi possível ler.

---

# Linha de Scan

Criar linha horizontal.

```text
═══════════════════════
```

Ela percorre lentamente a área de leitura.

Velocidade:

2 segundos.

Loop infinito.

Desativar automaticamente em:

SUCCESS

ERROR

---

# Animação

READY

Fade.

DETECTING

Pulse.

SUCCESS

Glow verde.

ERROR

Shake curto.

Máximo:

300ms.

---

# Texto Inferior

Abaixo da moldura.

Exemplo.

READY

```text
Posicione o código dentro da área
```

DETECTING

```text
Código detectado...
```

SUCCESS

```text
Leitura confirmada
```

ERROR

```text
Tente novamente
```

Centralizado.

---

# Indicador de Distância

Adicionar pequena dica.

```text
Mantenha aproximadamente 10–20 cm
```

Somente READY.

---

# OverlayStatus

Responsável apenas pelo texto.

Nunca acessar scanner.

Receber estado via props.

---

# OverlayAnimation

Responsável apenas pelas animações.

Nenhuma lógica.

---

# OverlayMask

Responsável apenas pela máscara.

---

# OverlayFrame

Responsável pela moldura.

---

# OverlayCorners

Responsável pelos quatro cantos.

---

# Cores

Seguir RFC-0000.

Cinza

Inicializando

Branco

Pronto

Amarelo

Detectando

Verde

Sucesso

Vermelho

Erro

Não criar novas cores.

---

# Performance

Utilizar:

CSS Transform

Opacity

Scale

Evitar:

top

left

width

height

durante animações.

---

# React

Utilizar:

React.memo

para componentes puramente visuais.

---

# Acessibilidade

Todos os textos devem possuir contraste adequado.

Nunca depender apenas da cor.

---

# Critérios de Aceite

* Overlay ocupa toda a câmera.
* Máscara escurecida.
* Área central transparente.
* Moldura centralizada.
* Cantos destacados.
* Linha de scan animada.
* Estados visuais implementados.
* Nenhuma alteração funcional.
* Nenhuma alteração no ScannerService.
* Nenhuma regressão.
* Build funcionando.

---

# Não Fazer

Não implementar Scanner Contínuo.

Não emitir eventos.

Não tocar beep.

Não vibrar.

Não alterar ML Kit.

Não alterar HTML5 Scanner.

Não alterar CameraX.

Não alterar Hooks.

Não alterar ScannerProvider.

Não adicionar lógica de leitura.

O Overlay deve ser exclusivamente um componente visual reutilizável, controlado apenas por propriedades recebidas da camada superior.
