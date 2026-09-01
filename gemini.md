# Constituição do Projeto - Fluxo de Caixa

## Regras Comportamentais
- Todo desenvolvimento deve seguir a arquitetura de 3 camadas A.N.T (Action, Node, Trigger).
- O desenvolvimento do código/backend começa apenas após o Data Schema ser aprovado.
- Interface visual deve ser Premium, moderna e evitar estilos genéricos (utilizar animações, paletas trabalhadas, tipografias modernas).
- Regras de negócio adicionais serão definidas conforme o projeto evolui.

## 1. Fase de Visão
- **Estrela Guia**: Ter uma visão centralizada e limpa do lucro real unindo vendas físicas, prestação de serviços e despesas pessoais.
- **Integrações**: Pull de dados de Google Planilhas.
- **Fonte da Verdade**: Banco de dados Supabase (Autenticação + Transações).
- **Payload de Entrega**: Dashboard em tempo real na tela principal, com design bonito e estiloso.

## 2. Esquema de Dados (Data Schema) - Confirmado

### Transação (Input/Database)
```json
{
  "id": "uuid",
  "usuario_id": "uuid",
  "tipo": "receita | despesa",
  "categoria": "venda_fisica | servico | pessoal | outros",
  "valor": 0.00,
  "descricao": "string",
  "data_transacao": "ISO 8601 string",
  "origem": "manual | google_sheets",
  "status": "concluido | pendente"
}
```

### Dashboard (Output/Payload)
```json
{
  "saldo_atual": 0.00,
  "receitas_mes": 0.00,
  "despesas_mes": 0.00,
  "lucro_real": 0.00,
  "grafico_evolucao": [
    { "data": "2026-09-01", "receita": 0, "despesa": 0 }
  ],
  "transacoes_recentes": [ /* Array de Transação */ ]
}
```
