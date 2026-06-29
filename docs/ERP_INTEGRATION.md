# Manual de Integração com ERP (Amura Collector v1.0)

O **Amura Collector** é projetado como uma aplicação *Offline-First*. Isso significa que ele não depende do ERP para a coleta física básica, mas requer comunicação em duas pontas principais: a **Importação de Dados Básicos (Opcional)** e a **Exportação do Lote de Contagem (Obrigatória)**.

Abaixo, detalhamos a arquitetura de sincronização (Sync Engine) e como seu sistema (SAP, Protheus, ou ERP próprio) deve receber os dados do aplicativo.

---

## 1. Arquitetura da Sync Engine

A comunicação principal de saída para o ERP é gerida pela **Sync Engine** interna do aplicativo.

*   **Fila Assíncrona:** Nenhuma leitura vai diretamente para a rede. Todas viram um *Job* guardado na memória do dispositivo.
*   **Retry Policy Automático:** Se a internet no galpão cair ou a API do ERP ficar indisponível (Erro 500, Timeout), a Engine tentará re-enviar os lotes nos intervalos definidos (Padrão: 2s, depois 5s, depois 15s...). O ERP não precisa se preocupar com perda de dados no lado do cliente.
*   **Agnóstico ao Protocolo:** O app delega o pacote final a um `HttpSyncProvider`. Atualmente a API envia os dados no padrão JSON por via de requisições `POST`.

---

## 2. API de Integração (Recepção no ERP)

O aplicativo tenta despachar lotes consolidados ou contagens puras via HTTP POST. 

### Endpoint Padrão Configurado:
`POST /api/v1/sync` (Pode ser alterado no Provider do Aplicativo).

### Formato do Payload (Envio de Lote)

Quando o usuário clica em "Enviar Lote de Contagem" no menu "Sinc & ERP", o aplicativo agrupa todos os itens lidos no inventário ativo, somando as quantidades, e emite o seguinte JSON:

```json
{
  "idInventario": "INV-2023-A01",
  "nomeInventario": "Geral Janeiro",
  "loja": "Loja Centro",
  "categoriaFiltro": "Bebidas",
  "marcaFiltro": "Todas",
  "dataCriacao": "2026-06-29T10:00:00.000Z",
  "dataInicio": "2026-06-29T10:15:00.000Z",
  "itens": [
    {
      "codigoBarras": "789101010101",
      "quantidadeContada": 150
    },
    {
      "codigoBarras": "789202020202",
      "quantidadeContada": 34
    }
  ]
}
```

### O que o ERP deve fazer com isso?
1. Receber o `POST`, processar os itens (comparando `quantidadeContada` com o Kardex estático ou sistêmico na `dataInicio` do inventário).
2. Devolver um código `200 OK` rápido. Apenas com o retorno 200 a Sync Engine tira a tarefa da fila e marca como "Concluída" no celular do operador.

> ⚠️ **Nota Importante:** Retornos de status HTTP da faixa 4xx (Ex: 400 Bad Request, 404 Not Found) ou 5xx (500 Internal Server Error) farão com que o dispositivo retenha o lote e continue tentando sincronizar mais tarde. 

---

## 3. Métodos Alternativos (Offline Total)

Para clientes de ERPs que não disponibilizam APIs de recepção web (Sistemas mais antigos baseados em troca de arquivos), o **Amura Collector** suporta a exportação estática, sem uso da SyncEngine HTTP.

A partir do próprio Dashboard do App, o usuário pode apertar:
*   **Exportar CSV:** Gera uma planilha compatível com Excel contendo Data, Hora, Loja, Código de Barras e Quantidade.
*   **Exportar TXT (Layout ERP Padrão):** Gera um arquivo de texto posicional/separado, ideal para importar direto no TOTVS/SAP:

**Exemplo Arquivo TXT Gerado:**
```text
789101010101;150;INV-2023-A01
789202020202;34;INV-2023-A01
```

Esse arquivo é salvo diretamente no celular e pode ser compartilhado no WhatsApp ou E-mail para o gerente de estoque fazer o upload manual no ERP.
