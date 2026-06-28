# Plano de Implementação - Coletor Estoque v2

## Objetivo

Reestruturar o sistema de captura de código de barras para utilizar um scanner nativo Android baseado em CameraX + Google ML Kit através de um Plugin Capacitor, mantendo toda a lógica de negócio existente.

---

# Regras

- NÃO alterar regras de negócio.
- NÃO alterar fluxo de inventário.
- NÃO alterar armazenamento.
- NÃO alterar sincronização.
- NÃO alterar telas exceto Scanner.
- Preservar compatibilidade com Android.
- Implementar em pequenas etapas.

---

# Etapa 1

## Objetivo

Separar a camada de leitura de código de barras da interface React.

## Fazer

Criar:

```

src/services/scanner/

```

Criar interface:

```

IScanner.ts

```

Métodos:

```

start()

stop()

pause()

resume()

torch()

zoom()

```

A tela Scanner.jsx não poderá mais depender diretamente da biblioteca de leitura.

Resultado esperado:

```

React
↓

IScanner
↓

Implementação

```

---

# Etapa 2

Criar um ScannerService.

Implementações:

```

Html5ScannerService

```

A implementação atual deve ser movida para esta classe sem alteração de comportamento.

Scanner.jsx apenas consome:

```

ScannerService.start()

```

---

# Etapa 3

Criar Plugin Capacitor.

Nome:

```

BarcodeScannerPlugin

```

Estrutura:

```

android/

ios/

definitions.ts

index.ts

```

Ainda não implementar funcionalidades.

Apenas criar a estrutura.

---

# Etapa 4

Implementar CameraX.

Utilizar:

- Preview
- ImageAnalysis

Não utilizar Camera2 diretamente.

---

# Etapa 5

Adicionar Google ML Kit Barcode Scanner.

Formatos:

- EAN13
- EAN8
- Code128
- Code39
- QRCode
- DataMatrix

Ignorar outros formatos.

---

# Etapa 6

Implementar comunicação Plugin -> React.

Eventos:

```

barcodeDetected

cameraReady

cameraError

torchChanged

zoomChanged

```

---

# Etapa 7

Substituir ScannerService.

Hoje:

```

Html5ScannerService

```

Novo:

```

NativeScannerService

```

Sem alterar Scanner.jsx.

---

# Etapa 8

Adicionar confirmação da leitura.

Somente aceitar código após:

2 leituras consecutivas iguais

ou

3 leituras em até 500ms.

Evitar leituras falsas.

---

# Etapa 9

Adicionar configuração automática.

Ao iniciar:

- foco contínuo
- exposição automática
- white balance automático

---

# Etapa 10

Adicionar Zoom Inteligente.

Fluxo:

código pequeno

↓

zoom 2x

↓

leitura

↓

zoom 1x

Não depender do usuário.

---

# Etapa 11

Torch Automática.

Detectar luminosidade.

Se ambiente escuro:

ligar lanterna.

Desligar automaticamente.

Manter botão manual.

---

# Etapa 12

Adicionar resolução dinâmica.

Preferência:

1920x1080

Caso indisponível:

1280x720

Caso indisponível:

maior resolução disponível.

---

# Etapa 13

Evitar múltiplas leituras.

Após leitura:

- pausar análise
- emitir evento
- aguardar resposta React
- reativar análise

---

# Etapa 14

Adicionar timeout.

Caso câmera fique sem resposta:

reiniciar automaticamente.

---

# Etapa 15

Adicionar logs.

Tempo até primeira leitura

FPS

resolução

modelo câmera

tempo médio leitura

erros

---

# Etapa 16

Remover html5-qrcode do projeto.

Eliminar dependências mortas.

---

# Critérios de Aceitação

✔ Leitura em menos de 500ms

✔ Funcionar em etiquetas pequenas

✔ Funcionar em baixa iluminação

✔ Funcionar offline

✔ Sem travamentos

✔ Scanner desacoplado da interface

✔ Fácil substituição futura

✔ Código organizado por camadas

```

---

# Melhorias de UX

## Scanner em tela cheia

Hoje existe muito espaço desperdiçado.

Novo layout:

```

────────────────────────

Cancelar        Lanterna

████████████████████████

╔══════════════════════╗

║                      ║

║      Scanner         ║

║                      ║

╚══════════════════════╝

████████████████████████

Aproxime o código de barras

Última leitura:

7891234567890

────────────────────────

```

---

## Feedback visual

Quando detectar:

```

🟡 Procurando...

↓

🟢 Código encontrado

↓

✔ Confirmado

```

---

## Vibração

Pequena vibração ao confirmar.

---

## Som curto

Beep de confirmação.

Configurável.

---

## Histórico rápido

Mostrar os últimos 5 códigos lidos.

Exemplo:

```

✔ 7891234567890

✔ 7899876543210

✔ 7890001112223

```

Isso ajuda muito quando o operador passa dezenas de itens.

---

## Modo contínuo

Após adicionar um item:

não fechar o scanner.

Continuar lendo automaticamente.

Ideal para inventário.

---

## Contador grande

No topo:

```

Itens

153

```

O operador sabe imediatamente quantos itens já coletou.

---

## Indicador de distância

Quando o código estiver fora do foco:

```

Afaste um pouco

```

ou

```

Aproxime mais

```

Pode ser baseado no tamanho do bounding box retornado pelo ML Kit.

---

## Overlay inteligente

Ao detectar um código:

desenhar um retângulo verde exatamente sobre ele.

Isso transmite confiança ao usuário.

---

## Detecção automática de orientação

EAN13:

overlay horizontal.

QRCode:

overlay quadrado.

Sem intervenção do usuário.

---

## Modo luvas

Botões grandes.

Área de toque maior.

Excelente para uso em estoque.

---

## Estatísticas da sessão

Ao finalizar:

```

Tempo

18 minutos

Itens

324

Média

1 item a cada 3,3 segundos

```

---

## Minha recomendação

Além da troca para **CameraX + ML Kit**, eu faria uma pequena evolução arquitetural: transformar o scanner em um módulo completamente independente (`IScanner` + `NativeScannerService`). Isso permite manter a interface React praticamente inalterada, facilita testes, reduz o acoplamento e deixa aberta a possibilidade de, no futuro, suportar leitores Bluetooth, coletores dedicados (Zebra, Honeywell) ou até leitura via câmera web sem alterar o restante do sistema.

Esse tipo de arquitetura é a que eu adotaria se o objetivo fosse evoluir o projeto para um produto comercial de longo prazo.