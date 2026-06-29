# RFC-0012 - ML Kit Scanner (Scanner Nativo Inteligente)

**Status:** Aprovado

**Prioridade:** Máxima

**Dependências:**

* RFC-0003 - Scanner Contínuo
* RFC-0007 - Máquina de Estados
* RFC-0009 - Pipeline Centralizado
* RFC-0009A - Scanner Session Manager
* RFC-0010 - Performance React
* RFC-0011 - Performance Android

---

# Objetivo

Implementar um Scanner Nativo baseado em Google ML Kit como mecanismo principal de leitura no Android.

O Scanner HTML5 continuará existindo como fallback para navegadores, PWA e ambientes onde o plugin nativo não estiver disponível.

Após esta RFC o Pipeline continuará exatamente o mesmo.

A única diferença será a origem da leitura.

---

# Arquitetura

```text
                  ScannerPipeline
                        ▲
                        │
         BarcodeDetected Event
                        │
      ┌─────────────────┴─────────────────┐
      │                                   │
NativeScannerService             Html5ScannerService
(CameraX + ML Kit)              (ZXing / BarcodeDetector)
      │                                   │
      └──────────── ScannerFactory ───────┘
```

Todo Scanner deverá emitir exatamente o mesmo evento.

---

# Objetivos

Priorizar:

* velocidade;
* estabilidade;
* baixa latência;
* leitura contínua;
* baixo consumo de bateria.

---

# Regras

Não alterar:

* ScannerPipeline
* StateMachine
* ScannerSessionManager
* Feedback
* Histórico
* Layout
* Inventário

Toda integração deve respeitar a arquitetura existente.

---

# Estrutura

Criar:

```text
android/

scanner/

MLKitScannerManager.java

BarcodeAnalyzer.java

CameraController.java

CameraConfiguration.java

FocusController.java

ExposureController.java

ZoomController.java

TorchController.java

ImageConverter.java

BarcodeResult.java

BarcodeMapper.java

```

Criar:

```text
src/

services/

scanner/

NativeScannerAdapter.js

ScannerFactory.js

ScannerCapabilities.js

ScannerDetector.js
```

---

# ScannerFactory

Responsável por escolher automaticamente o scanner.

Prioridade.

```text
Android Nativo

↓

ML Kit

↓

HTML5

↓

Fallback
```

Nunca decidir na interface.

---

# ScannerCapabilities

Criar objeto.

```text
supportsNative

supportsTorch

supportsZoom

supportsContinuousFocus

supportsAutoExposure

supportsMultipleBarcodes

supportsFormats
```

Consumido pela Toolbar.

---

# ScannerDetector

Detectar ambiente.

Exemplo.

```text
Capacitor Android

↓

NativeScanner

↓

Disponível

↓

Selecionar
```

---

# CameraX

Configuração obrigatória.

Preview

*

ImageAnalysis

*

LifecycleOwner

Nunca utilizar APIs legadas.

---

# Estratégia de Frames

Utilizar.

```text
KEEP_ONLY_LATEST
```

Obrigatório.

---

# ML Kit

Configurar apenas formatos necessários.

Inicialmente.

```text
EAN_13

EAN_8

UPC_A

UPC_E

CODE_39

CODE_93

CODE_128

ITF

CODABAR

QR_CODE

DATA_MATRIX

PDF417

AZTEC
```

Preparar para configuração futura.

---

# BarcodeAnalyzer

Responsável apenas por:

Receber ImageProxy.

↓

Enviar ao ML Kit.

↓

Mapear resultado.

↓

Emitir BarcodeDetected.

Nunca acessar React.

Nunca acessar Pipeline.

Nunca executar debounce.

Nunca validar.

---

# BarcodeMapper

Converter resultado do ML Kit para:

```text
BarcodeResult
```

Padronizado.

---

# BarcodeResult

Estrutura.

```text
rawValue

format

boundingBox

cornerPoints

timestamp

confidence

rotation

scannerType
```

---

# Confidence

Caso o ML Kit forneça.

Normalizar.

```text
0.0

↓

1.0
```

Preparar futuras decisões inteligentes.

---

# Múltiplos Códigos

Caso existam vários códigos.

Selecionar.

1

Maior área.

↓

2

Mais próximo do centro.

↓

3

Maior confiança.

↓

Emitir apenas um BarcodeDetected.

Preparar suporte futuro para múltiplos códigos.

---

# FocusController

Utilizar:

Continuous Auto Focus.

Nunca solicitar foco após cada leitura.

Criar interface para futuras melhorias.

---

# ExposureController

Auto Exposure.

Nunca recalcular continuamente.

---

# ZoomController

Integrar à Toolbar existente.

Respeitar limites do hardware.

---

# TorchController

Integrar à Toolbar existente.

Sem lógica automática.

---

# ImageConverter

Responsável apenas por conversões necessárias.

Evitar:

Bitmap.

Sempre trabalhar diretamente com ImageProxy quando possível.

---

# ScannerService

NativeScannerService deverá apenas:

```text
start()

stop()

pause()

resume()

destroy()

emitBarcodeDetected()
```

Nenhuma regra adicional.

---

# Pipeline

Continua inalterado.

Recebe exatamente os mesmos eventos.

---

# SessionManager

Registrar:

```text
scannerType

MLKIT

latência

tempo de leitura

formato
```

---

# Métricas

Registrar.

```text
Tempo ML Kit

Frames analisados

Frames descartados

FPS

Tempo primeira leitura

Formato

Scanner utilizado
```

---

# Performance Esperada

Primeira leitura.

```text
< 500 ms
```

Leitura contínua.

```text
< 100 ms
```

Pipeline.

```text
< 100 ms
```

Feedback.

```text
< 50 ms
```

---

# Compatibilidade

Android 10+

CameraX

ML Kit

Capacitor

HTML5

Desktop

PWA

O comportamento funcional deve ser idêntico em todas as plataformas.

---

# Logs

Adicionar.

```text
Native Scanner Started

Camera Ready

ML Kit Ready

Barcode Detected

Barcode Format

Detection Time

Pipeline Accepted

Pipeline Rejected

Native Scanner Stopped
```

Somente desenvolvimento.

---

# Tratamento de Erros

Falha ao iniciar ML Kit.

↓

Registrar erro.

↓

Selecionar automaticamente HTML5 Scanner.

↓

Continuar operação.

Nunca impedir o inventário.

---

# Critérios de Aceite

✔ ScannerFactory seleciona automaticamente o melhor scanner.

✔ ML Kit funciona como scanner principal.

✔ HTML5 permanece como fallback.

✔ Nenhuma alteração no Pipeline.

✔ Nenhuma alteração na StateMachine.

✔ Nenhuma alteração na SessionManager.

✔ CameraX utiliza KEEP_ONLY_LATEST.

✔ BarcodeAnalyzer apenas detecta.

✔ ScannerService não possui debounce.

✔ Toolbar controla Zoom e Torch.

✔ Projeto compila.

✔ Nenhuma regressão.

---

# Não Fazer

Não alterar regras de inventário.

Não alterar ScannerPipeline.

Não alterar ScannerSessionManager.

Não alterar Layout.

Não alterar Overlay.

Não alterar Feedback.

Não alterar Histórico.

Não implementar IA para escolha de código.

Não implementar zoom automático.

Não implementar foco automático inteligente.

Não implementar OCR.

Não implementar reconhecimento de texto.

Não implementar múltiplos códigos simultaneamente.

Não adicionar lógica de negócio ao ScannerService.

O objetivo desta RFC é substituir o mecanismo de captura por um Scanner Nativo baseado em CameraX + Google ML Kit, preservando integralmente toda a arquitetura construída nas RFCs anteriores e garantindo que qualquer tecnologia de captura continue utilizando o mesmo Pipeline centralizado de processamento.
