# CHECKPOINT ATUAL — GODFATHER v8.10.0

**Atualizado em:** 16/11/2026  
**GDD:** [GDD_GODFATHER_COMPLETO.md](GDD_GODFATHER_COMPLETO.md), revisão 1.3  
**Status:** Fase 3 (combate/IA) em andamento. Alterações funcionais publicadas; testes de lógica passaram; playtest visual completo no navegador ainda não executado.

## Diagnóstico anterior
- Inimigos de rua perseguiam o jogador com padrões de aproximação repetitivos; não guardavam memória funcional de visão ao perder linha de tiro.
- Inimigos em interiores não aproveitavam diferenças táticas reais entre arquétipos; dano não utilizava multiplicadores por classe.
- Atiradores não tinham tempo de mira para o jogador reagir; brutamontes não apresentavam estilo de disparo próprio.
- Três chefes utilizavam o mesmo ataque especial radial instantâneo, variando apenas número/dano/velocidade; sem aviso de evasão.
- Saves não guardavam os estados novos de percepção e preparo de ataque.

## Implementado nesta etapa
- **Módulo de IA `js/combat-tactics.js`:** percepções com teste de linha de visão, memória temporizada da última posição vista, estado de busca, movimentação lateral e flancos.
- **Capanga:** aproximação até distância de combate e movimentação lateral.
- **Agressor:** aproximação mais rápida com entrada em flanco.
- **Brutamontes:** disparos duplos com dano distribuído, evitando multiplicação excessiva de dano.
- **Atirador:** mantém distância, sinaliza a mira por 750 ms, fixa a posição de disparo antes de atirar e pode perder o alvo ao romper linha de visão.
- **Interiores:** usam mesma lógica de IA, com navegação própria dos cômodos, classe alterando dano e spread; animações de tiro decaem corretamente.
- **Reação a danos:** stagger curto para headshots, golpes corpo a corpo e danos fortes em certos arquétipos (brutamontes resistem mais).
- **Chefes:** aviso visual e ataques especiais próprios: Barzini (anel radial, aviso 850 ms), Tattaglia (leque direcionado, aviso 1020 ms) e Stracci (fogo cruzado, aviso 1180 ms).
- Durante o aviso, o chefe para de realizar tiros comuns, dando tempo para esquiva. O ataque especial é calculado pela simulação, então a pausa não adianta o contador.
- **Saves v20:** `combatEnemySerialize` armazena memória, última posição, intenção de movimento e mira, e `bossWarning` com contagem regressiva/ângulo/fase. Saves v7–v19 são compatíveis e recebem padrões iniciais para os novos campos.
- **Compatibilidade:** coordenadas de memória de versões antigas são escaladas apenas uma vez. Avisos inválidos de chefe são descartados; formatos incompatíveis são rejeitados.
- Roadmap dentro do jogo e versão exibida no menu principal atualizados para 8.10.

## Arquivos e commits
1. `js/combat-tactics.js` — novo motor tático e padrões de ataque: `7a85e230a01c6eb5426f43e62d50a4952b467c6d`.
2. `index.html` — integração combate, interiores, chefes, save v20: `f0b234368c07e65648e9da41ee44e89d05711a9d`.
3. `js/combat-tactics.js` — corrigir duração da animação de tiro: `46b4922b8e953eba57d18b7d6cf91af9b092749a`.
4. `index.html` — migração de memória legada e tiros durante aviso: `8681d4d6320ac284ea74d848ad2552d75eee7c68`.
5. `index.html` — menu e roadmap atualizados: `95b4c30ea8c4ddbdd5501cc197e661adb9c0533d`.
6. `GDD_GODFATHER_COMPLETO.md` — revisão 1.3: `9a49dda41a7acbb529a81cba8ac04fb83435ee12`.

## Verificações realizadas
- **Sintaxe:** compilação do módulo e do script principal combinado via JavaScript — passou.
- **Integrações:** IA na rua/interior; reação a tiros; efeito de mira; avisos de chefe; carregamento e gravação v20; mapa de versões anteriores — passou.
- **30 testes em ambiente simulado:** perseguição, cobertura, abandono de busca, tiros duplos, mira fixa de atirador, reação a dano, batalha especial distinta em cada cidade, contagem de avisos e sanitização — passaram.
- **6 testes adicionais de saves:** formato v17, v19, v20 e rejeições de dados inválidos — passaram.
- **NÃO testado:** jogabilidade completa no navegador, renderização em Canvas e desempenho/FPS em equipamentos reais. Não afirmar que esses cenários foram verificados.

## Próximas ações — Fase 3 (continuação)
1. Playtest de rua e interior nas três cidades, especialmente caminho até o jogador e cobertura sob fogo.
2. Conferir timing das três lutas finais, cancelamento de avisos quando chefe muda de fase ou é derrotado e restauração do save durante ataque especial.
3. Ajustar economia/tempo de combate dos chefes para HP 100–250 e armas melhoradas, mantendo desafios justos.
4. Evoluir guarda-costas, polícia e patrulhas sem travar navegação nem elevar drasticamente CPU.
5. Avaliar materiais e sprites dos inimigos e boss para distinguir visualmente classes sem sobrecarregar GitHub Pages.

---

# CHECKPOINT ANTERIOR — GODFATHER v8.9.0

**Atualizado em:** 16/11/2026  
**GDD:** [GDD_GODFATHER_COMPLETO.md](GDD_GODFATHER_COMPLETO.md) v1.2  
**Fase:** 2 — Arsenal e munição; base funcional publicada, testes visuais e balanceamento pendentes.

## Diagnóstico
O negociante anterior comprava automaticamente a próxima arma com a tecla E. O HUD permitia comprar armas diretamente clicando em slots, fora do negociante. Não havia melhorias de dano/pente/recarga/precisão, pacotes de munição nem persistência dessas evoluções.

## Alterações implementadas
- Oficina modal com abas **Armas**, **Munição** e **Melhorias**, aberta com **E** quando próximo do negociante e a pé.
- Prioridade da interação com negociante quando uma propriedade fica perto dele.
- Compra de shotgun $2.500 e metralhadora $6.000 somente na oficina; clicar em arma bloqueada no HUD agora informa onde comprar.
- Pacotes pequenos e médios de munição: shotgun +8/$200, +20/$450; metralhadora +30/$280, +60/$520; reabastecimento completo $500/$800.
- Pacotes pequenos/médios exigem espaço para **todo o pacote**; nada é cobrado se houver overflow. Recarga completa repõe reserva e carregador.
- Quatro upgrades de arma em 3 níveis: dano, capacidade do pente, velocidade de recarga e precisão (incluindo recuo e penalidade de movimento).
- Bolsa de munição em 3 níveis para shotgun e metralhadora, sem conceder balas gratuitamente no upgrade.
- UI mostra arma, custo, nível, atributos, reserva, carregador e saldo. **ESC** fecha, compras sincronizam HUD e acionam save.
- **Save versão 19** registra `weaponProgress` com os cinco níveis por arma. Saves v7–v18 continuam aceitos com armas base.
- Dados de munição restaurados são limitados às capacidades atuais para evitar estouro de reserva/carregador.
- Reset de novo jogo limpa também os upgrades de armas e encerra a oficina.

## Arquivos e commits
- `js/weapon-progression.js`: lógica e renderização da oficina — `b0bd682d76fb343cdb27575a545da5a6cc45d897`
- `css/weapon-shop.css`: modal responsivo — `e6ec55d011af14b5008281de49d4b16509036dc1`
- `index.html`: integração no jogo, preço/compra restritos, save v19 — `2d783ff62d8be22b19d6d69bef61532d53295c50`
- `index.html`: ajuste de limites de munição restaurada — `1c5a79af25eef9a009ab5ce0f16fde4da23a9c6a`
- `GDD_GODFATHER_COMPLETO.md`: estado v8.9 documentado — `1506b05c9588e75e10c98967be8a7d45738b46b7`

## Testes realizados
- Compilação sintática: módulo e script principal combinados — **passou**.
- Integrações estáticas: CSS/JS linkados, E próximo ao negociante, ausência de compra automática, tecla ESC, save v19, reset e migration — **passou**.
- **31 verificações de lógica** com ambiente JavaScript simulado: preço, compras, recusa por saldo, níveis, atributos derivados, reload, pack de munição, limites de capacidade, painel, snapshot/restauração, restart, alcance e bloqueio fora da loja — **passaram**.
- **6 verificações de save**: v17, v18, v19, dados v19 ausentes, nível inválido e dinheiro inválido — **passaram**.
- Teste visual e sessão completa no navegador: **não executado**. A ferramenta de navegação não conseguiu acessar o GitHub Pages durante esta etapa; publicação de commits foi confirmada diretamente no repositório.

## Riscos e próximo ciclo
1. Testar em navegador real a abertura/fechamento do modal, scroll em resoluções baixas e foco do teclado.
2. Verificar compra durante o combate e mudança de propriedade/território, incluindo proximidade entre vendedor e propriedade.
3. Testar save v18 importado e jogo iniciado com nova versão, inclusive em Palermo e Chicago.
4. Balancear dano máximo da shotgun e os valores das armas na campanha e chefes com HP evoluído.
5. Avançar para Fase 3: IA, animações, combate e padrões exclusivos dos chefes.

---

# CHECKPOINT ANTERIOR — GODFATHER v8.8.0

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
