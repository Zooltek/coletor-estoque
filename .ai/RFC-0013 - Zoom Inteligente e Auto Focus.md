# RFC-0013 - Zoom Inteligente e Auto Focus

**Status:** Aprovado

**Prioridade:** Alta

**Dependências:**

* RFC-0012 - ML Kit Scanner
* RFC-0011 - Performance Android
* RFC-0007 - Máquina de Estados
* RFC-0009 - Pipeline Centralizado

---

# Objetivo

Implementar um sistema inteligente de Zoom e Foco utilizando CameraX + ML Kit para acelerar leituras, principalmente de códigos pequenos ou distantes.

O sistema deverá auxiliar o operador automaticamente, mantendo sempre a possibilidade de controle manual pela Toolbar.

---

# Objetivos

Melhorar:

* velocidade da primeira leitura;
* leitura de códigos pequenos;
* leitura em baixa luminosidade;
* estabilidade do foco;
* experiência do operador.

---

# Regras

Não alterar:

* ScannerPipeline;
* ScannerSessionManager;
* Inventário;
* Feedback;
* Histórico;
* Layout.

Esta RFC altera apenas o comportamento da câmera.

---

# Arquitetura

```text
CameraX

↓

FrameAnalyzer

↓

BarcodeResult

↓

SmartZoomController

↓

FocusController

↓

ExposureController

↓

Toolbar

↓

ScannerPipeline
```

Toda decisão ocorre antes do Pipeline.

---

# Estrutura

Criar:

```text
android/

scanner/

SmartZoomController.java

FocusRegionCalculator.java

ZoomDecisionEngine.java

ExposureManager.java

FocusAnimator.java

ZoomAnimator.java

CameraMetrics.java
```

Criar:

```text
src/

services/

camera/

SmartZoomService.js

hooks/

useSmartZoom.js

useCameraMetrics.js
```

---

# SmartZoomController

Responsável por:

* calcular zoom ideal;
* aplicar zoom suave;
* respeitar limites do hardware;
* sincronizar com Toolbar.

Nunca acessar React.

---

# Estratégia

Sempre iniciar em:

```text
Zoom = 1.0x
```

A partir daí:

* código pequeno → aproximar;
* código grande → manter;
* código muito próximo → afastar.

---

# ZoomDecisionEngine

Receber:

```text
boundingBox

frameWidth

frameHeight

confidence

timestamp
```

Retornar:

```text
zoomTarget
```

---

# Critérios de Zoom

Área ocupada pelo código:

Menor que 10%

↓

Aumentar zoom.

---

Entre 10% e 40%

↓

Manter.

---

Maior que 40%

↓

Reduzir zoom.

---

# Limites

Zoom mínimo:

```text
1.0x
```

Zoom máximo:

Utilizar limite informado pelo CameraX.

Nunca extrapolar.

---

# Aplicação

Nunca alterar o zoom instantaneamente.

Utilizar animação suave.

Tempo máximo:

```text
250 ms
```

---

# Frequência

Recalcular no máximo:

```text
5 vezes por segundo
```

Evitar oscilações.

---

# Histerese

Aplicar histerese.

Pequenas variações do boundingBox não devem gerar alteração de zoom.

Só alterar quando a diferença superar um limite configurável.

---

# FocusController

Configurar:

Continuous Auto Focus.

Quando um código for detectado:

Calcular sua região.

↓

Solicitar foco naquela região.

↓

Retornar ao foco contínuo.

Nunca executar foco manual repetidamente.

---

# FocusRegionCalculator

Receber:

```text
boundingBox
```

Converter para:

```text
MeteringPoint
```

Compatível com CameraX.

---

# ExposureManager

Quando houver baixa luminosidade:

Ajustar apenas exposição.

Não alterar ISO manualmente.

Não alterar balanço de branco.

---

# Toolbar

Continuará oferecendo:

* Zoom +;
* Zoom -;
* Reset Zoom.

Quando o operador alterar manualmente o zoom:

Desabilitar o Zoom Inteligente temporariamente por:

```text
5 segundos
```

Após esse período:

Retomar o modo automático.

---

# Overlay

Durante foco ativo:

Desenhar um pequeno retângulo sobre a região focada.

Cor:

Amarelo.

Após foco concluído:

Retornar ao overlay padrão.

---

# ScannerSession

Registrar:

```text
zoomAtual

zoomMáximo

zoomAutomático

ajustesRealizados

últimoFoco

tempoDeFoco
```

---

# CameraMetrics

Registrar:

```text
zoom médio

zoom máximo

tempo médio de foco

tempo médio até leitura

ajustes automáticos

ajustes manuais
```

---

# Eventos

Criar:

```text
SMART_ZOOM_STARTED

SMART_ZOOM_CHANGED

SMART_ZOOM_FINISHED

FOCUS_REQUESTED

FOCUS_COMPLETED

EXPOSURE_UPDATED
```

Emitidos exclusivamente pelos controladores da câmera.

---

# Performance

O cálculo de zoom deve consumir menos de:

```text
5 ms
```

A aplicação do zoom nunca deve bloquear:

* Preview;
* Pipeline;
* Interface.

---

# Compatibilidade

Android 10+

CameraX

ML Kit

Dispositivos sem suporte a zoom automático deverão continuar funcionando normalmente.

---

# Logs

Adicionar:

```text
Zoom Changed

Focus Requested

Focus Completed

Exposure Updated

Manual Zoom Override

Smart Zoom Disabled

Smart Zoom Enabled
```

Somente em desenvolvimento.

---

# Critérios de Aceite

✔ Zoom Inteligente implementado.

✔ Zoom manual preservado.

✔ Auto Focus contínuo.

✔ Foco na região do código.

✔ Zoom animado.

✔ Histerese implementada.

✔ Respeito aos limites do hardware.

✔ ScannerPipeline inalterado.

✔ Build funcionando.

✔ Nenhuma regressão.

---

# Não Fazer

Não alterar ScannerPipeline.

Não alterar ScannerSessionManager.

Não alterar Layout.

Não alterar Inventário.

Não alterar Feedback.

Não alterar Histórico.

Não implementar IA para previsão de movimento.

Não implementar rastreamento de múltiplos códigos.

Não implementar zoom digital acima do limite físico.

Não alterar brilho da tela.

Não controlar automaticamente a lanterna.

Não criar dependência entre Zoom Inteligente e regras de negócio.

O sistema de Zoom Inteligente deve atuar exclusivamente sobre os recursos da câmera, auxiliando o operador a obter leituras mais rápidas e estáveis, mantendo sempre a arquitetura desacoplada construída nas RFCs anteriores e preservando a possibilidade de intervenção manual pelo usuário.
