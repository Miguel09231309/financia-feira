# Feira da Lua — Planilha Geral Editável, Cobranças e Gráficos Integrados

Reestruturação da navegação e do fluxo de dados da **Feira da Lua** para remover a aba de Backup, renomear **Planilha Matriz** para **Geral** com edição completa (direto na tabela e por clique), sincronizar **Cobranças** diretamente com as células marcadas como *Pendente* na planilha **Geral** e os contatos de **Feirantes**, alimentar **Gráficos & Custos** em tempo real a partir da planilha **Geral**, e manter o arquivo único `index.html` autônomo 100% atualizado.

---

## User Review & Critical Decisions

> [!IMPORTANT] Decisões confirmadas para esta atualização:
> - **Edição Completa na Planilha Geral**: Editar tudo direto na tabela e por clique (nomes de feirantes, datas das edições, valores, status de pagamento, observações, categorias de custos e exclusão de linhas/colunas).
> - **Sincronização de Cobranças**: Mostrar apenas as células marcadas como **Pendente** na planilha **Geral**, cruzando automaticamente com o telefone/WhatsApp cadastrado na aba **Feirantes**.
> - **Arquivo Único Autônomo**: Atualizar também o arquivo único `index.html` autônomo para rodar direto no navegador com todas as novidades.

---

## 1. Overview & Core Concept

- **What It Does**: Centraliza toda a operação financeira da feira na aba **Geral** (antiga Planilha Matriz), funcionando como fonte única de verdade. Qualquer alteração feita na planilha **Geral** atualiza instantaneamente os indicadores de saldo (PIX, Dinheiro e Líquido Geral), a lista de **Cobranças** pendentes e os **Gráficos & Custos**.
- **Target Audience / Persona**: Organizadores e coordenadores da Feira da Lua que precisam lançar, corrigir, adicionar ou excluir recebimentos de barracas e despesas operacionais com agilidade.
- **Key Value**: Elimina retrabalho e divergências entre abas — a planilha **Geral** é totalmente editável (células, linhas de feirantes, linhas de custos e colunas de datas) e reflete imediatamente em **Cobranças** e **Gráficos & Custos**.

---

## 2. User Experience & Visual Design

- **Navegação Simplificada (4 Abas + Ações)**:
  - `Geral` (antiga Planilha Matriz — tela inicial)
  - `Cobranças` (puxa automaticamente todas as células *Pendente* da planilha **Geral** + telefone de **Feirantes**)
  - `Feirantes` (cadastro completo de barracas, taxas padrão, WhatsApp e exclusão)
  - `Gráficos & Custos` (gráficos de recebimentos vs. pagamentos por edição e distribuição de custos puxados da planilha **Geral**)
  - Barra superior mantém o botão **Fundo Preto / Fundo Claro** e **Exportar PDF** (removendo a aba *Backup*).
- **Edição Total na Planilha Geral**:
  - **Cabeçalhos de Datas**: Editar data/rótulo, alternar *Realizada / Cancelada*, adicionar nova data (`+ Nova Data`) ou excluir coluna.
  - **Linhas de Feirantes**: Editar nome da barraca direto na linha, adicionar novo feirante, ou clicar em qualquer célula de data para alterar status (*Pago PIX*, *Pago Dinheiro*, *Pendente*, *Atestado*, *Ausente*), valor, observação ou excluir o lançamento.
  - **Linhas de Pagamentos / Custos**: Editar nome da categoria de custo direto na linha, adicionar nova linha de despesa operacional (`+ Novo Custo`), excluir linha de custo, ou clicar em qualquer célula para editar valor, forma de pagamento (*PIX* / *Dinheiro*) ou excluir.
- **Visual Identity & Theme**:
  - Mantém a estética limpa de alto contraste com suporte completo a **Fundo Claro** (`#F8FAFC`) e **Fundo Preto** (`#000000` com cartões `#171717`), tipografia `Plus Jakarta Sans` + `JetBrains Mono` (`tabular-nums`) para alinhamento perfeito de valores monetários.

---

## 3. Key Product Decisions & Trade-Offs

- **Fonte Única de Verdade (`Geral` → `Cobranças` & `Gráficos & Custos`)**:
  - *Chosen Approach*: `Cobranças` e `Gráficos & Custos` são calculados dinamicamente a partir dos registros da planilha **Geral** e da lista de **Feirantes**.
  - *Why*: Ao quitar uma cobrança na aba **Cobranças** (via PIX ou Dinheiro) ou excluir uma pendência, a célula correspondente na planilha **Geral** muda imediatamente para *Pago PIX*, *Pago Dinheiro* ou *Ausente*, mantendo 100% de consistência.
- **Remoção da Aba Backup**:
  - *Chosen Approach*: Remover a aba *Backup* da navegação principal e manter a persistência automática no `localStorage` do navegador.
  - *Why*: Atende diretamente à solicitação de simplificar a interface para uso diário focado na gestão da feira.

---

## 4. Technical Architecture & Data Strategy

```
┌─────────────────────────────────────────────────────────────────────┐
│                        Barra Superior                               │
│  [Feira da Lua]   [Geral] [Cobranças] [Feirantes] [Gráficos & Custos] │
│                                    [Fundo Preto]  [Exportar PDF]    │
└───────────────────────────────┬─────────────────────────────────────┘
                                │
        ┌───────────────────────┼───────────────────────┐
        ▼                       ▼                       ▼
┌───────────────┐      ┌────────────────┐      ┌────────────────┐
│  Aba: Geral   │─────▶│ Aba: Cobranças │      │ Gráficos/Custos│
│ (Matriz Full) │      │ (Só Pendentes) │      │ (Tempo Real)   │
│ - Edita datas │      │ - Puxa telefone│      │ - Barras/Edição│
│ - Edita/cria  │      │   de Feirantes │      │ - Custos/Categ.│
│   feirantes   │      │ - Quitar PIX / │      └────────────────┘
│ - Edita/cria  │      │   Dinheiro     │               ▲
│   custos      │      │ - Cobrar Whats │               │
│ - Edita/exclui│      │ - Excluir      │               │
│   células     │      └───────┬────────┘               │
└───────▲───────┘              │                        │
        │                      │ Quita / Exclui         │
        └──────────────────────┴────────────────────────┘
                               │
                       ┌───────▼────────┐
                       │ Aba: Feirantes │
                       │ - Nome / Ramo  │
                       │ - WhatsApp     │
                       │ - Taxa Padrão  │
                       └────────────────┘
```

- **Data Model & State**:
  - As categorias de custos da planilha **Geral** passam a ser dinâmicas (lista editável de linhas de custos), permitindo renomear, adicionar novas linhas de despesas ou excluir linhas existentes.
  - Tanto a aplicação principal quanto o arquivo único autônomo (`index.html`) compartilharão exatamente a mesma estrutura de dados e funcionalidades.
