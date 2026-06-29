# Manual do Usuário - Amura Collector

Bem-vindo ao **Amura Collector**, a ferramenta profissional para contagem, recontagem e auditoria do seu estoque.

Neste manual, você entenderá o fluxo básico para abrir o aplicativo, fazer leituras e transferir o resultado de volta para o sistema da empresa.

---

## 1. Primeiros Passos

1. **Abra o aplicativo**.
2. **Defina a sua Loja e quem é o Operador:** Logo na tela inicial ("Configurações Iniciais"), insira o seu nome de usuário (Operador) e selecione a Loja/Filial em que está operando.
3. Clique em **Entrar**.

---

## 2. Selecionando o Inventário

Você precisa dizer para onde as caixas que você bipar vão ser contabilizadas.

* Na aba **Dashboard** (tela principal da casinha), você verá os "Inventários Ativos". 
* Selecione um inventário da lista (Ex: "Inventário Geral Julho") clicando nele. A tela piscará verde e ele ficará marcado como o **Inventário Atual** no cabeçalho superior.
* *Nota:* Se não houver inventários, basta preencher os campos na direita e clicar em "Criar Inventário Manual".

---

## 3. Coletando os Produtos

Com o inventário selecionado, vá para a aba **Coletar** (ícone do meio, a mira de leitor de barras).

### Formas de Ler o Produto:
- **Câmera do Celular:** Basta apontar para o código de barras. O aplicativo possui Smart Zoom, então ele aproxima sozinho se a caixa estiver alta.
- **Pistolas / Leitores Sem Fio:** Se você usa um leitor bluetooth, aperte no campo "Digite o Código Manualmente" e apenas aperte o gatilho da pistola.
- **Digitação:** Se o código estiver rasgado, digite os números no campo na base da tela e aperte no botão "+".

### Modos Especiais de Contagem
No topo da tela de coleta, você tem as opções:
- **Setor:** Digite onde você está (ex: Corredor A, Prateleira 4) para a leitura ficar registrada com esse local.
- **Modo (Coleta Normal vs Recontagem):** 
  - *Coleta Normal:* A cada bip, a quantidade do produto sobe.
  - *Recontagem:* Usado para auditar o trabalho de outra pessoa. Essas contagens não se misturam com as normais e são exibidas separadas para seu gerente conferir divergências.
- **Pallet Multiplicador (📦):** Bipou uma caixa fechada contendo 24 unidades? Clique no ícone de "Caixa" no topo da tela, insira "Camadas", "Caixas por Camada" e "Unidades", e o aplicativo bipará a quantidade multiplicada de uma só vez (ex: soma 480 instantaneamente).

---

## 4. Enviando e Fechando o Inventário

Terminou de contar todo o galpão/setor? Agora precisamos mandar isso para o servidor ou gerente.

1. Acesse a aba **Sinc & ERP** (o ícone de engrenagem).
2. Esta é a **Sync Engine**. Ela consolida tudo que você bipou.
3. Você tem três opções na tela principal:
   * **Enviar Lote de Contagem:** Ao apertar aqui, o celular embrulha tudo e tenta enviar pela rede sem fio para o sistema da sua empresa (ERP). Se você estiver sem sinal Wi-Fi, não se desespere! O aplicativo tentará enviar sozinho em intervalos até achar internet. 
   * **Exportar TXT / CSV:** Baixa um arquivo direto no seu celular contendo a tabela de todos os produtos lidos. Ideal caso queira enviar por E-mail ou WhatsApp para a contabilidade da empresa.
   * **Relatório PDF:** Gera um comprovante bonitinho que pode ser enviado para a impressora.

> ⚠️ Somente ao receber a confirmação visual (Verde) do envio, os dados chegaram na empresa.

---

## Dicas Rápidas
- **Tema Escuro/Claro:** Clique no sol/lua ☀️ no canto superior direito do aplicativo se seus olhos estiverem cansados no escuro.
- **Errei a Leitura!** Se bipou o código errado ou algo a mais, vá na aba **Histórico**, encontre o que foi bipado por acidente e apague. Ele subtrai o item automaticamente do cálculo final.
