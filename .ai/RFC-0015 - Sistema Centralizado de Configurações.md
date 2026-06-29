# RFC-0015 - Sistema Centralizado de Configurações

**Status:** Aprovado

**Prioridade:** Alta

**Dependências:**

* RFC-0009A - Scanner Session Manager
* RFC-0012 - ML Kit Scanner
* RFC-0013 - Zoom Inteligente
* RFC-0014 - Smart Light Controller

---

# Objetivo

Implementar um sistema centralizado de configurações para toda a aplicação.

Após esta RFC, nenhuma configuração deverá ficar espalhada entre componentes React, serviços ou módulos Android.

Toda configuração deverá ser gerenciada pelo **ConfigurationManager**.

---

# Objetivos

Centralizar:

* Scanner
* Câmera
* Zoom
* Lanterna
* Feedback
* Histórico
* Interface
* Performance
* Desenvolvedor

Preparar arquitetura para futuras funcionalidades.

---

# Regras

Não alterar:

* Inventário
* ScannerPipeline
* ScannerSessionManager
* StateMachine
* Histórico

Esta RFC implementa apenas a infraestrutura de configuração.

---

# Arquitetura

```text
React UI

↓

SettingsPage

↓

ConfigurationManager

↓

ConfigurationStore

↓

ConfigurationRepository

↓

Android / Web
```

A interface nunca deverá acessar o armazenamento diretamente.

---

# Estrutura

Criar:

```text
src/

core/

configuration/

ConfigurationManager.js

ConfigurationStore.js

ConfigurationRepository.js

ConfigurationDefaults.js

ConfigurationValidator.js

ConfigurationMigration.js

ConfigurationEvents.js

ConfigurationSnapshot.js

index.js

hooks/

useConfiguration.js

useScannerConfiguration.js

useCameraConfiguration.js

components/

settings/

SettingsPage.jsx

SettingsGroup.jsx

SettingsSection.jsx

SettingsItem.jsx

SettingsSwitch.jsx

SettingsSlider.jsx

SettingsSelect.jsx

SettingsNumber.jsx

SettingsFooter.jsx
```

---

# Responsabilidades

ConfigurationManager

Única fonte de verdade.

Responsável por:

* carregar;
* validar;
* salvar;
* migrar;
* emitir eventos.

Nunca acessar React.

---

ConfigurationStore

Armazenamento em memória.

---

ConfigurationRepository

Persistência.

Web:

LocalStorage.

Android:

Preferences.

Preparar sincronização futura.

---

ConfigurationValidator

Validar todos os valores.

Nunca permitir configurações inválidas.

---

ConfigurationMigration

Permitir atualização entre versões.

---

# Organização

As configurações deverão ser agrupadas.

```text
Scanner

Camera

Feedback

Interface

Performance

Developer
```

---

# Scanner

Criar:

```text
Scanner

↓

Scanner Contínuo

↓

Tempo mínimo entre leituras

↓

Formatos aceitos

↓

Confirmação manual

↓

Quantidade padrão
```

---

# Camera

Criar:

```text
Zoom Inteligente

Lanterna Inteligente

Zoom inicial

Zoom máximo

Auto Focus

Auto Exposure

Preferência do Scanner

Qualidade da câmera
```

---

# Feedback

Criar:

```text
Som

Vibração

Overlay

Banner

Tempo do feedback

Volume
```

---

# Interface

Criar:

```text
Tema

Animações

Mostrar histórico

Quantidade de itens

Modo compacto

Modo noturno (preparação)

Mostrar FPS (Debug)
```

---

# Performance

Criar:

```text
Logs

Métricas

Modo Benchmark

Modo Econômico

Monitor de Memória

Monitor Térmico

Monitor de Bateria
```

---

# Desenvolvedor

Criar:

```text
Logs detalhados

Pipeline

StateMachine

Session

Performance

Scanner

Overlay de Debug

Exportar Logs
```

Oculto por padrão.

---

# Estrutura da Configuração

Criar objeto.

```text
ConfigurationSnapshot

↓

scanner

camera

feedback

interface

performance

developer
```

Somente leitura.

---

# Eventos

Criar.

```text
CONFIGURATION_LOADED

CONFIGURATION_CHANGED

CONFIGURATION_RESET

CONFIGURATION_MIGRATED

CONFIGURATION_SAVED
```

---

# Persistência

Salvar automaticamente.

Sempre que houver alteração.

Utilizar debounce apenas para gravação.

Nunca para leitura.

---

# Backup

Criar métodos.

```text
exportConfiguration()

importConfiguration()

resetConfiguration()
```

Preparar futuras sincronizações.

---

# Versionamento

Toda configuração deverá possuir.

```text
version
```

Exemplo.

```text
1.0.0
```

Sempre validar durante o carregamento.

---

# Migração

Caso a estrutura mude.

```text
1.0

↓

1.1

↓

Migrar

↓

Salvar
```

Nunca perder configurações válidas.

---

# Hooks

Criar.

```text
useConfiguration()

useScannerConfiguration()

useCameraConfiguration()
```

Todos apenas leitura.

Alterações devem passar pelo ConfigurationManager.

---

# Interface

Layout.

```text
══════════════════════

Configurações

══════════════════════

► Scanner

► Câmera

► Feedback

► Interface

► Performance

► Desenvolvedor

══════════════════════
```

Cada grupo expansível.

---

# Pesquisa

Preparar arquitetura.

Pesquisar.

```text
Zoom

↓

Lanterna

↓

Som

↓

Tema
```

Não implementar nesta RFC.

---

# Performance

Configurações carregadas apenas uma vez na inicialização.

Snapshot imutável.

Atualizações pontuais.

Sem re-renderizações globais.

---

# Compatibilidade

Android

Web

PWA

Desktop

Todos utilizando exatamente o mesmo modelo de configuração.

---

# Logs

Adicionar.

```text
Configuration Loaded

Configuration Changed

Configuration Saved

Configuration Reset

Configuration Migrated
```

Somente desenvolvimento.

---

# Critérios de Aceite

✔ ConfigurationManager implementado.

✔ Configurações centralizadas.

✔ Snapshot somente leitura.

✔ Persistência funcionando.

✔ Migração preparada.

✔ Versionamento implementado.

✔ Interface organizada por grupos.

✔ Hooks funcionando.

✔ Build funcionando.

✔ Nenhuma regressão.

---

# Não Fazer

Não alterar ScannerPipeline.

Não alterar ScannerSessionManager.

Não alterar StateMachine.

Não alterar Inventário.

Não alterar Histórico.

Não implementar sincronização em nuvem.

Não implementar login de usuário.

Não implementar perfis de configuração.

Não implementar permissões.

Não implementar pesquisa.

Não adicionar lógica de negócio ao ConfigurationManager.

O ConfigurationManager deve funcionar como a única fonte de verdade para todas as configurações da aplicação, oferecendo uma arquitetura escalável, versionada e preparada para futuras funcionalidades, mantendo total desacoplamento entre interface, persistência e regras de negócio.
