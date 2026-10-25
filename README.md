# Apuração Presidente 2026 — 2º turno

Painel aberto e gratuito: <https://josecesarjr.github.io/apuracao-2026/>

Lê os arquivos oficiais de divulgação do TSE a cada minuto e mostra o
resultado em **votos válidos**, que é o que decide a eleição (Constituição,
art. 77, § 2º: maioria absoluta, não computados os em branco e os nulos).

## De onde vêm os números

| O quê | Fonte |
|---|---|
| Resultado, seções totalizadas, eleitorado | `resultados.tse.jus.br/oficial/ele2026/6258/dados/` |
| Lista de municípios e zonas | `.../6258/config/mun-e006258-cm.jws` |
| Fotos dos candidatos | `.../6258/fotos/br/` |
| Contorno dos estados | malha oficial do IBGE (API de malhas) |

Os arquivos do TSE vêm em formato JWS (JSON assinado). A página lê o conteúdo
e mostra sempre a data e a hora que o próprio TSE carimbou na publicação.

## Gráfico de evolução: por que precisa desta automação

O TSE publica **só a foto do momento** — não existe série histórica para
baixar. Para haver linha do tempo, alguém precisa guardar as fotos.

Sem a automação ligada, a página monta a curva no próprio aparelho de quem
está olhando, a cada meia hora, enquanto ela ficar aberta. Funciona, mas cada
pessoa tem a sua, começando na hora em que abriu.

Com a automação ligada, o histórico fica no repositório e **todo mundo vê a
mesma curva**, mesmo quem abrir o link já no fim da noite.

### Como ligar (uma vez, no seu terminal)

```bash
gh auth refresh -s workflow
mkdir -p .github/workflows && cp snapshot.yml .github/workflows/snapshot.yml
git add .github/workflows/snapshot.yml && git commit -m "Liga o historico" && git push
```

O arquivo `snapshot.yml` já está pronto na raiz do repositório; ele roda
`coleta.js` a cada 10 minutos e grava em `dados/historico.json`. A página
procura esse arquivo sozinha: achou, usa o histórico do servidor; não achou,
continua montando a curva no aparelho.

O cron do GitHub Actions é de melhor esforço e pode atrasar alguns minutos em
horário de pico.

## Cores

LULA em vermelho e FLAVIO BOLSONARO em verde, a pedido. Esse par é o caso
clássico de confusão para quem tem daltonismo vermelho-verde, então os
estados de FLAVIO levam hachura por cima e as linhas do gráfico têm traços
diferentes: a cor nunca é o único sinal.
