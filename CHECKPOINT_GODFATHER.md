# CHECKPOINT — GODFATHER WEB EDITION

**Data:** 16/11/2026  
**Versão de código:** v8.8.0  
**Fonte de planejamento:** [GDD_GODFATHER_COMPLETO.md](GDD_GODFATHER_COMPLETO.md)  
**Status:** implementação e testes de lógica concluídos; teste visual e jogo completo em navegador ainda pendentes.

## Entrega atual — Fase 1: evolução do protagonista

### Implementado
- Aba **❤️ Personagem** ao lado de Missões (abrir com tecla P).
- Saúde máxima em cinco estágios: **100 / 130 / 165 / 205 / 250 HP**.
- Recuperação extra fora de combate (níveis 0–3).
- Estamina máxima **100 / 115 / 130 / 150**, barras proporcionais tanto na rua quanto em interiores.
- Resistência de dano de **0 / 5 / 10 / 15%**.
- Colete com capacidade **0 / 25 / 50 / 80**, absorção parcial de dano e reposição.
- Compra de curativo, kit médico e bolsa de emergência com limites de inventário.
- Tecla **H** consome o primeiro kit disponível durante a partida.
- HUD com vida atual/máxima e indicador de colete, quando desbloqueado.
- Compras limitadas a zona segura e saldo suficiente, com confirmação e save imediato.
- Novo jogo limpa upgrades e inventário; trocas entre mapas conservam progressão.
- Saves da versão **18** incluem `playerProgress`. V7–v17 recebem valores iniciais ao carregar; chave `gf_save_v7` foi preservada para compatibilidade.
- Validação estrutural de saves antes de carregar/importar, com proteção do backup anterior quando válido.

### Arquivos alterados/criados
1. `js/player-progression.js` — módulo novo. Commit `bfdcb67b1eae8f91ff438befb3ad40c775834815`.
2. `css/player-progression.css` — painel e HUD. Commit `b97f31caa1863be2ff5208aee12a95a9301322cd`.
3. `index.html` — integrações com personagem, HUD, menu, combate e save. Commit `f49028be1da3e59f753283c602964254ba63f36d`.

### Testes executados
- Compilação sintática: módulo isolado e módulo + script inline (**passou**).
- **19 verificações funcionais** por JavaScript isolado: custo, evolução HP, limites, armadura, redução de dano, cura, consumo de kits, estamina, regeneração dentro/fora de combate, serialização, sanitização e reinício (**passaram**).
- **7 verificações** de integridade de save: formato v17/v18, esquema de upgrades obrigatório e rejeição de estados inválidos (**passaram**).
- Integração estática: caminhos de JS/CSS, chave de save antiga, versionamento, entrada de progresso e integração do dano (**passou**).
- Teste visual completo em navegador e jogabilidade ponta a ponta: **ainda não executados**. A execução containerizada não conseguiu resolver o domínio GitHub Pages; não há afirmação de que a versão publicada já foi validada graficamente.

### Atenções
- Confirmar que o CSS/JS novo está servido no GitHub Pages e não em cache antigo. Recarregar forçadamente se necessário.
- Validar que compras funcionam em zona segura, mas são bloqueadas na rua, interior e carro.
- Confirmar continuação de save v17 com HP original e ausência de perda de progresso.
- Executar a campanha nas três cidades e verificar que a vida máxima persiste nas transições.
- Testar que o painel Personagem não interfere com os menus já existentes e que não há vazamento de listeners.
- Verificar safes antigas com versão 7–11 em navegador real antes de afirmar compatibilidade plena.

## Próximo trabalho — Fase 2: oficina e munição

1. Criar UI de loja de armas e munição no negociante.
2. Aplicar upgrades individuais de dano, carregador, recarga e precisão.
3. Comprar munição em pacotes pequenos/médios e reabastecimento total.
4. Melhorar capacidade de reserva de munição.
5. Salvar atributos e migrar saves v18 de maneira compatível, com testes de regressão.
6. Rebalancear encontros para o HP extra e armas evoluídas.

### Regra do checkpoint
Cada próxima entrega deve registrar problema, alteração, teste executado, commit, validação de save e pendências. Melhorias não devem ser rotuladas como testadas no navegador sem execução real.
