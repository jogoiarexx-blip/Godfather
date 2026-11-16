# GODFATHER WEB EDITION — GDD COMPLETO

**Versão do documento:** 1.3 • **Data:** 16/11/2026  
**Repositório:** https://github.com/jogoiarexx-blip/Godfather  
**Jogo:** https://jogoiarexx-blip.github.io/Godfather/  
**Plataforma atual:** browser desktop, HTML/CSS/Canvas 2D/JavaScript, GitHub Pages  
**Propósito:** documentar o jogo existente e orientar a evolução sem quebrar a campanha.

> **Legenda:** **[ATUAL]** identificado no código; **[PARCIAL]** presente, mas necessita testes/polimento; **[PLANEJADO]** design aprovado para desenvolvimento futuro, não funcional ainda; **[RISCO]** situação técnica a investigar. Não anunciar como implementado algo que esteja apenas neste documento.

---

## 1. Visão geral

**Godfather Web Edition** é um jogo single-player de ação urbana em visão superior/oblíqua, com gerenciamento de império, combate armado, exploração, invasões de interiores, perseguição policial, domínio de negócios, compra de imóveis, guarda-costas, progressão por respeito e campanha dividida em três cidades.

**Fantasia:** começar como soldado e tornar-se o Padrinho Supremo dominando três famílias rivais, apoiado por patrimônio, reputação, melhores armas, maior resistência e aliados.

**Diferencial:** cada propriedade produz renda e muda o controle da cidade, mas pode ser recuperada por uma facção inimiga. Evoluir o protagonista — saúde, armamento, munição e capacidade de combate — deve ser tão importante quanto aprimorar os negócios.

### 1.1 Pilares
1. Ação e resposta: tiro, colisão, cobertura, evasão e combate compreensível.
2. Conquistas com consequência: propriedades lucram, atraem rivais e precisam de defesa.
3. Evolução contínua: patente, vida, estamina, armas, equipamentos, negócios e aliados.
4. Cidade dinâmica: civis, tráfego, polícia, chefes, eventos e ciclo diurno/noturno.
5. Campanha concluível: objetivos claros, chefes de múltiplas fases e progressão entre cidades.
6. Estabilidade primeiro: saves compatíveis, navegador responsivo e desempenho previsível.

### 1.2 Escopo do jogo atual

| Sistema | Escopo confirmado | Estado |
|---|---|---|
| Cidades | Nova Corleone, Palermo Oscura, Chicago Noir | [ATUAL] |
| Territórios | 6 distritos por cidade = 18 | [ATUAL] |
| Negócios | 12 por cidade = 36 | [ATUAL] |
| Missões | 8 modelos adaptados a cada cidade = 24 missões da campanha | [ATUAL] |
| Chefes | Barzini, Tattaglia, Stracci; três fases e ataques especiais exclusivos com aviso visual | [ATUAL — v8.10] |
| Armas | Pistola, shotgun e metralhadora | [ATUAL] |
| Compra de armas e munição | Oficina do negociante com compra selecionável, pacotes e reabastecimento completo | [ATUAL — v8.9] |
| Vida máxima aprimorável | 100 → 250 HP, compras por níveis no painel Personagem | [ATUAL — v8.8] |
| Melhorias das armas | Dano, pente, recarga e precisão (3 níveis) e bolsa de munição | [ATUAL — v8.9] |
| Armadura, kits médicos, estamina aprimorável | Capacidade de colete, cura consumível, 3 níveis de estamina e resistência | [ATUAL — v8.8] |
| Patentes e guardas | Respeito, guarda-costas e 6 melhorias de guardas | [ATUAL] |
| Interiores | Invasão, inimigos, responsável, intimidação | [ATUAL/PARCIAL] |
| Carros e perseguições | Carro jogável, polícia, viaturas e bloqueios | [ATUAL] |
| Casas seguras | 4 por cidade = 12 | [ATUAL] |
| Salvar/continuar | LocalStorage, backup, import/export JSON | [ATUAL/PARCIAL] |
| Mobile/gamepad | Requer design de comando e validação específicos | [PLANEJADO] |

---

## 2. Narrativa e atmosfera

**Ato I — Nova Corleone: A Origem.** O protagonista enfrenta a Família Barzini e aprende a tomar negócios, recrutar aliados, defender territórios e fugir da polícia. Chefe: **Don Vittorio Barzini**.

**Ato II — Palermo Oscura: O Território Siciliano.** Depois de vencer os Barzini, encara a Família Tattaglia em ambiente siciliano com maiores níveis de dificuldade e renda. Chefe: **Don Salvatore Tattaglia**.

**Ato III — Chicago Noir: O Domínio Final.** Conquista uma metrópole controlada pela Família Stracci e encerra sua ascensão como Padrinho Supremo. Chefe: **Don Emilio Stracci**.

**Estilo narrativo:** drama criminal fictício, estética noir de época, ruas ameaçadoras, conflitos entre famílias, ascensão de um protagonista personalizável por equipamento.

**[PLANEJADO]** Prólogo jogável, vinhetas curtas nas transições, introdução visual de cada chefe, diálogos objetivos, reações ao progresso e epílogo. As cenas devem ser puláveis, leves e sem travar a partida.

**Direitos de propriedade intelectual:** nomes e referências à franquia O Poderoso Chefão podem exigir autorização para divulgação comercial. Caso o jogo seja distribuído comercialmente, planejar identidade original ou licenciamento.

---

## 3. Loop de jogabilidade

**Curto (30–90 segundos):** localizar objetivos pelo GPS → deslocar-se → combater/negociar → receber dinheiro/respeito → decidir próximo movimento.

**Médio (5–15 minutos):** selecionar negócio → entrar no interior → derrotar defesa → intimidar proprietário → conquistar estabelecimento → comprar melhoria e munição → defender-se de rivais.

**Longo (campanha):** concluir missões → investir na própria força e em guardas → controlar seis distritos → enfrentar chefe → viajar para próxima cidade → vitória final.

**Regra de design:** sempre permitir que dinheiro seja usado de maneira útil, e não apenas em upgrades econômicos. Saúde, munição e poder das armas devem disputar recursos com imóveis e defesa, produzindo escolhas reais.

---

## 4. Mapa, cidades e territórios

### 4.1 Dados técnicos do mundo [ATUAL]

Cada cidade reutiliza uma base espacial de 2400 × 1800 unidades, multiplicada por 1,38 (3312 × 2484 unidades aproximadas). Ruas, parques, prédios, obstáculos, interiores e pontos de acesso são construídos por dados de mapa e funções de geometria/colisão. Câmera acompanha o personagem e minimapa mostra territórios e objetivos.

### 4.2 Nova Corleone

**Dificuldade:** ×1,0. **Renda:** ×1,0. **Família rival:** Barzini.

| Distrito | Negócios | Renda base combinada |
|---|---|---:|
| Porto Velho | Padaria; Armazém | $150/h |
| Mercado Negro | Bar Clandestino; Ferreiro | $270/h |
| Bairro Italiano | Restaurante; Hotel | $450/h |
| Centro Histórico | Banco; Teatro | $570/h |
| La Cittadella | Cassino; Clube Noturno | $900/h |
| Villa Corleone | Mansão; Porto Privado | $1.300/h |

### 4.3 Palermo Oscura

**Dificuldade:** ×1,5. **Renda:** ×1,4. **Família rival:** Tattaglia. As rendas abaixo são as bases antes do multiplicador e do arredondamento do código.

| Distrito | Negócios | Renda base combinada |
|---|---|---:|
| Porto Antico | Oliveira; Doca Privada | $220/h |
| Mercato Vecchio | Cantina Siciliana; Joalheria | $400/h |
| Quartiere Arabo | Bazar Árabe; Antiquário | $680/h |
| La Kalsa | Igreja Velha; Praça Central | $850/h |
| Borgo Vecchio | Casinò Reale; Clube Jazz | $1.350/h |
| Monte Pellegrino | Castello; Porto Marítimo | $1.950/h |

### 4.4 Chicago Noir

**Dificuldade:** ×2,2. **Renda:** ×2,0. **Família rival:** Stracci. As rendas abaixo são as bases antes do multiplicador.

| Distrito | Negócios | Renda base combinada |
|---|---|---:|
| Little Italy | Pizzeria; Destilaria | $320/h |
| The Loop | Jornal Corrupto; Banco Suíço | $580/h |
| South Side | Bowling Clube; Garagem Blindada | $990/h |
| West Town | Rádio Ilegal; Ringue de Boxe | $1.240/h |
| Chinatown | Cassino Dragão; Jazz Clandestino | $1.980/h |
| Gold Coast | Estádio; Arranha-céu | $2.860/h |

**Conquista:** cada distrito possui dois negócios; o controle passa ao jogador quando ambos são dominados. Rivais podem recuperar propriedades e provocar perda de domínio. A defesa, a renda e o mapa devem ser recalculados em qualquer alteração.

**[PLANEJADO]** Destaque visual diferente por distrito, desafios locais, áreas únicas, patrulhas específicas e pontos de interesse para incentivar a exploração em vez de seguir somente marcadores.

---

## 5. Personagem principal — progressão completa

> **PRIORIDADE DE DESENVOLVIMENTO P1.** Esta seção detalha a evolução pessoal que falta ao jogo. Não confundir com upgrades de guarda-costas ou propriedades.

### 5.1 Estado inicial [ATUAL]

- Vida: **100 HP**.
- Arma inicial: pistola (25 de dano, carregador de 12, reserva infinita).
- Corrida: estamina inicial **100**, multiplicador de velocidade de cerca de 1,7× ao ar livre.
- Invulnerabilidade após dano: aproximadamente 400 ms.
- Regeneração fora de combate: cerca de 0,5 HP/s, quando não há inimigos próximos nem estrelas.
- Recuperação em zona segura: cerca de 2 HP/s.
- Dinheiro inicial: **$1.000**.
- Respeito inicial: **0**.
- Estado inicial de armas: shotgun e metralhadora bloqueadas.

### 5.2 Menu de evolução do jogador [PARCIAL — v8.8: treinamento e suprimentos implementados; arsenal na fase 2]

A aba **PERSONAGEM** já oferece treinamento e suprimentos na zona segura (atalho **P**, kits pelo **H**). A proposta final inclui quatro categorias:
- **Saúde & resistência:** vida máxima, recuperação, estamina e armadura.
- **Combate:** precisão geral, controle de recuo e movimentação tática.
- **Arsenal:** melhoria da pistola, shotgun e metralhadora individualmente.
- **Suprimentos:** loja de munição e kits médicos com custo claro.

Toda compra mostra preço, nível atual, valor atual, novo valor e impacto esperado. Comprar deve produzir efeito imediato, persistir no save e não exigir reiniciar a fase.

### 5.3 Vida máxima — evolução de cinco níveis [ATUAL — v8.8]

| Nível de treinamento | HP máximo | Preço para chegar ao nível | Requisito sugerido |
|---|---:|---:|---|
| 0 — Inicial | 100 | — | Início |
| 1 — Constituição | 130 | $2.000 | Livre |
| 2 — Corpo Resistente | 165 | $5.000 | Associado |
| 3 — Sobrevivente | 205 | $12.000 | Caporegime |
| 4 — Veterano | 250 | $25.000 | Consigliere |

**Regras:** a compra aumenta HP máximo e recupera somente a diferença de máximo (ex.: 45/100 torna-se 75/130 ao comprar nível 1); nunca cura totalmente de graça. HP não pode ultrapassar máximo; limite 250 nesta primeira versão. Melhorias são permanentes na campanha e não se repetem ao retornar à loja. Ao continuar um save antigo, assumir nível 0 e preservar HP original.

### 5.4 Regeneração e resistência [ATUAL — v8.8]

**Linha Recuperação:** três níveis, custos **$1.500 / $4.000 / $9.000**; bônus de cura fora de combate +0,25 / +0,50 / +0,75 HP/s sobre a taxa base, sem permitir cura ativa sob fogo inimigo. Na zona segura, utilizar regra separada e limite total de cura por segundo para evitar efeito excessivo.

**Linha Estamina:** níveis 0–3 com máximo **100 / 115 / 130 / 150**, custos **$1.200 / $3.500 / $8.000**. A corrida continua gastando estamina; recuperação proporcional ao máximo. Interromper corrida quando estiver abaixo do mínimo, conforme regra existente.

**Linha Resistência a impacto:** três níveis com redução de dano não explosivo sugerida de **5% / 10% / 15%**, preços **$2.500 / $7.000 / $16.000**, depois de aplicação de armadura, sem combinar multiplicativamente sem teto.

### 5.5 Colete/armadura [ATUAL — v8.8]

Armadura é separada de HP e pode ser consumida. Níveis de capacidade: **0 / 25 / 50 / 80**, com melhorias permanentes **$3.000 / $8.000 / $18.000**. Colete absorve **50%** do dano recebido até acabar; o restante atinge HP. Comprar capacidade aumenta o limite, mas não repõe toda a armadura automaticamente.

**Reabastecimento de armadura:** custa **$150** para +25 pontos; **$350** para +60 pontos; a quantidade efetiva nunca ultrapassa a capacidade atual. Não vender colete a quem ainda não desbloqueou armadura.

### 5.6 Kits médicos [ATUAL — v8.8]

| Item | Efeito | Preço sugerido | Restrição |
|---|---|---:|---|
| Curativo | Recupera 35 HP | $300 | Sem efeito acima do máximo |
| Kit médico | Recupera 90 HP | $750 | Uso fora de animação de dano |
| Bolsa de emergência | Recupera 160 HP | $1.400 | Disponível nas casas seguras |

Proposta: comprar kits os coloca em inventário com limites (3 curativos, 2 kits, 1 bolsa), e usar requer ação dedicada. Não consumir se HP estiver cheio; não aplicar cura superior ao limite. Comprar na zona segura ou com vendedor; itens de chão continuam funcionando conforme sistema existente.

### 5.7 Regras de progressão pessoal

- Treinamentos só podem ser adquiridos na aba Personagem em casa segura ou vendedor designado, para evitar compra em plena troca de tiros.
- Pré-requisitos de patente não devem impedir acesso a kits de sobrevivência básicos.
- Testar o jogador com 100 HP e 250 HP em todas as lutas para não trivializar o conteúdo.
- O jogador deve ver a vida numérica e percentual no HUD; mostrar armadura separada quando houver.
- Recompensa de chefe pode curar, mas não elevar HP máximo permanentemente sem uma compra/progressão documentada.
- O reinício de nova campanha deve restaurar níveis e HP iniciais; continuar não pode resetar investimentos.

---

## 6. Arsenal — compra, munição e melhorias permanentes

### 6.1 Armas existentes [ATUAL]

| Arma | Dano base | Cadência (intervalo) | Carregador | Reserva inicial | Tempo de recarga |
|---|---:|---:|---:|---:|---:|
| Pistola | 25 | 175 ms | 12 | Infinita | 950 ms |
| Shotgun | 30 por pellet × 6 | 650 ms | 5 | 20 | 1.450 ms |
| Metralhadora | 18 | 88 ms | 30 | 90 | 1.750 ms |

**Compra atual:** shotgun **$2.500**; metralhadora **$6.000**; pistola gratuita. O código possui função de compra de munição **por recarga completa**: shotgun **$500**, metralhadora **$800**, e restaura reserva e carregador. O negociante pode ser acionado por interação perto do ponto designado; o HUD também oferece interação com slots de arma.

**Atualização v8.9:** oficina visual concluída com seleção de armas, melhorias e pacotes de munição. A pistola continua com reserva infinita, por design. A loja de suprimentos médicos continua na aba Personagem. A validação visual completa no navegador permanece pendente.

### 6.2 Oficina de armas — categorias de melhoria [ATUAL — v8.9]

Cada arma tem quatro linhas independentes, três níveis por linha:

1. **Dano** — aumento moderado e limitado, sem multiplicações infinitas.
2. **Carregador** — mais tiros antes de recarregar.
3. **Recarga** — diminui tempo sem munição pronta.
4. **Precisão/estabilidade** — reduz spread e recuo; não elimina totalmente penalidade ao atirar correndo.

A loja deve mostrar disponibilidade, nível (0/3 a 3/3), custo e diferença numérica. Todas as melhorias dependem de a arma ter sido comprada, exceto as da pistola inicial.

### 6.3 Tabela de dano e carregador [ATUAL — v8.9]

| Arma | Dano N0 → N1 → N2 → N3 | Carregador N0 → N1 → N2 → N3 |
|---|---|---|
| Pistola | 25 → 27 → 29 → 32 | 12 → 14 → 16 → 18 |
| Shotgun (por pellet) | 30 → 32 → 34 → 36 | 5 → 6 → 7 → 8 |
| Metralhadora | 18 → 19 → 20 → 22 | 30 → 35 → 40 → 45 |

O dano da shotgun é por projétil e precisa ser conferido contra os seis pellets; no máximo nível, disparo concentrado pode ser muito forte. Exigir playtest antes de implementar números finais.

### 6.4 Preços por arma e categoria [ATUAL — v8.9]

| Arma | Dano N1/N2/N3 | Carregador N1/N2/N3 | Recarga N1/N2/N3 | Precisão N1/N2/N3 |
|---|---|---|---|---|
| Pistola | $1.200 / $3.500 / $8.000 | $1.000 / $2.800 / $6.000 | $900 / $2.600 / $5.500 | $1.000 / $3.000 / $7.000 |
| Shotgun | $2.500 / $6.500 / $15.000 | $2.000 / $5.000 / $12.000 | $2.000 / $5.500 / $13.000 | $1.800 / $5.000 / $11.000 |
| Metralhadora | $4.000 / $10.000 / $22.000 | $3.500 / $9.000 / $20.000 | $3.000 / $8.500 / $19.000 | $3.500 / $9.500 / $21.000 |

**Recarga:** nível 1 −8%, nível 2 −16%, nível 3 −24% em comparação com o tempo base. **Precisão:** nível 1 −10%, nível 2 −18%, nível 3 −25% em dispersão/recuo, com teto e preservação do comportamento individual de cada arma. **Regra:** o preço do nível N deve ser pago em sequência, sem permitir saltos de nível.

### 6.5 Loja de munição — pacotes [ATUAL — v8.9]

Os pacotes e reabastecimento completo estão disponíveis na oficina do negociante. Pacotes pequenos/médios exigem espaço suficiente na reserva para a quantidade completa; caso contrário, não há débito. A recarga completa usa o preço fixo e repõe reserva e carregador.

| Arma | Pacote pequeno | Pacote médio | Reabastecimento completo existente |
|---|---|---|---|
| Pistola | Reserva infinita (sem compra) | — | Sem custo |
| Shotgun | +8 cartuchos por $200 | +20 cartuchos por $450 | Até máximo de reserva e carregador por $500 |
| Metralhadora | +30 balas por $280 | +60 balas por $520 | Até máximo de reserva e carregador por $800 |

**Regras de transação:**
- Pequeno/médio acrescentam somente à reserva, até o limite. Recarregar a arma durante o jogo transfere munição da reserva para o carregador.
- O reabastecimento completo repõe reserva e carregador (compatibilidade com a lógica atual).
- Armas não compradas não recebem munição.
- Se a reserva estiver quase cheia, mostrar quantidade efetiva e oferecer preço proporcional ao total recebido **ou** bloquear pacote que desperdice munição; escolher uma política uniforme e testar.
- Não cobrar dinheiro se a operação não puder fornecer munição.
- Sem munição negativa, preço negativo, reserva acima do limite ou compras repetidas por clique duplo.
- A compra deve ser desabilitada durante loading, pausa e combate crítico quando a loja não estiver aberta.
- Informar claramente “carregador / reserva” e quantidade após a operação.
- Preços são de game design e podem ser reajustados após teste de economia.

### 6.6 Crescimento da capacidade de munição [ATUAL — v8.9]

Criar upgrades de **bolsa de munição** de 3 níveis, por arma: reserva de shotgun **20 → 30 → 40 → 60**, reserva da metralhadora **90 → 120 → 150 → 180**. Preços shotgun **$2.000 / $5.000 / $10.000**, metralhadora **$3.000 / $7.000 / $15.000**. O upgrade aumenta a capacidade, não entrega toda a nova munição de graça; um pacote de munição deve preencher respeitando o limite atualizado.

### 6.7 Fluxo de loja

1. Aproximar-se do negociante e pressionar **E**.
2. Abrir um **painel de loja** com abas “Armas”, “Munição” e “Melhorias”; suprimentos médicos permanecem na aba Personagem.
3. Escolher categoria e item, visualizar custo, atributos e saldo.
4. Confirmar compra somente quando houver saldo e o limite permitir.
5. Debitar uma vez; atualizar HUD e mostrar confirmação.
6. Salvar após compra; fechar loja devolve controle sem travar teclado/mouse.

**Interface compacta:** cartão da arma, dano, cadência, carregador, nível da melhoria, munição atual e botão único. Evitar mais de um pop-up por compra.

---

## 7. Árvore de habilidades — evolução futura integrada

**[PLANEJADO]** Um sistema adicional de pontos de habilidade, não substituindo melhorias por dinheiro. Objetivo: permitir estilos diferentes mantendo o jogo balanceado.

**Fontes sugeridas de pontos:** 1 por patente inédita e 1 ao concluir cada missão principal pela primeira vez. Não premiar eliminação repetitiva com pontos infinitos.

| Ramo | Especializações | Benefício máximo sugerido |
|---|---|---|
| Sobrevivência | Fôlego, regeneração, primeiros socorros | Complementar a vida comprada sem duplicar bônus |
| Pistoleiro | Precisão, troca de arma, foco | Melhoria situacional, não dano infinito |
| Liderança | Comando e coordenação de aliados | Melhor IA e resistência de grupo |
| Negócios | Negociação e defesa de patrimônio | Redução moderada de custo, defesa e renda |
| Condução | Controle, reparo e evasão | Carro mais resistente e fuga mais precisa |

**Não duplicar atributos:** o sistema de loja fornece HP máximo, dano base e carregador; a árvore deve oferecer comportamento ou bônus condicionais. Toda melhoria precisa de teto, descrição e teste combinatório.

---

## 8. Inimigos e IA

**[ATUAL]** Quatro arquétipos principais:
- **Capanga:** HP relativo 1,0×; velocidade 1,0×; combate médio.
- **Agressor:** HP 0,78×; velocidade 1,48×; aproximação rápida.
- **Brutamontes:** HP 2,1×; velocidade 0,72×; dano alto.
- **Atirador:** HP 0,86×; velocidade 0,82×; combate a distância.

Rivais patrulham, perseguem, fazem ataques a propriedades e podem recuperar negócios. Guardas de propriedade e guarda-costas protegem o jogador. A polícia patrulha e investiga pela linha de visão, pela última localização conhecida e por níveis de procurado.

**[PLANEJADO]** Formalizar IA em estados patrulha → suspeita → busca → combate → recuo → retorno, com decisões espaçadas para preservar FPS, coberturas reais, comunicação entre inimigos, variação local de facção e telegráficos para ataques especiais.

---

## 9. Chefes e conclusão por cidade

| Cidade | Chefe | HP nominal de configuração | Dano nominal | Recompensa ao derrotar |
|---|---|---:|---:|---|
| Nova Corleone | Don Vittorio Barzini | 950 | 16 | $25.000 + 1.400 respeito |
| Palermo Oscura | Don Salvatore Tattaglia | 1.450 | 20 | $45.000 + 2.200 respeito |
| Chicago Noir | Don Emilio Stracci | 2.050 | 25 | $80.000 + 3.500 respeito |

**[ATUAL]** O HP recebe ainda modificador por cidade ao criar o boss. Três fases são escolhidas pelo percentual de vida: acima de 66%, entre 66% e 33%, abaixo de 33%. Fases mudam velocidade, distância, rajada principal, explosão radial e reforços.

**[PLANEJADO]** Chefes precisam de arena e mecânica exclusiva, não só valores maiores:
- **Barzini:** controle de cobertura e ataques cruzados de capangas.
- **Tattaglia:** rotações, obstáculos e ameaças que forçam reposicionamento.
- **Stracci:** última fase com pressão de reforços, bloqueios e padrões complexos porém legíveis.

**Critério de vitória:** controlar todos os seis distritos, enfrentar e derrotar o chefe, receber recompensa e escolher viajar para a próxima cidade ou explorar o mapa conquistado.

---

## 10. Campanha — 24 missões

A base de código usa **oito modelos de missão por cidade**, com títulos, recompensas e textos adaptados. As 24 etapas da campanha não equivalem a 24 sistemas exclusivos.

| # | Nova Corleone | Palermo Oscura | Chicago Noir | Objetivo mecânico |
|---|---|---|---|---|
| 1 | Cobrança no Cais | Mercadoria Siciliana | Carga de Chicago | Dominar negócio inicial designado |
| 2 | Sangue na Doca | Lei da Omertà | Rajada na Chuva | Eliminar 5 inimigos |
| 3 | Bar dos Barzini | Mercato de Sangue | Clube dos Stracci | Dominar terceiro negócio |
| 4 | Limpeza do Porto | Varrer Palermo | Noite Sem Testemunhas | Eliminar 15 inimigos |
| 5 | Ruas em Chamas | Fuga pelas Vielas | Sirene na Avenida | Ter 3+ estrelas e escapar |
| 6 | Cofre do Centro | Cofre dos Tattaglia | Dinheiro de Chicago | Dominar negócio do índice 6 |
| 7 | Noite de Ouro | Palazzo em Chamas | Jazz e Cassino | Tomar negócios de índices 8 e 9 |
| 8 | O Acerto Barzini | Queda de Tattaglia | Último Ato de Stracci | Dominar distritos e derrotar chefe |

**Recompensas-base** por missão, antes de fator de cidade: 1) $500/200 respeito; 2) $1.000/300; 3) $2.000/500; 4) $3.000/700; 5) $4.000/1.000; 6) $8.000/1.500; 7) $15.000/2.500; 8) $50.000/5.000.

**[PLANEJADO]** Criar ao menos quatro missões exclusivamente desenhadas por cidade (proteção de comboio, furto de informação, fuga em veículo, defesa de patrimônio). Cada missão terá briefing, falha, checkpoints, recompensas, GPS e conclusão visível.

---

## 11. Imóveis, economia e defesa do império

**[ATUAL]** O jogador domina negócios e pode comprar melhorias de produção e de guardas (níveis 1–3). Renda horária equivale à soma dos negócios dominados multiplicada pelo bônus do respectivo nível.

**Fórmula atual:**

    dinheiro += (renda_horaria / 3600) × delta_tempo_em_segundos

Existem imóveis seguros com regeneração e guardas. Locais por cidade:
- **Nova Corleone:** Apartamento do Cais $8.000; Chalé Italiano $18.000; Casa do Contador $30.000; Mansão Oculta $60.000.
- **Palermo Oscura:** Casarão Siciliano $15.000; Villa Árabe $35.000; Convento Abandonado $55.000; Palazzo Fortezza $100.000.
- **Chicago Noir:** Armazém Secreto $25.000; Clube Privado $60.000; Bunker Subterrâneo $90.000; Penthouse Chicago $160.000.

**[PLANEJADO]** Incluir relatório de fluxo de caixa, custo total de upgrades, risco de ataque, tempo de retorno do investimento e menu de defesa de território com indicadores claros. Controlar inflação econômica para que as melhorias de personagem continuem relevantes em Palermo/Chicago.

---

## 12. Respeito, patentes e guardas

| Patente | Respeito mínimo | Guarda-costas base |
|---|---:|---:|
| Soldado | 0 | 0 |
| Associado | 300 | 0 |
| Caporegime | 800 | 1 |
| Consigliere | 2.000 | 2 |
| Underboss | 4.000 | 2 |
| Don | 8.000 | 3 |

**[ATUAL]** Seis linhas de upgrades (três níveis cada): vida dos guarda-costas, dano/cadência dos guarda-costas, quantidade de guarda-costas, vida dos guardas de negócios, dano dos guardas e alcance de vigilância.

**[PLANEJADO]** Adicionar ordens simples: seguir, defender posição, recuar, proteger patrimônio. Guardas não devem bloquear passagem ou receber duplicações após save/load, upgrade ou troca de mapa.

---

## 13. Polícia, calor e perseguição

**[ATUAL]** Calor policial na faixa 0–100 com 0–5 estrelas, derivadas de `Math.floor(heat/20)`. Crimes aumentam calor; tempo, perda de contato visual e zonas seguras permitem reduzir a perseguição. A polícia usa linha de visão, última localização vista, busca, reforços e combate. No carro, viaturas perseguem e bloqueios surgem em níveis altos.

**[PLANEJADO]** Escalada mais clara:
- 1 estrela: patrulha local.
- 2 estrelas: busca ativa e mais unidades.
- 3 estrelas: viaturas em perseguição.
- 4 estrelas: bloqueios e reforços.
- 5 estrelas: pressão máxima, mas com fuga possível.

**Critérios:** não aparecer dentro de prédios; não atirar através de paredes; não atravessar geometria; respeitar zona segura; não persistir perseguição infinita sem visão.

---

## 14. Veículos, pedestres e eventos

**[ATUAL]** Carro do protagonista possui velocidade, direção, dano, colisão, entrada/saída e interação com perseguidores. Tráfego e civis percorrem ruas; civis reagem a ameaças; eventos temporários incluem dinheiro, munição e emboscadas. O relógio de mundo usa **12 minutos reais para 24h no jogo**, com transição noite/dia.

**[PLANEJADO]** Garagem, classes de veículos, reparo e melhorias de direção, colisão, iluminação e sensação de movimento; comportamentos de tráfego mais naturais e eventos por bairro.

---

## 15. Interiores, invasões e intimidação

**[ATUAL]** Entrada por interação, loading por etapas, paredes/móveis com colisão, inimigos internos, gerente/responsável, minijogo de intimidação e retorno à rua. A sequência de intimidação usa teclas **Q/W/E/R/F**, com 3–6 passos e barra de pressão. Falha pode gerar reforços.

**Regras de qualidade:** nenhum interior sem saída; colisão consistente; inimigos não atravessam paredes; morte/salvamento dentro do prédio não corrompe a campanha; recompensa só após conclusão legítima.

**[PLANEJADO]** Mais cenários exclusivos, rotas alternativas, coberturas úteis, proprietários visualmente diferentes, NPCs dinâmicos e missões com objetivos próprios.

---

## 16. UI, HUD e menus

### 16.1 Estrutura [ATUAL]
Menu inicial, configurações, controle de saves, remapeamento, HUD, arma/munição, mini mapa, GPS, painel lateral, missões, negócios, upgrades, guardas, casas seguras, carregamento, interiores, intimidação, pausa, derrota, vitória e conquista de cidade.

### 16.2 Melhorias necessárias [PLANEJADO]
- **HUD central limpo:** vida atual/máxima, armadura, estamina, munição “carregador/reserva”, objetivo e dinheiro.
- **Painel Personagem:** perfil, atributos, upgrades e próximas patentes.
- **Loja de armas e munição:** abas com custos e ganhos descritos.
- **Aviso contextual:** pouca munição, pouca vida, propriedade sob ataque, carregando save, compra efetuada.
- **Acessibilidade:** texto legível, modo compacto, ocultar tremor e flashes, controles remapeáveis e feedback que não dependa só de cor.
- **Telas pequenas:** evitar HUD fora da área visível; não supor suporte a toque antes de implementar.

**Regra de compra:** confirmação visível, uma transação por clique, botão desabilitado se sem dinheiro, estado imediatamente atualizado, informação persistente.

---

## 17. Áudio, animações e gráficos

**[ATUAL]** Canvas 2D, spritesheets WebP do protagonista, inimigos, guardas e policiais, partículas, impactos, sombras, iluminação, efeitos de tela e áudio via Web Audio API. Presets de qualidade low/medium/high/ultra.

**[PLANEJADO]**
- Animações mais fluidas e distintas para idle, caminhada, corrida, tiro, recarga, acerto, queda e morte.
- Melhorar relação sprite/hitbox e feedback de impacto.
- Diferenciar visualmente cada cidade e cada chefe.
- Efeitos de tiro sem sobrecarga de transparências em grande escala.
- Sons para compra de upgrades, cura, armadura quebrando, recarga e arma sem munição.
- Priorizar assets compactos para GitHub Pages; nenhum arquivo gigante bloqueando o menu.

---

## 18. Arquitetura técnica atual e evolução

### 18.1 Situação [ATUAL/PARCIAL]

O principal código executável está concentrado em **`index.html`** com script inline grande. Existem pastas **`js/`** e **`css/`**, mas é necessário conferir integração: a mera presença de módulos não comprova que estejam sendo usados no runtime.

**Pontos prioritários:** separar estado, renderização e UI; eliminar duplicidades; evitar operações DOM a cada quadro; proteger efeitos e callbacks assíncronos durante trocas de mapa; validar save antes de carregar.

### 18.2 Estrutura modular alvo [PLANEJADO]

    /index.html
    /src/main.js
    /src/core/GameLoop.js
    /src/core/GameState.js
    /src/data/maps.js
    /src/data/missions.js
    /src/data/economy.js
    /src/data/weapons.js
    /src/actors/Player.js
    /src/actors/Enemy.js
    /src/actors/Boss.js
    /src/systems/Progression.js
    /src/systems/Inventory.js
    /src/systems/Shop.js
    /src/systems/Combat.js
    /src/systems/Police.js
    /src/systems/Territory.js
    /src/systems/SaveManager.js
    /src/world/Collision.js
    /src/world/Interior.js
    /src/world/Traffic.js
    /src/render/Renderer.js
    /src/ui/HUD.js
    /src/ui/CharacterPanel.js
    /src/ui/WeaponShop.js
    /assets/
    /tests/

**Regra:** refatorar um subsistema por vez, com testes, sem reescrever tudo de uma vez e sem romper a hospedagem estática.

---

## 19. Save, versões e dados do protagonista

### 19.1 Formato existente [ATUAL]

O save usa `localStorage`, chave `gf_save_v7` (mantida por compatibilidade) e payload que se identifica como **versão 20**. Inclui posição, HP atual, economia, propriedades, missões, armas/munição, guarda-costas, chefes e outros estados. Existem autosave, save manual, backup e importação/exportação.

### 19.2 Extensão v19 [ATUAL — playerProgress e weaponProgress implementados]

O formato v19 preserva `playerProgress` (v18) e adiciona `weaponProgress` (níveis de dano, carregador, recarga, precisão e bolsa por arma). Saves de versões antigas v7–v18 são migrados com níveis de armas zerados. Estrutura:

    playerProgress: {
      healthLevel: 0,
      regenLevel: 0,
      staminaLevel: 0,
      resistanceLevel: 0,
      armorCapacityLevel: 0,
      armorCurrent: 0,
      medkits: { bandage: 0, standard: 0, emergency: 0 }
    },
    weaponProgress: [
      { damageLevel: 0, magazineLevel: 0, reloadLevel: 0, accuracyLevel: 0, bagLevel: 0 },
      { damageLevel: 0, magazineLevel: 0, reloadLevel: 0, accuracyLevel: 0, bagLevel: 0 },
      { damageLevel: 0, magazineLevel: 0, reloadLevel: 0, accuracyLevel: 0, bagLevel: 0 }
    ]

### 19.3 Extensão v20 — estado tático e avisos de chefe [ATUAL]

O save v20 mantém as versões v7–v19 aceitas e grava os campos de IA dos inimigos de rua: `aiMemory`, `aiLastX`, `aiLastY`, `strafeSide`, `strafeTimer`, `aimTimer`, `aimX` e `aimY`. Chefes também gravam `bossWarning` com tipo, direção, duração, tempo restante e fase. Dessa forma, carregar a partida não reinicia arbitrariamente o aviso de ataque especial já iniciado. O sistema sanitiza avisos inválidos e restaura memória tática padrão quando o save anterior não possui esses campos.

**Notas de combate v8.10:** inimigos comuns precisam ter linha de visão para atirar; se perderem o alvo, procuram brevemente a última posição confirmada. Atiradores fazem mira de 750 ms com linha visível. Brutamontes disparam dois projéteis reduzidos para manter o dano próximo do orçamento original. Chefes interrompem o disparo normal durante o ataque sinalizado. Os três padrões exigem playtest real para calibrar justiça e dificuldade.

**Invariantes de save:** upgrades entre 0 e 3 (vida pode chegar ao nível 4); munição entre 0 e capacidade; armadura ≤ capacidade; HP entre 0 e máximo; dinheiro finito não negativo; dados desconhecidos não quebram a migração; valores e IDs de armas são independentes da interface.

**Migração:** versões anteriores à v18 recebem atributos iniciais de personagem; versões anteriores à v19 recebem níveis de armas zerados e seus atributos originais. A restauração do progresso acontece antes da munição, que é limitada pela capacidade máxima. Manter backup válido antes de gravar a nova versão.

---

## 20. Performance, metas e testes

### 20.1 Desempenho [PLANEJADO]
- Meta de 60 FPS em desktop de referência; degradar elementos cosméticos para manter responsividade em máquinas fracas.
- Movimentação, tiros e cooldowns independentes da variação de FPS.
- Culling de sprites fora da câmera; cache de geometria estática; pools de partículas se necessário.
- IA em intervalos controlados; limitar entidades e evitar DOM em cada frame.
- Medir tempo de frame, memória, carregamento e uso de assets; não presumir melhoria sem comparação.

### 20.2 Matriz de testes obrigatória

| ID | Cenário | Critério de aceite |
|---|---|---|
| T01 | Abrir menu e novo jogo | Assets carregam e simulação inicia |
| T02 | Nova campanha após jogar muito | Dinheiro, upgrades, vida, armas, missões e estados reiniciam |
| T03 | Comprar vida máxima N1–N4 | Preço correto, HP máximo correto, sem cura total indevida |
| T04 | Salvar/continuar após comprar saúde | Nível, máximo e HP atual retornam iguais |
| T05 | Comprar armadura, sofrer dano, reparar | Absorção e limites corretos |
| T06 | Comprar kits e usar | Compra única, item consumido, cura dentro do teto |
| T07 | Comprar shotgun/metralhadora | Só libera com saldo, debita uma vez |
| T08 | Comprar munição pequena/média/cheia | Limites, preço e HUD sempre sincronizados |
| T09 | Comprar upgrades de uma arma | Dano, carregador, recarga e precisão aplicados corretamente |
| T10 | Carregador maior e save | Munição não duplica e permanece dentro da nova capacidade |
| T11 | Arma sem munição | Mensagem e recarga coerentes, sem disparo gratuito |
| T12 | Derrota e continue | Estado de derrota não trava save válido |
| T13 | Conquista e recaptura de distrito | Economia, HUD, guardas e dono recalculados |
| T14 | Pausa durante batalha de chefe | Spawn/ataques não continuam com jogo pausado |
| T15 | Interior completo | Entrada, combate, intimidação, saída e save |
| T16 | Polícia perde visão atrás de edifício | Busca sem tiro através da parede |
| T17 | Perseguição de carro | Colisão, velocidade e bloqueios consistentes |
| T18 | Passar de Nova Corleone para Palermo | Progresso pessoal permanece, dados da cidade mudam |
| T19 | Concluir Chicago | Vitória final, recompensa e save íntegros |
| T20 | Importar save antigo/JSON inválido | Migração correta e nenhum dado válido perdido |
| T21 | 30 minutos de partida | Sem vazamento progressivo de CPU/DOM/memória |
| T22 | Navegador em tela menor | HUD e loja acessíveis e legíveis |

**Pronto significa:** compilação/sintaxe + testes automatizados + smoke test real no navegador + validação de saves e regressões + commit rastreável. Não declarar “testado no navegador” se apenas o código foi lido.

---

## 21. Roadmap detalhado

### Fase 0 — Integridade e correções críticas

1. Verificar em navegador o reinício correto do jogo, a recuperação de distritos, spawn de chefe, interiores e save.
2. Centralizar validação de saves e backups.
3. Corrigir timers fora do ciclo de simulação, callbacks obsoletos e múltiplos loops.
4. Confirmar que o jogo atual completa a campanha nos três mapas.
5. Escrever testes de regressão.

**Entrega:** campanha existente segura e continuável.

### Fase 1 — EVOLUÇÃO DO PROTAGONISTA [IMPLEMENTADO v8.8, validação manual pendente]

1. Adicionar `PlayerProgress`, atributos derivados e caps.
2. Criar UI de Personagem e loja de HP, regeneração e estamina.
3. Implementar armadura, kits médicos e HUD apropriado.
4. Salvar upgrades e migrar v17 → v18.
5. Implementar testes de vida, dano, cura, nova campanha e save.

**Entrega:** personagem pode crescer de 100 até 250 HP e usar equipamentos de sobrevivência com economia real.

### Fase 2 — ARMAS E MUNIÇÃO [BASE FUNCIONAL v8.9 — balanceamento e validação visual pendentes]

1. Criar loja visual dividida em Armas, Munição e Melhorias; suprimentos permanecem na aba Personagem.
2. Manter funcionalidade existente de compra de shotgun e metralhadora.
3. Oferecer pacotes de munição e reabastecimento completo.
4. Implementar dano, carregador, recarga e precisão com três níveis por arma.
5. Implementar bolsas de munição, limites, testes e salvamento.
6. Ajustar dificuldades de Palermo/Chicago sem invalidar saves.

**Entrega:** todas as três armas possuem progressão própria e munição pode ser comprada de forma intuitiva.

### Fase 3 — COMBATE E IA [EM ANDAMENTO v8.10]

1. [PARCIAL] Reações a headshot e melee; decaimento correto de animações de disparo em interiores.
2. [PARCIAL] IA tática dos quatro arquétipos com busca, memória de última visão, flanco e aviso de mira. Melhorias de guarda-costas permanecem pendentes.
3. [PENDENTE] Validar colisões, cobertura e perseguição policial com sessões completas de navegador.
4. [PENDENTE] Rebalancear chefes e inimigos para HP máximo 250 e armas evoluídas, com métricas de tempo de combate.
5. [ATUAL] Padrões especiais exclusivos e telegráficos: Barzini — anel radial; Tattaglia — rajada frontal em leque; Stracci — fogo cruzado. Novos sinais com 850/1020/1180 ms de antecipação por chefe.

### Fase 4 — MUNDO E MISSÕES

1. Variar interiores sem destruir rotas já funcionais.
2. Acrescentar conteúdo narrativo e missões exclusivas.
3. Melhorar tráfego, eventos, vida urbana e diferenciação de mapas.
4. Atualizar menus e mapas sem excesso de informação.
5. Incorporar árvore de habilidades complementar e testes.

### Fase 5 — POLIMENTO E LANÇAMENTO

1. Modularizar cuidadosamente o motor 2D.
2. Melhorar gráficos/sons mantendo payload leve para GitHub Pages.
3. Adicionar acessibilidade, gamepad e eventual modo touch.
4. Fazer percurso integral de três cidades, medindo desempenho.
5. Preparar changelog e versão candidata estável.

---

## 22. Checkpoint e procedimento de trabalho

**Código auditado em 16/11/2026:** `index.html`, incluindo as definições existentes de armas, danos, economia, campanhas, chefes, casas seguras, sistemas de save, polícia e jogador. **Mudança anterior publicada:** commit `5a1aa2e` (reinício de campanha, recaptura de distrito e cronômetro do chefe); ainda requer validação completa em navegador. **Este GDD documenta e planeja; não implementa automaticamente os itens [PLANEJADO].**

Antes de cada melhoria:
1. Ler GDD, código atual e último checkpoint.
2. Escolher um subsistema e registrar problema reproduzível.
3. Determinar arquivos, risco, testes e limite do escopo.
4. Implementar código funcional com defaults para saves antigos.
5. Testar novo jogo, salvar/continuar, interiores, polícia, chefe, menus e desempenho.
6. Publicar um commit coerente no GitHub com acesso autorizado.
7. Atualizar checkpoint com arquivo, SHA, testes *realmente* executados, resultado e pendências.

### Checkpoint modelo

    ## Data / versão
    Subsistema:
    Objetivo:
    Diagnóstico:
    Arquivos alterados:
    Compatibilidade com save:
    Testes automatizados:
    Testes de navegador:
    Resultado:
    Commit:
    Pendências e próximo passo:

---

## 23. Critérios definitivos de completude

O jogo será considerado **completo** quando:
- As **três cidades e 24 etapas de campanha** puderem ser concluídas sem travamento ou perda de progresso.
- As **36 propriedades** forem domináveis, produzirem renda, aceitarem melhoria e responderem à disputa territorial.
- Cada chefe tiver 3 fases funcionais e identidade de combate própria.
- O protagonista puder **melhorar vida, resistência, estamina, armadura e armas**, além de comprar munição e usar kits médicos.
- Menu Personagem, Loja e HUD exibirem corretamente custos, progresso, munição e equipamentos.
- Save/continue migrarem dados antigos e preservarem todos os investimentos.
- Teclado, colisões, IA, veículos, interiores, carregamentos e menus passarem nos testes.
- Houver metas mensuráveis de performance e nenhuma regressão crítica aberta.
- Cada entrega tiver checkpoint e rastreabilidade GitHub.

**Próxima implementação recomendada:** executar playtests visuais do v8.10 em navegador (interiores, rua, 3 chefes, saves antigos) e, depois, aprimorar guarda-costas, patrulhas e balanceamento da Fase 3. Consulte [CHECKPOINT_GODFATHER.md](CHECKPOINT_GODFATHER.md).