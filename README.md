# URNA — Simulador Eleitoral

Jogo de simulação eleitoral fictícia. O jogador configura disputas, cria partidos e candidatos, acompanha debates e observa uma apuração simulada.

## Cargos previstos na arquitetura
- Presidente (nacional)
- Governador, senador, deputado federal e deputado estadual (estadual)
- Prefeito e vereador (municipal)

## Executar
Abra a pasta do projeto em um servidor local (módulos ES precisam de origem HTTP):
```bash
python3 -m http.server 8000
```
Acesse http://localhost:8000.

## Estrutura modular
- `main.js`: interface e coordenação do jogo existente.
- `election.js`: configuração eleitoral, distribuição de votos e elegibilidade de segundo turno.
- `parties.js`: criação e remoção segura de partidos.
- `candidates.js`: cargos e cadastro/consulta de candidaturas.
- `debates.js`: argumentos e seleção de participantes de debates.
- `apuration.js`: distribuição de lotes e cálculo de percentuais.
- `governors.js`: consulta de candidaturas estaduais.
- `state-results.js`: geração de resultados presidenciais fictícios por estado.
- `mayors.js`: disputas municipais.
- `legislature.js`: cargos legislativos e distribuição inicial de cadeiras.
- `campaign.js`: efeitos de ações de campanha.

## Estado atual
A interface oferece eleições presidenciais, municipais e para governador. No modo governador, os candidatos são vinculados ao estado informado e a apuração é independente. Após a apuração presidencial do primeiro turno, o jogo gera resultados fictícios por unidade federativa e apresenta um mapa geográfico clicável com o vencedor e a distribuição de votos de cada estado.

Em 2026, o modo governador carrega automaticamente um catálogo inicial para Goiás (GO), Mato Grosso (MT), Mato Grosso do Sul (MS), Distrito Federal (DF), São Paulo (SP), Rio de Janeiro (RJ), Minas Gerais (MG), Bahia (BA), Ceará (CE), Maranhão (MA), Piauí (PI), Rio Grande do Norte (RN), Paraíba (PB), Pernambuco (PE), Alagoas (AL) e Sergipe (SE), com 106 nomes e números de urna informados pelo usuário. O jogador pode excluir participantes ou acrescentar candidatos próprios. Confira os dados e a situação das candidaturas antes de usar o catálogo fora da simulação.

Todos os resultados são aleatórios e fictícios. Não representam pesquisas, previsões ou resultados eleitorais reais.
