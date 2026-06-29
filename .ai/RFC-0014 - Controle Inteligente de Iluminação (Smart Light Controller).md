# RFC-0014 - Controle Inteligente de Iluminação (Smart Light Controller)

**Status:** Aprovado

**Prioridade:** Alta

**Dependências:**

* RFC-0012 - ML Kit Scanner
* RFC-0013 - Zoom Inteligente e Auto Focus
* RFC-0011 - Performance Android
* RFC-0009 - Pipeline Centralizado

---

# Objetivo

Implementar um controlador inteligente de iluminação para maximizar a velocidade e a confiabilidade das leituras em diferentes condições de luminosidade.

O sistema deverá controlar automaticamente a lanterna quando necessário, preservando sempre a possibilidade de controle manual pelo operador.

A arquitetura deverá ser preparada para futuras melhorias relacionadas à iluminação da câmera.

---

# Objetivos

Melhorar:

* leitura em ambientes escuros;
* estabilidade da exposição;
* velocidade da primeira leitura;
* economia de bateria;
* experiência do operador.

---

# Regras

Não alterar:

* ScannerPipeline;
* ScannerSessionManager;
* Layout;
* Inventário;
* Feedback;
* Histórico.

Toda lógica deverá permanecer restrita ao subsistema da câmera.

---

# Arquitetura

```text
CameraX

↓

FrameAnalyzer

↓

LightAnalyzer

↓

SmartLightController

↓

TorchController

↓

ExposureController

↓

ScannerPipeline
```

Toda decisão deverá ocorrer antes do Pipeline.

---

# Estrutura

Criar:

```text
android/

scanner/

SmartLightController.java

LightAnalyzer.java

AmbientLightEstimator.java

TorchController.java

TorchDecisionEngine.java

ExposureSynchronizer.java

LightMetrics.java
```

Criar:

```text
src/

services/

camera/

SmartLightService.js

hooks/

useSmartLight.js

useTorchState.js
```

---

# SmartLightController

Responsável por:

* analisar luminosidade;
* decidir quando utilizar a lanterna;
* evitar oscilações;
* sincronizar com Toolbar.

Nunca acessar React.

---

# LightAnalyzer

Receber continuamente:

```text
Frame

↓

Calcular brilho médio

↓

Enviar ao Decision Engine
```

Não utilizar sensores externos.

Toda análise será feita diretamente sobre os frames da câmera.

---

# AmbientLightEstimator

Calcular:

```text
luminosidade

contraste

regiões escuras

regiões saturadas
```

Gerar índice normalizado:

```text
0.0

↓

1.0
```

---

# TorchDecisionEngine

Receber:

```text
luminosidade

scannerState

manualOverride

torchAvailable
```

Retornar:

```text
TORCH_ON

ou

TORCH_OFF
```

---

# Estratégia

Luminosidade:

Menor que 0.25

↓

Ativar lanterna.

---

Entre 0.25 e 0.35

↓

Manter estado atual.

(Histerese)

---

Maior que 0.35

↓

Desligar lanterna.

---

# Histerese

Nunca alternar continuamente.

Após qualquer alteração.

Aguardar no mínimo:

```text
3 segundos
```

Antes de permitir nova decisão automática.

---

# Override Manual

Quando o operador alterar a lanterna pela Toolbar:

Desabilitar o modo automático por:

```text
15 segundos
```

Após esse período.

Retornar ao modo inteligente.

---

# Toolbar

Continuará exibindo:

* Lanterna ligada;
* Lanterna desligada;
* Modo automático (indicador opcional).

A Toolbar nunca decidirá o estado da lanterna.

Ela apenas enviará comandos ao SmartLightController.

---

# ExposureSynchronizer

Quando a lanterna estiver ligada.

Evitar alterações bruscas de exposição.

Permitir adaptação gradual.

Nunca alterar ISO manualmente.

---

# ScannerState

Durante:

```text
PROCESSING
```

Congelar decisões de iluminação.

Somente voltar a analisar após retornar para:

```text
READY
```

---

# ScannerSession

Registrar:

```text
torchEnabled

automaticTorch

manualOverride

lightLevel

tempoComLanterna

trocasDeEstado
```

---

# LightMetrics

Registrar:

```text
luminosidade média

tempo com lanterna

número de ativações

tempo de resposta

override manual

tempo sem iluminação adequada
```

Preparar Dashboard futuro.

---

# Eventos

Criar:

```text
LIGHT_ANALYZED

TORCH_ENABLED

TORCH_DISABLED

TORCH_MANUAL_OVERRIDE

TORCH_AUTO_RESTORED

EXPOSURE_SYNCHRONIZED
```

Emitidos exclusivamente pelo SmartLightController.

---

# Performance

A análise de luminosidade deverá consumir menos de:

```text
2 ms
```

Nunca bloquear:

* CameraX;
* Pipeline;
* Interface.

---

# Compatibilidade

Android 10+

CameraX

ML Kit

Dispositivos sem lanterna deverão continuar funcionando normalmente.

Nesses casos o controlador apenas registrará a indisponibilidade.

---

# Logs

Adicionar:

```text
Light Level

Torch Enabled

Torch Disabled

Manual Override

Auto Mode Restored

Exposure Updated
```

Somente em desenvolvimento.

---

# Critérios de Aceite

✔ LightAnalyzer implementado.

✔ SmartLightController implementado.

✔ Histerese funcionando.

✔ Override manual funcionando.

✔ ScannerPipeline inalterado.

✔ ScannerSession atualizada.

✔ Toolbar integrada.

✔ Compatível com dispositivos sem lanterna.

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

Não utilizar sensor de luminosidade do dispositivo.

Não implementar HDR.

Não alterar ISO manualmente.

Não implementar Night Mode.

Não implementar IA para iluminação.

Não controlar brilho da tela.

Não criar dependência entre iluminação e regras de negócio.

O Smart Light Controller deve atuar exclusivamente sobre os recursos de iluminação da câmera, analisando continuamente os frames para otimizar automaticamente o uso da lanterna e da exposição, preservando a arquitetura desacoplada construída nas RFCs anteriores e mantendo sempre a possibilidade de intervenção manual pelo operador.
