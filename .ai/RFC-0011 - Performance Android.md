# RFC-0011 - Performance Android

**Status:** Aprovado

**Prioridade:** Crítica

**Dependências:**

* RFC-0003 - Scanner Contínuo
* RFC-0007 - Máquina de Estados
* RFC-0009 - Pipeline Centralizado
* RFC-0009A - Scanner Session Manager
* RFC-0010 - Performance React

---

# Objetivo

Otimizar toda a execução do Scanner em dispositivos Android.

Após esta RFC o aplicativo deverá suportar sessões longas de inventário mantendo estabilidade, baixo consumo de recursos e resposta imediata ao operador.

O foco é otimizar:

* câmera;
* processamento;
* memória;
* CPU;
* bateria;
* renderização.

---

# Objetivos

Garantir:

* 60 FPS durante a captura;
* inicialização rápida da câmera;
* baixo consumo de memória;
* baixo consumo de bateria;
* estabilidade em sessões superiores a 10.000 leituras.

---

# Regras

Não alterar:

* regras de inventário;
* Pipeline;
* Layout;
* Feedback;
* Histórico.

Esta RFC trata apenas de otimizações da plataforma Android.

---

# Estrutura

Criar:

```text
android/

performance/

CameraPerformanceManager.kt

FrameRateController.kt

MemoryMonitor.kt

BatteryMonitor.kt

ThermalMonitor.kt

CameraLifecycleManager.kt

FrameAnalyzer.kt

ScannerPerformanceLogger.kt
```

Criar:

```text
src/

services/

performance/

AndroidPerformanceService.js

hooks/

useAndroidPerformance.js
```

---

# Arquitetura

```text
CameraX

↓

FrameAnalyzer

↓

ScannerService

↓

Pipeline

↓

ScannerSession

↓

Interface
```

Toda otimização deve ocorrer antes do Pipeline.

---

# CameraLifecycleManager

Responsável por:

* iniciar câmera;
* pausar;
* retomar;
* liberar recursos.

Nunca recriar câmera sem necessidade.

---

# Inicialização

A câmera deverá ser inicializada apenas uma vez por sessão.

Fluxo.

```text
Open Scanner

↓

Camera Init

↓

READY

↓

Leituras

↓

Close Scanner

↓

Release Camera
```

Nunca reinicializar entre leituras.

---

# CameraX

Configurar para:

* Preview contínuo;
* análise contínua;
* foco contínuo;
* exposição automática.

Evitar mudanças constantes de configuração.

---

# FrameAnalyzer

Receber frames continuamente.

Nunca bloquear a Thread da câmera.

Caso o Pipeline esteja ocupado:

Descartar o frame.

Nunca criar fila infinita.

---

# Estratégia de Frames

Sempre utilizar:

```text
KEEP_ONLY_LATEST
```

Nunca acumular frames.

Objetivo:

Processar sempre a imagem mais recente.

---

# Threads

Separar responsabilidades.

```text
Camera Thread

↓

Frame Analyzer Thread

↓

Scanner Thread

↓

Pipeline Thread

↓

UI Thread
```

Nunca executar Pipeline na UI Thread.

---

# CPU

Evitar:

* loops ativos;
* polling;
* espera ocupada.

Utilizar eventos.

---

# Memória

Evitar:

* criação contínua de objetos;
* ByteArray desnecessário;
* Bitmap intermediário.

Sempre reutilizar buffers.

---

# Object Pool

Aplicar para:

* FrameData;
* BarcodeResult;
* PipelineContext.

---

# Garbage Collector

Reduzir pressão sobre o GC.

Evitar:

```kotlin
Frame

↓

Bitmap

↓

ByteArray

↓

Bitmap

↓

Frame
```

Sempre reutilizar estruturas.

---

# Resolução

Utilizar resolução otimizada para leitura.

Priorizar:

720p

Caso disponível.

Evitar:

4K

1080p quando desnecessário.

---

# FPS

Meta:

Preview:

30 FPS

Renderização:

60 FPS

Pipeline:

Máxima velocidade possível.

---

# Autofocus

Configurar:

Continuous Picture.

Nunca solicitar foco manual após cada leitura.

---

# Auto Exposure

Manter automática.

Não recalcular continuamente.

---

# Torch

Alternar apenas sob solicitação.

Nunca alterar automaticamente nesta RFC.

---

# Thermal Monitor

Criar monitor.

Registrar:

* temperatura;
* throttling;
* redução de FPS.

Preparar futuras otimizações.

Não alterar comportamento nesta RFC.

---

# Battery Monitor

Registrar:

* consumo estimado;
* tempo de sessão;
* uso da câmera.

Sem interface.

---

# Memory Monitor

Registrar:

* heap utilizado;
* heap máximo;
* objetos ativos.

Sem interface.

---

# AndroidPerformanceService

Expor:

```text
getPerformance()

getMemory()

getBattery()

getThermal()

getCameraStatus()
```

Consumido apenas por Hooks.

---

# Hook

Criar:

```text
useAndroidPerformance()
```

Somente leitura.

Nunca alterar estado interno.

---

# ScannerService

Não realizar:

* alocação excessiva;
* conversões desnecessárias;
* processamento pesado.

Responsabilidade exclusiva:

Emitir BarcodeDetected.

---

# Pipeline

Nunca executar operações pesadas na Thread da câmera.

---

# Logs

Registrar:

```text
Camera Started

Camera Released

Frame Dropped

Frame Processed

Memory Usage

Battery Status

Thermal Status
```

Disponíveis apenas em modo de desenvolvimento.

---

# Métricas

Coletar:

```text
Frames recebidos

Frames descartados

FPS médio

Tempo médio de processamento

Tempo máximo

Uso de Heap

Sessão

Temperatura

Consumo estimado
```

Preparar Dashboard futuro.

---

# Compatibilidade

Android 10+

Capacitor

CameraX

ML Kit

Dispositivos intermediários

Dispositivos topo de linha

Todos devem utilizar exatamente a mesma estratégia.

---

# Performance Esperada

Inicialização da câmera:

```text
< 700 ms
```

Troca READY → DETECTING:

```text
< 50 ms
```

Pipeline completo:

```text
< 100 ms
```

Feedback visual:

```text
< 50 ms
```

Uso de memória estável durante:

```text
10.000 leituras
```

Sem crescimento contínuo.

---

# Critérios de Aceite

✔ Câmera inicializada apenas uma vez.

✔ CameraX configurada para KEEP_ONLY_LATEST.

✔ Pipeline executando fora da UI Thread.

✔ Frames antigos descartados.

✔ Objetos reutilizados.

✔ Sem recriação contínua de Bitmaps.

✔ Monitor de memória implementado.

✔ Monitor térmico implementado.

✔ Monitor de bateria implementado.

✔ Logs apenas em desenvolvimento.

✔ Build funcionando.

✔ Nenhuma regressão.

---

# Não Fazer

Não alterar ScannerPipeline.

Não alterar ScannerSessionManager.

Não alterar ScannerProvider.

Não alterar Layout.

Não alterar Overlay.

Não alterar Toolbar.

Não alterar Feedback.

Não alterar Histórico.

Não alterar regras de inventário.

Não implementar ajustes automáticos de FPS.

Não implementar Torch automática.

Não implementar redução dinâmica de resolução.

Não criar interface para métricas.

Não utilizar polling para monitoramento.

Todas as otimizações desta RFC devem ocorrer de forma transparente, mantendo a experiência do operador inalterada e preparando a aplicação para longas sessões de inventário com máxima estabilidade e desempenho.
