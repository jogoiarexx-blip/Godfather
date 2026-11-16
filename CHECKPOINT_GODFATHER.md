# CHECKPOINT ATUAL — GODFATHER v8.13.0

**Atualizado em:** 16/11/2026  
**GDD:** [GDD_GODFATHER_COMPLETO.md](GDD_GODFATHER_COMPLETO.md) v1.6  
**Status:** Fase 4 — sistemas de veículos e garagem implementados, publicados e verificados por testes de lógica. Playtests de navegador real e medição de FPS ainda pendentes.

## Diagnóstico antes de implementar
- Um único modelo de carro com velocidade máxima, giro, aceleração e cor fixos; compra/garagem inexistentes.
- Controle quase exclusivamente por clique: o carro navegava até o alvo, sem condução direta por WASD.
- Batidas e combate usavam um único HP de carro, sem upgrades de blindagem/motor.
- Após destruição, o jogo recuperava automaticamente **100% do HP em 8 segundos** com `setTimeout`, sem pausa e sem custo. Isso anulava a utilidade de reparos.
- O save antigo guardava apenas posição, HP e velocidade do carro, sem modelo, garagem ou upgrades.

## Implementado na v8.13
- **Novo módulo `js/garage-system.js`:** garagem persistente com compra, escolha de veículo, propriedade, upgrades por modelo, conservação individual, manutenção, saldo validado e bloqueio de operações fora da garagem ou durante fuga policial.
- **Quatro veículos com física distinta:**
  - Sedã Corleone: 100 HP, velocidade 10, aceleração 0,45; inicial gratuito.
  - Falcão GT: $5.500; 82 HP, velocidade 13, aceleração 0,65.
  - Fúria V8: $10.500; 135 HP, velocidade 11,4, aceleração 0,77.
  - Fortaleza Blindada: $18.500; 190 HP, velocidade 8,8, aceleração 0,35.
  - HP acompanha o multiplicador de dificuldade da cidade, como já acontecia com o carro original.
- **Upgrades mecânicos** individuais de Motor (velocidade/arrancada), Direção (giro) e Blindagem (vida máxima/mitigação de dano), três níveis cada; custos escalonados por classe.
- **Direção direta WASD** integrada ao `CAR.update`, com ré, freio por tecla contrária e esterço influenciado pela velocidade. Ao pressionar teclas, cancela o destino por clique. O controle antigo por clique permanece funcionando.
- **Reparos pagos** na garagem; upgrades de HP conservam o percentual de dano, e trocar de veículo não pode realizar reparos gratuitos.
- **Destruição:** jogador sai do carro, contador de socorro é baseado no tempo da simulação (respeita pausa), e o veículo retorna com apenas 25% do HP após oito segundos. Reparo total exige pagamento. Trocar para um veículo destruído inicia o mesmo tempo de socorro.
- **Interface e gráficos:** nova aba Garagem na barra lateral, entrada pelo botão **E** perto do ponto físico da garagem (próximo à posição inicial do carro), ponto no minimapa, marcação no mundo e HUD do veículo apenas quando dirigindo. Todos os quatro modelos têm cores, escala e detalhes próprios via Canvas, sem assets externos.
- **Save v23:** novo campo `garage` guarda `selected` e `vehicles` com `owned`, `engine`, `handling`, `armor` e `condition`. `car.recoveryTimer` mantém o contador de socorro. Mantém chave `gf_save_v7`, aceita saves v7–v22 (sedã inicial e upgrades zerados) e aplica limites mecânicos antes do HP e velocidade salvos.
- **Compatibilidade:** um único `CAR` continua sendo usado pelos sistemas de cidade, perseguidores, colisões, missões e autosave. Não há quatro veículos simultaneamente ativos no mapa.

## Arquivos e commits
1. `js/garage-system.js` — módulo de veículos: `21f37aed0ddc9230e7a6f4d2a19bd5cfdb4a63b8`.
2. `css/garage-system.css` — UI da garagem: `5ba8897ec7098150493cd2400318308873de7d97`.
3. `index.html` — menu, aba, entrada na garagem: `170c562dbc74e867cc5c66cc87d437b64b17af73`.
4. `index.html` — condução WASD e recuperação por simulação: `a9c06705e35f69d7bae2762f9267de9042a6ed68`.
5. `index.html` — salvar/carregar garagem, HUD e minimapa: `49082eabfcb53c8bda0832bc78c50059facec1a0`.
6. `index.html` — gráficos distintos dos quatro carros: `244e94e25e7654cd3818c7c6e80ba63009a2e122`.
7. `js/garage-system.js` — migração legada e prevenção de reparo grátis: `67734c2d1def0245f4a4c6aa4c8690b08b526054`.
8. `tests/garage-system.test.cjs` — regressão Node reproduzível: `9322026da349e693b7066bf553a77b7678ff580b`.
9. `js/garage-system.js` — veículos destruídos também respeitam socorro após troca: `6b5f06b903ae21482fa24a298ee15b3714827ac7`.
10. `GDD_GODFATHER_COMPLETO.md` — revisão 1.6: `87bcdb1b64f72e3b8788022b01a50eeb27777aa6`.
11. `index.html` — roadmap dentro do jogo revisado: `2fa76fd97d178fd0112c74c4eded7cefdbcc0428`.

## Testes desta etapa
- **52 verificações em ambiente JavaScript simulado**: disponibilidade, compras, saldo, quatro modelos, diferenças reais de física, HP, direção, blindagem, compra de três trilhas, repair, ressarcimento proibido por troca, WASD, direção por clique, destruição/socorro, save da garagem e migração de versão anterior — passaram.
- **14 verificações de save v23 e legado**: versões 17/19/21/22/23, carros bloqueados, seleção inválida, nível >3, HP/conservação acima de 100%, propriedade obrigatória do sedã e dados insuficientes — passaram.
- Sintaxe combinada dos módulos mais o script inline, verificação estática de integração e sintaxe do teste `tests/garage-system.test.cjs` — passaram.
- **Não testado:** execução da suíte Node em runner real, smoke test no navegador e avaliação de sensação de condução, colisões, perseguições, HUD/GPS em diferentes tamanhos de tela e FPS. Não confundir testes simulados com teste visual aprovado.

## Próximos passos — Fase 4
1. Rodar `node --test tests/*.test.cjs` em um clone local/CI e corrigir falhas observadas.
2. Playtest da direção WASD/clique e colisões com os quatro carros; testar garagem nas três cidades, upgrades, reparo com dinheiro insuficiente, troca e carregamento de save v22.
3. Melhorar comportamento de tráfego urbano: desvio, prioridade de passagem, carros/pedestres e impacto no desempenho, sem quebrar o motor existente.
4. Expandir interiores específicos por cidade e eventos narrativos, com variação efetiva de jogabilidade e saves estáveis.

---

# CHECKPOINT ANTERIOR — GODFATHER v8.12.0

**Atualizado em:** 16/11/2026  
**GDD:** [GDD_GODFATHER_COMPLETO.md](GDD_GODFATHER_COMPLETO.md) v1.5  
**Estado:** Fase 4 (mundo e missões) iniciada; 9 contratos específicos e três mecânicas de contrato integradas. Publicação de código confirmada no GitHub; playtest completo de navegador ainda pendente.

## Diagnóstico de conteúdo
- A campanha mantém 8 modelos de missões por cidade, com 24 etapas e títulos ajustados, mas pouca variedade mecânica realmente exclusiva.
- Os eventos de rua existentes são randômicos e não possuem objetivos narrativos persistentes.
- Sistema principal de missões, GPS, mundo, HUD e saves podiam ser reutilizados para contratos opcionais sem criar mais menus ou substituir campanha.

## Atualização v8.12
- **Nove contratos extras:** três por cidade, escritos individualmente para Nova Corleone, Palermo Oscura e Chicago Noir, com pré-requisitos de respeito, locais e pagamentos específicos.
- **Courier:** ir ao ponto de coleta, pressionar E, transportar a encomenda ao destino e pressionar E novamente (3 missões).
- **Hunt:** eliminar apenas NPCs marcados com ID único do contrato, criados perto do negócio-alvo (3 missões). Mortes com tiro ou melee são contabilizadas; inimigos comuns não contam.
- **Escape/Heist:** executar golpe pressionando E ao lado do local, iniciar perseguição real e só completar quando as estrelas/calor retornarem a zero (3 missões). Não pode executar de dentro de zona segura.
- **UI limpa:** três cartões de contrato dentro da aba Missões, acima das 8 missões principais. Estado, narrativa, recompensa, respeito mínimo, aceite e abandono.
- **GPS vivo:** marcador prioriza contrato opcional ativo, alvos de caçada seguem o NPC vivo mais próximo (em vez do prédio fixo), com identificação vermelha nos sprites inimigos. Missão principal continua ativa por baixo e reaparece depois do contrato.
- **Economia:** recompensa liberada apenas uma vez por contrato e por campanha; contratos terminados não podem ser recomeçados.
- **Interrupções:** abandonar a caçada remove os inimigos vinculados; o início do boss interrompe o contrato antes da limpeza da arena; transição entre cidades abandona contrato ativo da cidade anterior mas mantém os contratos concluídos em cada cidade.
- **Save versão 22:** `cityContracts` salva IDs concluídos por cidade, estágio e progresso do contrato ativo; o campo `cityContractId` persiste nos inimigos específicos. Saves v7–v21 migram para contratos inicialmente vazios. Dados inválidos não são aceitos.
- **Arquivos novos:** `js/city-contracts.js`, `css/city-contracts.css`, `tests/city-contracts.test.cjs`. `index.html` inclui HTML, CSS, módulo, hooks e save v22.

## Publicações principais
1. Motor de contratos: `e4b8e0da5e4a836954ec098b72fa8f32833025e5`.
2. Estilos de UI: `b7638fa6f6b4240226e3ccfdd8b15b56350250be`.
3. Integração ao jogo: `cb8492b450e184e434558ebfc1544a76559ab5c5`.
4. Suite Node reproduzível: `bf4f5b3da2c8935b3b60d67c1b5000bacf1bd278`.
5. Validação de estado de perseguição e cidade do contrato: `818ea7b9b32bd00b05b8de02541c26dc52b911ec`.
6. Validação adicional de save v22: `4b61508108684e87bbbfcce7c6a08beba5823098`.
7. GDD atualizado: `708ea73d3fc24a775122fb1ed0a9ccd16ce195ab`.
8. GPS de caçada que segue o alvo vivo: `ed3b9c40cfcd98fd251c7a4822984fd6f341b0a7`.
9. Marcação visual dos alvos: `3a0dc6b9fbc567d25909e4402dd62568d54fe5e2`.

## Testes executados
- **46 verificações de lógica** em ambiente JavaScript: nove contratos, IDs únicos, entrega em dois pontos, recompensa exata uma vez, kills marcadas, progresso da perseguição, abandono, restauração de caçada e transições de cidade — passaram.
- **12 verificações de integridade de save**: v17, v19, v21 e v22, estados de caçada, fuga inválida, ID/contagem malformada, cidade divergente e falta de dados obrigatórios — passaram.
- **7 verificações adicionais do GPS:** rastreio de inimigo vivo mais próximo, contagem de alvos restantes e limpeza após abandono — passaram.
- **Sintaxe:** módulo de contratos e scripts combinados com o motor e módulos existentes — passou.
- Testes persistentes em `tests/city-contracts.test.cjs` foram **escritos e tiveram sintaxe verificada**, mas a execução real da suite Node no repositório não foi confirmada por este ambiente.
- **Não testado**: comportamento visual completo no navegador, custos de desempenho/FPS, fluxo ponta a ponta da perseguição com clique/teclado, restauração durante uma luta real e balanceamento das três cidades.

## Próxima implementação recomendada
1. Executar `node --test tests/*.test.cjs` em clone local ou CI e corrigir eventuais falhas de integração.
2. Fazer playtest completo de pelo menos um courier, hunt e heist por cidade, com save durante cada etapa.
3. Evoluir **Fase 4**: garagem e veículos dirigíveis, comportamento do tráfego, mais interiores e atividades do mundo sem perda de FPS.
4. Ajustar recompensas dos contratos de Palermo/Chicago e equilíbrio de alvos após observação da economia real do jogador.

---

# CHECKPOINT ANTERIOR — GODFATHER v8.11.0

**Atualizado em:** 16/11/2026  
**GDD:** [GDD_GODFATHER_COMPLETO.md](GDD_GODFATHER_COMPLETO.md), revisão 1.4  
**Status:** Fase 3 — combate/IA avançada (progresso real publicado). Alterações verificadas por testes de lógica e sintaxe; playtests completos em navegador real ainda pendentes.

## Diagnóstico
1. Guarda-costas escolhiam o inimigo mais próximo inclusive atrás de obstáculos; perdiam oportunidades de defender o protagonista quando o adversário estava perto dele.
2. Guarda-costas perseguiam e atacavam policiais mesmo depois de zeradas as estrelas, iniciando conflitos desnecessários.
3. A polícia detectava o jogador a menos de 130 unidades sem verificar paredes, permitindo visão através de edifícios.
4. O deslocamento da busca policial após perder visão era calculado com `Date.now()`, alterando ângulo apesar de pausa longa.
5. O reforço do chefe podia ultrapassar a capacidade desejada; o total de dano potencial de rajadas de 5 tiros crescia linearmente sem orçamento.
6. O estado de vida e substituição dos guarda-costas não era salvo, permitindo recuperá-los apenas recarregando a partida.
7. Após disparo especial de chefe já avisado, um disparo normal podia acontecer imediatamente depois.

## Alterações funcionais
- `js/security-tactics.js`: escolta com modos **follow / engage / protect / recover**, ameaça avaliada por proximidade do protagonista e do guarda e linha de visão efetiva.
- Guarda-costas concentram esforço em proteger o protagonista contra adversários próximos; mantêm distância de escolta quando o alvo está longe e nunca atacam policiais sem estrelas ativas ou com jogador em zona segura.
- Polícia respeita cobertura mesmo a curta distância; não dispara com 0 estrelas. A busca da última posição vista continua em ronda angular determinística dirigida pelo delta de simulação.
- Chefes preservam seus especiais exclusivos da v8.10, mas agora as **rajadas normais** de fases 0/1/2 usam 1/3/5 disparos com orçamento de dano total 1,00× / 1,65× / 2,10×; dano por projétil é repartido.
- Limites de capangas por fase: 3/4/5, com +1 para cidades posteriores. O número gerado é limitado ao espaço disponível e classes de reforços variam por cidade.
- Recuperação mínima de **620 ms** após o especial de um chefe evita a sobreposição imediata de ataques.
- `index.html` integrando a nova IA, polícia, chefes, menu e **save v21**, sem alterar a chave `gf_save_v7`.
- `bodyguardStates` salva HP, estado morto, contador de substituição e contador de tiro de até oito guarda-costas; estados são restaurados depois da aplicação dos upgrades existentes de guardas.
- O campo de busca policial `searchPhase` agora é salvo e restaurado. Saves de versões v7–v20 continuam aceitos, com migração por defaults.
- Nova suíte de regressão `tests/security-tactics.test.cjs`, sem dependências externas; comando: `node --test tests/security-tactics.test.cjs`.

## Commits
- Novo motor: `43dedd77961dccaa0f5236768499980754cca99c`.
- Integração v8.11: `dc303309b2cf8d8ab83c8786dc4453ae2556d326`.
- Intervalo após especiais: `24807d3c4be4b992d244762ceb50062e8a9921b7`.
- GDD v1.4: `500d852edf0fffa302d9f671f397d87f81499e24`.
- Testes Node reproduzíveis: `0bac3c526c962f699b3313d98c58776dbf477054`.

## Testes feitos
- **37 verificações funcionais no ambiente JavaScript**: escolta, ameaças, polícia pacífica, tiro bloqueado, modo protect, vida/respawn, serialização, busca policial determinística, orçamento de rajadas e reforços — passaram.
- **10 verificações de compatibilidade/integridade de save**: v17/v20/v21, HP/guardas, timer impossível, searchPhase não finito, dados ausentes e dinheiro negativo — passaram.
- **6 verificações de visão policial**: cobertura curta e média, zona segura, distância máxima e linha livre — passaram.
- **Sintaxe combinada** dos quatro módulos novos e do script principal — passou.
- Suíte `tests/security-tactics.test.cjs` foi criada e sua sintaxe verificada, mas **a execução real via Node não pôde ser concluída neste ambiente**: o container não resolve `github.com` para buscar a cópia publicada.
- **Pendente:** executar testes visuais e de FPS no GitHub Pages, validar jogo completo, chefes em todas as cidades e importar saves anteriores em navegador real. Não afirmar aprovação desses cenários.

## Próxima fase recomendada
1. Rodar `node --test tests/security-tactics.test.cjs` em um clone local/CI para confirmar a suíte persistente.
2. Playtests completos das batalhas de Barzini, Tattaglia e Stracci com armas base e evoluídas; medir tempo até derrotar cada chefe, taxa de dano e eficácia das esquivas.
3. Validar batalha polícia/guarda e perseguição com 5 estrelas e múltiplos policiais; conferir ausência de queda de FPS.
4. Concluir pendências da Fase 3 e iniciar **Fase 4 — mundo, veículos, conteúdo e missões** conforme GDD.

---

# CHECKPOINT ANTERIOR — GODFATHER v8.10.0

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
