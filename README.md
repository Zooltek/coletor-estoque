# Amura Collector 🛰️

O **Amura Collector** é um aplicativo móvel-first moderno, robusto e responsivo projetado para realizar a contagem física e auditoria de estoques (inventários). O aplicativo opera de forma 100% offline-first e permite integração flexível (sincronização online em tempo real ou conciliação em lote por arquivo) com o ERP central, incluindo regras de corte do Kardex.

Desenvolvido para **Android, iOS e Web** utilizando **React (Vite)** e **CSS Vanilla**.

---

## 🎨 Identidade Visual e Temas
A interface foi projetada utilizando as cores oficiais da marca **Amura** (Laranja `#f26522` e Roxo `#7a0c7b`), fornecendo uma experiência visual limpa e focada:
*   **Modo Escuro (Padrão):** Paleta escura suave baseada em cinzas e azulados slates (sem luzes neon agressivas), ideal para galpões e locais de contagem com baixa luminosidade.
*   **Modo Claro:** Interface clara de alto contraste baseada em tons brancos e cinzas suaves, ideal para contagem sob luz solar direta.
*   **Seletor Dinâmico:** Um botão de alternância rápida (☀️ / 🌙) permite alternar de tema instantaneamente. A escolha é salva localmente para os próximos acessos.

---

## 🚀 Funcionalidades Principais

1.  **Sessão de Inventário Vinculada:**
    *   **ERP:** O aplicativo busca sessões de inventários ativos criadas no ERP central via chamada de API (`GET /api/inventarios`) e herda automaticamente seus filtros de Loja, Marca e Categoria.
    *   **Local:** Permite a criação de sessões de contagem independentes e livres diretamente no aplicativo.
2.  **Múltiplos Modos de Coleta:**
    *   **Contagem Física:** Acumula as coletas e soma as quantidades fisicamente localizadas.
    *   **Modo Recontagem (Conferência):** Realiza uma auditoria de um setor. Essas leituras são armazenadas de forma comparativa e **não alteram a contagem principal** do inventário.
3.  **Mecanismos de Leitura de Códigos:**
    *   **Câmera do Dispositivo:** Scanner de câmera integrado com mira laser vermelha.
    *   **Leitores Sem Fio (Bluetooth/USB):** Escuta ativa para leitores de código de barras pareados (operando por emulação de teclado com sufixo `Enter`).
    *   **Digitação Manual:** Campo de entrada com busca instantânea no catálogo offline.
4.  **Calculadora de Pallet Integrada:**
    *   Calcula de forma rápida o total de caixas e camadas (fechados e abertos com unidades avulsas):
        $$\text{Total Pallet} = (\text{Camadas} \times \text{Caixas por Camada} \times \text{Unidades por Caixa}) + \text{Unidades Avulsas}$$
5.  **Setorização de Contagem:**
    *   Separação das leituras por setores físicos (Corredor A, Prateleira 3, etc.) para auditorias locais rápidas e localização de divergências.
6.  **Mesclagem Inteligente Multi-Dispositivo:**
    *   Permite que vários celulares trabalhem simultaneamente offline. O gerente pode importar todos os arquivos exportados (`.txt`/`.csv`) no centralizador do app, que unifica tudo e soma as quantidades dos mesmos produtos automaticamente.
7.  **Conciliação Avançada do Kardex do ERP:**
    *   O aplicativo registra o exato momento do início da contagem. Ao integrar, o sistema simula as transações do Kardex do ERP posteriores a esse horário para ajustar a contagem:
        $$\text{Total Integrado} = \text{Físico Contado} - \text{Vendas Kardex Pós-Início} + \text{Entradas Kardex Pós-Início}$$
    *   Exibe um relatório comparativo detalhado com as divergências finais antes do envio.
8.  **Opções de Integração e Sincronização:**
    *   **Tempo Real (Online):** Cada leitura individual dispara um `POST /api/contagem` imediato ao ERP.
    *   **Em Lote (Offline):** Salva localmente em banco de dados do dispositivo (`IndexedDB`/`LocalStorage`) e envia os dados consolidados ou exporta arquivos.
    *   **Formatos de Exportação:** CSV (Excel), TXT consolidado por código de barras (layout padrão de ERP) e PDF de relatório executivo de inventário pronto para impressão.

---

## 📁 Estrutura de Pastas do Projeto

```
coletor-estoque/
├── index.html              # Entrada HTML principal (título e viewport)
├── package.json            # Dependências do projeto (React, html5-qrcode, Vite)
├── vite.config.js          # Configurações do Vite
├── public/
│   ├── logo.ico            # Ícone oficial da Amura
│   └── favicon.ico         # Favicon da aplicação
└── src/
    ├── main.jsx            # Ponto de entrada React e renderização do DOM
    ├── App.jsx             # Roteador de telas, controle de contagem e estado global
    ├── index.css           # Design System (variáveis claro/escuro e layout responsivo)
    ├── components/
    │   ├── DeviceFrame.jsx    # Emulador de chassi de smartphone para visualização desktop
    │   ├── Scanner.jsx        # Componente da câmera para leitura de barras
    │   ├── PalletModal.jsx    # Modal e calculadora de pallets
    │   ├── FileMerger.jsx     # Importador e mesclador de múltiplos arquivos coletores
    │   ├── KardexDashboard.jsx# Painel ERP de divergências, log de APIs e Kardex
    │   └── SoundFeedback.js   # Bipes de sucesso e erro usando Web Audio API
    ├── data/
    │   └── mockCatalog.js     # Catálogo mockado contendo +50 produtos cadastrados
    └── utils/
        ├── storage.js         # Manipulador do LocalStorage offline-first
        └── exporter.js        # Geradores de arquivos TXT, CSV e relatório PDF
```

---

## 🛠️ Como Instalar e Executar Localmente

Certifique-se de ter o **Node.js** (versão 18 ou superior) instalado no sistema.

1.  **Clone o repositório:**
    ```bash
    git clone https://github.com/Zooltek/coletor-estoque.git
    cd coletor-estoque
    ```
2.  **Instale as dependências:**
    ```bash
    npm install
    ```
3.  **Execute o servidor de desenvolvimento:**
    ```bash
    npm run dev
    ```
    O servidor estará ativo em `http://localhost:5173/`.
4.  **Para gerar a build de produção:**
    ```bash
    npm run build
    ```
    Os arquivos estáticos compilados e otimizados serão gerados na pasta `dist/`.

---

## 📱 Empacotamento Nativo (Android e iOS)

Para envelopar esta aplicação web em um aplicativo nativo instalado nos celulares dos operadores, recomendamos o uso do **CapacitorJS**:

1.  **Inicialize o Capacitor no projeto:**
    ```bash
    npm install @capacitor/core @capacitor/cli
    npx cap init "Amura Collector" "com.amura.collector" --web-dir=dist
    ```
2.  **Adicione as plataformas nativas desejadas:**
    *   **Android:**
        ```bash
        npm install @capacitor/android
        npx cap add android
        ```
    *   **iOS (Requer macOS e Xcode):**
        ```bash
        npm install @capacitor/ios
        npx cap add ios
        ```
3.  **Para sincronizar o código compilado da pasta `dist` com os apps nativos:**
    ```bash
    npm run build
    npx cap sync
    ```
4.  **Para abrir os projetos nativos em seus respectivos SDKs (Android Studio / Xcode):**
    ```bash
    npx cap open android
    npx cap open ios
    ```

---

## 🤝 Contribuição e Licença
Desenvolvido por Zooltek. Uso exclusivo corporativo para auditoria de estoques integrados.
