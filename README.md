# Amura Collector 🛰️ (v1.0.0)

O **Amura Collector** é um aplicativo móvel-first moderno, robusto e responsivo projetado para realizar a contagem física e auditoria de estoques (inventários). O aplicativo opera de forma 100% offline-first e permite integração flexível (sincronização online em tempo real ou conciliação em lote por arquivo) com o ERP central, provido agora de uma engine de sincronização avançada.

Desenvolvido para **Android, iOS e Web** utilizando **React (Vite)** e **CSS Vanilla**.

---

## 🏗️ Arquitetura Consolidada

O aplicativo baseia-se em camadas fortemente desacopladas, construindo um fluxo previsível e a prova de falhas:

1. **Scanner Service:** Integração nativa com Android via CameraX e ML Kit, ou interface HTML5 WebRTC. Suporta Smart Zoom e controle de iluminação.
2. **Scanner Pipeline:** Fila serializada de processamento de quadros. Rejeita frames borrados, aplica debounce e extrai metadados antes que a UI sequer saiba o que aconteceu.
3. **State Machine & Session Manager:** Controla os ciclos de vida da captura. Impede leituras duplicadas no mesmo ciclo através de um gerenciamento limpo.
4. **History:** Camada imutável que registra todas as contagens com rollback de operações.
5. **Sync Engine (RFC-0017):** Abordagem offline-first radical. Nenhuma API é chamada diretamente pelo inventário. Tudo vira um `Job` armazenado no SQLite/LocalStorage que será consumido por um Worker com política de *Retry* (2s, 5s, 15s) e fallback para provedores (HTTP, File).
6. **Diagnostics Manager (RFC-0016):** Telemetria em background passiva, acessível apenas via modo desenvolvedor.

---

## 🎨 Identidade Visual e Temas
A interface foi projetada utilizando as cores oficiais da marca **Amura** (Laranja `#f26522` e Roxo `#7a0c7b`), fornecendo uma experiência visual limpa e focada:
*   **Modo Escuro (Padrão):** Paleta escura suave baseada em cinzas e azulados slates (sem luzes neon agressivas), ideal para galpões e locais de contagem com baixa luminosidade.
*   **Modo Claro:** Interface clara de alto contraste baseada em tons brancos e cinzas suaves, ideal para contagem sob luz solar direta.

---

## 🚀 Funcionalidades Principais

1.  **Sessão de Inventário Vinculada:** Herda inventários abertos no ERP ou permite criação avulsa.
2.  **Múltiplos Modos de Coleta:** Contagem física cega e modo de auditoria/recontagem de área.
3.  **Mecanismos de Leitura de Códigos:**
    *   **Câmera do Dispositivo:** ML Kit super-rápido com Smart Zoom para códigos distantes.
    *   **Leitores Sem Fio:** Gatilhos Bluetooth / USB via emulação de teclado.
    *   **Digitação Manual.**
4.  **Calculadora de Pallet Integrada.**
5.  **Setorização de Contagem.**
6.  **Mesclagem Inteligente Multi-Dispositivo:** Unifica as contagens parciais de dezenas de aparelhos no final do dia.
7.  **Sincronização Indestrutível:** Lotes exportados para a SyncEngine que tenta comunicação eternamente até conseguir entregar a carga pro ERP.

---

## 🛠️ Instalação e Compilação

Certifique-se de ter o **Node.js** (versão 18+) instalado.

1.  **Clone o repositório:**
    ```bash
    git clone https://github.com/Zooltek/coletor-estoque.git
    cd coletor-estoque
    ```
2.  **Instale as dependências:**
    ```bash
    npm install
    ```
3.  **Ambiente de Desenvolvimento:**
    ```bash
    npm run dev
    ```
4.  **Build de Produção:**
    ```bash
    npm run build
    ```

---

## 📱 Empacotamento Nativo (Android e iOS)

O projeto usa **CapacitorJS** para empacotar as rotinas nativas:

1.  **Sincronizar a Build:**
    ```bash
    npx cap sync
    ```
2.  **Android:**
    ```bash
    npx cap open android
    # Compile a release usando o Gradle ou o Android Studio
    ```
3.  **iOS:**
    ```bash
    npx cap open ios
    ```

---

## 🤝 Contribuição e Licença
Desenvolvido por Zooltek. Uso corporativo restrito - Amura.
