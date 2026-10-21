# 🔓 Fuga da Prisão
 
Um jogo de labirinto em HTML, CSS e JavaScript puro. Você é um prisioneiro e precisa encontrar a porta de saída. A cada fase concluída, um novo labirinto é gerado proceduralmente, maior que o anterior.
 
Não usa bibliotecas, frameworks nem build: é um único arquivo `fuga-da-prisao.html`.
 
## Como jogar
 
1. Abra o arquivo `fuga-da-prisao.html` em qualquer navegador moderno.
2. Clique em **Começar** (ou pressione `Enter` / `Espaço`).
3. Guie o prisioneiro de uniforme laranja até a **porta verde** brilhante.
4. Ao chegar, aparece o resumo da fase (passos e tempo). Avance para a próxima, com um labirinto maior.
### Controles
 
| Ação | Teclado | Celular / tablet |
|---|---|---|
| Mover | Setas ou `W` `A` `S` `D` | Botões direcionais na tela |
| Andar continuamente | Segurar a tecla | Segurar o botão |
| Começar / próxima fase | `Enter` ou `Espaço` | Tocar no botão do painel |
| Reiniciar do zero | Botão **Reiniciar** | Botão **Reiniciar** |
 
## Progressão
 
O tamanho do labirinto cresce a cada fase, e a partir da fase 4 entra a escuridão: só a luz da tocha revela o caminho.
 
| Fase | Tamanho | Visão |
|---|---|---|
| 1 | 7 × 7 | Labirinto inteiro visível |
| 2 | 9 × 9 | Labirinto inteiro visível |
| 3 | 11 × 11 | Labirinto inteiro visível |
| 4 | 13 × 13 | Tocha com alcance de 6 células |
| 7 | 19 × 19 | Alcance 5 |
| 10 | 25 × 25 | Alcance 4 |
| 13 | 31 × 31 | Alcance 3 (mínimo) |
| 20+ | 45 × 45 (máximo) | Alcance 3 |
 
As áreas que você já visitou continuam desenhadas, porém mais escuras, para ajudar a lembrar do caminho.
 
## Como funciona
 
- **Geração do labirinto:** algoritmo de busca em profundidade com retrocesso (*recursive backtracker*), implementado de forma iterativa. Ele produz um labirinto "perfeito": existe exatamente um caminho entre quaisquer duas células.
- **Paredes:** cada célula guarda suas paredes em um byte, com um bit para cada direção (norte, leste, sul e oeste).
- **Saída:** o jogador sempre começa no canto superior esquerdo. A porta é colocada na célula mais distante do início, medida em passos pelos corredores (busca em largura).
- **Tocha:** a mesma busca em largura, limitada ao alcance da fase, define quais células estão iluminadas. Isso faz a luz seguir os corredores em vez de atravessar paredes.
- **Renderização:** `<canvas>` 2D, redesenhado a cada quadro, com ajuste automático ao tamanho da janela e à densidade de pixels da tela.
- **Recorde:** a maior fase alcançada fica salva no `localStorage` do navegador.
## Personalização
 
Os principais parâmetros ficam no bloco `<script>` do arquivo:
 
| O que mudar | Onde | Padrão |
|---|---|---|
| Tamanho do labirinto por fase | `newLevel()`, linha `Math.min(5+2*level,45)` | 7 na fase 1, +2 por fase, máximo 45 |
| Fase em que a escuridão começa | `newLevel()`, `fog=level>=4` | Fase 4 |
| Alcance da tocha | `newLevel()`, `Math.max(3,6-((level-4)/3\|0))` | 6, diminuindo 1 a cada 3 fases, mínimo 3 |
| Velocidade ao segurar a tecla | `frame()`, comparação `now-last>105` | 105 ms por passo |
| Cores | funções `draw()` e variáveis CSS em `:root` | Tema escuro de pedra e laranja |
 
## Estrutura
 
```
.
├── fuga-da-prisao.html   # HTML, CSS e JavaScript do jogo
└── README.md
```
 
## Compatibilidade
 
Funciona nas versões atuais de Chrome, Edge, Firefox e Safari, no computador e no celular. O layout se adapta ao tema claro ou escuro do sistema e respeita as áreas seguras de telas com notch.
 
## Ideias para evoluir
 
- Guardas que patrulham o labirinto
- Chaves e portas trancadas
- Armadilhas e passagens secretas
- Semente (*seed*) compartilhável para repetir o mesmo labirinto
- Ranking com tempo por fase
