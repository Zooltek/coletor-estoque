# Guia de Integração e Comunicação - Amura Collector

Este documento serve de guia para que qualquer sistema de ERP (seja o próprio ou de terceiros) possa se comunicar e integrar com o aplicativo **Amura Collector**.

A comunicação com o app é estruturada de duas formas principais:
1. **Via Arquivos Estáticos (TXT/CSV)** - Ideal para conexões simples e rápidas sem necessidade de internet.
2. **Via APIs HTTP/JSON (Online)** - Para integração automatizada em tempo real ou sincronização direta por lotes.

---

## 1. Importação do Catálogo de Produtos para o App

Para que o coletor exiba as descrições dos produtos ao ler os códigos de barras, o ERP deve disponibilizar a lista de produtos cadastrados.

> [!TIP]
> **População Dinâmica de Categorias e Filtros:** As categorias de filtragem exibidas na tela de novos inventários locais (avulsos) são obtidas de forma dinâmica a partir dos valores únicos contidos na coluna/propriedade `categoria` (ou `category`) dos produtos importados no catálogo. Se o ERP utiliza filtros específicos por setores/categorias, basta preencher essa propriedade nos itens do catálogo para que o coletor exiba essas opções automaticamente. Por padrão (ou se o catálogo estiver vazio), a categoria padrão será **"Todas as Categorias"**.

### Opção A: Importação via Arquivo de Texto (CSV/TXT)
O operador pode carregar um arquivo de texto no aplicativo através da tela de **Ajustes ➔ Importar Catálogo de Produtos**.
* **Formato do Arquivo:** CSV delimitado por ponto e vírgula (`;`), codificado em **UTF-8** ou **ANSI**.
* **Layout das Colunas:** `codigo;descricao;marca;categoria;preco;estoque`
* **Exemplo de Conteúdo (`produtos.txt`):**
  ```text
  78910001;Arroz Integral Camil 1kg;Camil;Alimentos;7.89;120
  78910002;Feijão Preto Kicaldo 1kg;Kicaldo;Alimentos;8.50;95
  78930003;Fone de Ouvido JBL Tune 510BT;JBL;Eletrônicos;249.90;30
  ```

### Opção B: Carga de Catálogo via Endpoint da API
Caso o aplicativo esteja no modo integrado, ele poderá consumir um endpoint HTTP do ERP para atualizar o catálogo local (Banco SQLite/LocalStorage).
* **Método:** `GET`
* **Sugestão de URL:** `https://api.seu-erp.com.br/v1/produtos`
* **Headers:** `Authorization: Bearer <token>`
* **Resposta Esperada (JSON Array):**
  ```json
  [
    {
      "barcode": "78910001",
      "description": "Arroz Integral Camil 1kg",
      "brand": "Camil",
      "category": "Alimentos",
      "price": 7.89,
      "stock": 120
    }
  ]
  ```

---

## 2. Envio das Leituras (Contagens) do Coletor para o ERP

Após o término da contagem física, os dados devem ser retornados ao ERP para processamento de conciliação de estoque.

### Opção A: Exportação via Arquivo Físico
O app gera e baixa arquivos no celular do operador para importação manual no ERP:
1. **Exportar TXT (Simplificado - Contagem Cega):**
   * **Nome padrão:** `inventario_<id>_consolidado.txt`
   * **Layout:** `codigo_barras;quantidade`
   * **Exemplo:**
     ```text
     78910001;12.0
     78910002;8.0
     78930003;2.0
     ```
2. **Exportar Excel/CSV (Completo):**
   * **Layout:** `Código de Barras;Descrição;Marca;Categoria;Quantidade Coletada`
   * **Exemplo:**
     ```text
     78910001;Arroz Integral Camil 1kg;Camil;Alimentos;12.0
     ```

### Opção B: Envio de Leituras em Tempo Real (Modo Online)
Se o modo **Tempo Real (Online)** estiver ativo no app, a cada bipe bem-sucedido o aplicativo envia um POST para o ERP:
* **Método:** `POST`
* **URL:** (Configurável no app, ex: `https://api.seu-erp.com.br/v1/contagem`)
* **Headers:** `Content-Type: application/json`
* **Corpo da Requisição (JSON):**
  ```json
  {
    "idInventario": "local-1719523000",
    "barcode": "78910001",
    "quantity": 1,
    "sector": "Corredor A",
    "operator": "Fabricio",
    "mode": "coleta"
  }
  ```
  *(Nota: Se o operador estiver em recontagem/conferência, a propriedade `"mode"` será enviada como `"recontagem"`).*
* **Resposta Esperada do ERP:** `201 Created`

### Opção C: Envio em Lote (Modo Lote/Offline-first)
Ao finalizar o inventário, o operador clica em **Sincronizar Lote no ERP** para enviar a contagem completa consolidada junto com os metadados do inventário:
* **Método:** `POST`
* **URL:** (Configurável no app, ex: `https://api.seu-erp.com.br/v1/contagem/lote`)
* **Headers:** `Content-Type: application/json`
* **Corpo da Requisição (JSON):**
  ```json
  {
    "idInventario": "local-1719523000",
    "nomeInventario": "Inventário Rápido Frios",
    "loja": "Loja Centro",
    "categoriaFiltro": "Todas",
    "marcaFiltro": "Todas",
    "dataCriacao": "2026-06-27T21:40:00.000Z",
    "dataInicio": "2026-06-27T21:42:00.000Z",
    "itens": [
      {
        "codigoBarras": "78910001",
        "quantidadeContada": 12
      },
      {
        "codigoBarras": "78910002",
        "quantidadeContada": 8
      }
    ]
  }
  ```
* **Resposta Esperada do ERP:** `200 OK`

---

## 3. Importação da Lista de Lojas / Estabelecimentos do ERP

Para que o operador possa selecionar a loja/filial correta no login (especialmente se o ERP atende múltiplas lojas), o ERP pode disponibilizar a lista de estabelecimentos.

> [!NOTE]
> **Fluxo de Loja Única vs Múltiplas Lojas:**
> Por padrão, se nenhuma loja for sincronizada/importada do ERP, o aplicativo inicia contendo apenas a loja padrão `"Depósito Geral"`. 
> * **Cenário Loja Única:** Se a lista de lojas possuir apenas 1 estabelecimento, o dropdown de seleção de loja na tela de login será **ocultado automaticamente**, permitindo que o operador digite apenas seu nome para fazer o login de forma simplificada.
> * **Cenário Múltiplas Lojas:** Assim que a lista for populada com 2 ou mais filiais via API, a tela de login exibirá automaticamente o dropdown para que o operador selecione em qual estabelecimento a contagem está sendo realizada.

### Opção A: Carga de Lojas via Endpoint da API (JSON)
O aplicativo pode consumir um endpoint HTTP do ERP para atualizar as filiais disponíveis no banco de dados local.
* **Método:** `GET`
* **Sugestão de URL:** `https://api.seu-erp.com.br/v1/lojas`
* **Resposta Esperada (JSON Array de Strings):**
  ```json
  [
    "Depósito Geral",
    "Loja Centro",
    "Loja Shopping",
    "Loja Norte"
  ]
  ```

---

## 4. Controle de Ponto de Corte (Cutoff) e Kardex pelo ERP

Uma das grandes responsabilidades do ERP ao receber as contagens físicas do coletor é realizar o controle de **Ponto de Corte** (Cutoff do inventário):

1. **Definição do Horário de Início (`dataInicio` / `startedAt`):**
   * O aplicativo coleta a data e hora do início físico da contagem (`dataInicio`) no aparelho.
2. **Reconciliação Retroativa (Kardex):**
   * O ERP deve comparar a contagem física com o saldo de estoque técnico que havia na data/hora informada em `dataInicio`.
   * **Muito Importante:** Quaisquer movimentações (vendas realizadas no caixa ou entradas de notas fiscais) que ocorreram no ERP *após* a `dataInicio` (enquanto o inventário estava sendo contado fisicamente pelo operador) devem ser computadas retroativamente.
   * **Fórmula de Reconciliação do Estoque no ERP:**
     $$\text{Estoque Final Conciliado} = \text{Contagem Física (Coletor)} - \text{Vendas Pós-Início} + \text{Entradas Pós-Início}$$
     Esta quantidade consolidada recalculada no ERP deve ser usada para confrontar o saldo anterior e gerar os lançamentos de ajuste de sobras e perdas.

---

## 5. Fluxo do Inventário Cego (Blind Inventory)

O **Amura Collector** é 100% compatível com Inventário Cego. 
Quando o modo cego está ativado:
1. O coletor não precisa de um catálogo pré-carregado.
2. O app registra diretamente os códigos de barras lidos e os salva com uma descrição temporária (`Produto Avulso (EAN: <codigo>)`).
3. O ERP recebe o arquivo TXT ou JSON contendo apenas `codigo_barras` e `quantidadeContada`, cabendo ao ERP cruzar esses dados com seu próprio banco de dados interno para apontar furos, sobras ou divergências.
