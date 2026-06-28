# Arquitetura

## Objetivo

O Coletor Estoque é uma aplicação React + Capacitor voltada para inventário de estoque utilizando captura por câmera.

A arquitetura deve manter baixo acoplamento entre interface, regras de negócio e implementação do scanner.

---

# Camadas

UI

↓

Hooks

↓

Services

↓

Plugins

↓

Android / HTML5

---

## React

A interface nunca deve acessar diretamente:

- CameraX
- ML Kit
- html5-qrcode

Toda comunicação ocorre através do ScannerService.

---

## Scanner

O scanner deve ser modular.

ScannerService

↓

NativeScannerService

↓

Plugin Capacitor

↓

CameraController

↓

BarcodeAnalyzer

↓

BarcodeProcessor

---

## Regras

- Componentes pequenos.
- Hooks sem regras de negócio.
- Services sem UI.
- Plugin apenas coordena.
- Uma responsabilidade por classe.

---

## Objetivos

- Escalável.
- Testável.
- Reutilizável.
- Independente da implementação do scanner.