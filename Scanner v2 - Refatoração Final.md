# Scanner v2 - Refatoração Final

## Objetivo

Transformar o Scanner em um módulo desacoplado, reutilizável e com experiência semelhante a um coletor profissional, mantendo toda a regra de negócio existente.

---

# Arquitetura

## Refatorar Plugin Android

Estrutura:

```text
android/scanner/
├── BarcodeScannerPlugin.java
├── CameraController.java
├── BarcodeAnalyzer.java
├── BarcodeProcessor.java
├── TorchController.java
├── ZoomController.java
└── CameraUtils.java
```

### Regras

- Uma responsabilidade por classe.
- Plugin apenas coordena.
- Remover lógica do Plugin.
- Evitar classes grandes.

---

## Pipeline

Fluxo obrigatório:

```text
Camera
   ↓
BarcodeAnalyzer
   ↓
BarcodeProcessor
   ↓
Validação
   ↓
Evento
   ↓
React
```

React nunca deve processar frames.

---

## ScannerService

Manter abstração atual.

React nunca pode conhecer:

- html5-qrcode
- CameraX
- ML Kit

Apenas:

```text
ScannerService
```

---

## Eventos

Padronizar:

```text
cameraReady
cameraError
barcodeDetected
torchChanged
zoomChanged
```

---

## Validação

Aceitar leitura somente quando:

- 2 leituras consecutivas iguais

ou

- 3 leituras em até 500ms

Ignorar leituras repetidas.

---

# Performance

Implementar:

- Autofocus contínuo
- Auto Exposure
- Auto White Balance
- Resolução máxima disponível
- Zoom automático
- Torch automática
- Throttle de eventos
- React recebe apenas leituras válidas

---

# Interface

## Objetivo

A tela deve parecer um coletor profissional e não apenas uma câmera.

Layout:

```text
══════════════════════════════

Inventário

Itens: 143

══════════════════════════════

██████████████████████████████

╔══════════════════════════╗

║                          ║

║        Scanner           ║

║                          ║

╚══════════════════════════╝

██████████████████████████████

Último código

7891234567890

Produto

Coca-Cola 2L

Quantidade

5

══════════════════════════════
```

---

## Informações da tela

Adicionar:

- Contador de itens
- Último código lido
- Nome do produto
- Quantidade
- Status do scanner

Estados:

```text
Procurando...

↓

Código encontrado

↓

Confirmado
```

---

## Overlay

Durante a leitura mostrar área de captura.

```text
──────────────

▒▒▒▒▒▒▒▒▒▒▒▒▒

╔════════════╗

║████████████║

╚════════════╝

▒▒▒▒▒▒▒▒▒▒▒▒▒
```

Ao detectar um código:

- Overlay fica verde
- Mostrar bounding box
- Beep
- Vibração

---

## Feedback de leitura

Após confirmar:

```text
✔ Produto encontrado

Coca-Cola 2L

Quantidade

[ + ]
```

Exibir por aproximadamente 300ms.

Depois retornar automaticamente ao scanner.

Não fechar a câmera.

---

## Fluxo

```text
Abrir Scanner

↓

Procurando...

↓

Código Detectado

↓

Overlay Verde

↓

Beep

↓

Vibração

↓

Produto Encontrado

↓

300ms

↓

Volta para leitura
```

---

## UX

Adicionar:

- Botões grandes
- Alto contraste
- Área de leitura destacada
- Lanterna sempre visível
- Zoom sempre visível
- Feedback visual imediato
- Scanner contínuo
- Sem telas intermediárias

---

# Logs

Registrar apenas em DEBUG:

- Tempo primeira leitura
- Tempo médio
- Resolução
- FPS
- Modelo da câmera
- Erros

---

# Limpeza

Remover:

- Código morto
- Imports não utilizados
- Dependências antigas
- Comentários obsoletos

---

# Critérios

- Plugin < 250 linhas
- Classes pequenas
- React desacoplado
- Scanner reutilizável
- HTML5 e Nativo compatíveis
- Sem alteração das regras de negócio
- Leitura contínua
- Feedback imediato
- Interface semelhante a coletor profissional