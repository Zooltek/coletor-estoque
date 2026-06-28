# RFC-0003 - Scanner Contínuo

Status: Aprovado

Prioridade: Crítica

Dependências:

- RFC-0000
- RFC-0001
- RFC-0002

---

# Objetivo

Transformar o scanner em um Scanner Contínuo.

Após uma leitura válida:

- NÃO fechar a câmera.
- NÃO desmontar a tela.
- NÃO reinicializar o Scanner.
- NÃO navegar entre páginas.

O Scanner permanece ativo durante toda a sessão de inventário.

O operador poderá realizar centenas de leituras consecutivas sem interrupção.

---

# Objetivos de UX

Após uma leitura válida o fluxo deverá ser:

Scanner ativo

↓

Código detectado

↓

Validação

↓

Inventário atualizado

↓

Feedback visual

↓

Scanner volta imediatamente para READY

↓

Próxima leitura

Sem qualquer troca de tela.

---

# Fluxo Atual

Scanner

↓

Lê

↓

Fecha

↓

Retorna

↓

Abre novamente

Esse fluxo deverá ser completamente eliminado.

---

# Novo Fluxo

Inicializa Scanner

↓

READY

↓

Detectando

↓

Código encontrado

↓

Validação

↓

Produto localizado

↓

Atualiza inventário

↓

Feedback visual

↓

Cooldown

↓

READY

↓

Nova leitura

---

# Diretórios

Não criar novos componentes visuais.

Criar apenas:

src/

services/

scanner/

ScannerPipeline.js

hooks/

useScannerPipeline.js

core/

scanner/

CooldownManager.js

DuplicateReadGuard.js

ScannerSession.js

---

# Responsabilidades

ScannerPipeline

Responsável por controlar o fluxo completo.

Nunca acessar interface.

---

CooldownManager

Controla o tempo mínimo entre leituras.

---

DuplicateReadGuard

Evita múltiplas leituras do mesmo código.

---

ScannerSession

Armazena estado da sessão.

Quantidade lida

Último código

Timestamp

Total de leituras

Tempo da sessão

---

# Máquina de Estados

IDLE

↓

INITIALIZING

↓

READY

↓

DETECTING

↓

PROCESSING

↓

SUCCESS

↓

COOLDOWN

↓

READY

↓

...

↓

STOPPED

ERROR poderá ocorrer em qualquer estado.

---

# READY

Scanner aguardando.

Overlay branco.

Linha de scan ativa.

---

# DETECTING

Código encontrado.

Overlay amarelo.

Nenhuma leitura adicional deve ocorrer.

---

# PROCESSING

Aplicação validando produto.

Interface permanece ativa.

Não bloquear renderização.

---

# SUCCESS

Inventário atualizado.

Overlay verde.

Produto exibido.

Cooldown iniciado.

---

# COOLDOWN

Tempo necessário para impedir leitura duplicada.

Valor padrão:

500 ms

Durante este período:

Ignorar novas leituras.

Não parar câmera.

---

# READY

Cooldown encerrado.

Scanner volta automaticamente.

Sem reinicializar.

---

# DuplicateReadGuard

Criar proteção.

Regra.

Mesmo código

+

Menos de 1000 ms

↓

Ignorar.

Exemplo.

789123

100 ms

↓

Ignorar

789123

300 ms

↓

Ignorar

789123

1200 ms

↓

Aceitar

Outro código

↓

Aceitar imediatamente.

---

# ScannerPipeline

Responsável por:

Receber leitura

↓

Validar

↓

Consultar DuplicateReadGuard

↓

Atualizar estado

↓

Enviar evento

↓

Iniciar Cooldown

↓

Voltar para READY

Nunca acessar React.

---

# Eventos

Criar eventos.

SCANNER_READY

SCAN_STARTED

SCAN_DETECTED

SCAN_ACCEPTED

SCAN_REJECTED

SCAN_DUPLICATED

SCAN_FINISHED

---

# Hook

useScannerPipeline()

Responsável apenas por consumir o Pipeline.

Não implementar regras de negócio.

---

# ScannerSession

Deve armazenar:

sessionStart

lastRead

lastAccepted

acceptedReads

rejectedReads

duplicatedReads

currentState

---

# Renderização

Jamais desmontar:

Camera

Overlay

Toolbar

Footer

Eles permanecem montados durante toda a sessão.

---

# Navegação

É proibido:

navigate()

replace()

push()

back()

após leitura.

---

# Performance

Não reinicializar:

CameraX

ML Kit

HTML5 Scanner

Após cada leitura.

Inicializar apenas uma vez.

---

# ScannerService

Não destruir.

Não recriar.

Manter instância ativa.

---

# React

Evitar re-renderizações.

Utilizar:

React.memo

useCallback

useMemo

quando necessário.

---

# Tempo

Leitura

↓

Processamento

↓

Feedback

↓

Cooldown

↓

READY

Tempo total esperado:

< 700 ms

---

# Logs

Adicionar logs internos.

READY

↓

DETECTED

↓

PROCESSING

↓

SUCCESS

↓

COOLDOWN

↓

READY

Facilitar depuração.

---

# Tratamento de Erros

Erro durante leitura.

↓

Estado ERROR

↓

Exibir mensagem

↓

Retornar para READY

Nunca destruir Scanner.

---

# Critérios de Aceite

A câmera nunca fecha durante a sessão.

Scanner permanece ativo.

Sem troca de telas.

Sem reinicialização.

Sem recriação do ScannerService.

Leituras duplicadas bloqueadas.

Cooldown funcionando.

Overlay permanece ativo.

Pipeline desacoplado da UI.

Projeto compila.

Sem regressões.

---

# Não Fazer

Não implementar beep.

Não implementar vibração.

Não alterar Layout.

Não alterar Overlay.

Não alterar Toolbar.

Não implementar Zoom.

Não implementar Torch.

Não implementar ML Kit.

Não alterar regras de inventário.

Não alterar sincronização.

Não fechar a câmera.

Não navegar entre páginas.

Esta RFC trata exclusivamente da implementação do Scanner Contínuo.