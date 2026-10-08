# LP D'avila's Concept — handoff técnico

Contexto para continuar o trabalho em um ambiente com terminal, git e deploy.
Documento interno da GM Assessoria.

---

## 1. Estado atual

| Item | Valor |
|---|---|
| Repositório | `jvggesteira/lpteste-davilas` (privado, branch `main`) |
| Vercel — equipe | GM ASSESSORIA (slug `gm-assessoria`) |
| Vercel — projeto | `lpteste-davilas` |
| URL de produção | https://lpteste-davilas.vercel.app |
| Deploy | Automático a cada push no `main`. **Não precisa de Vercel CLI.** |
| Domínio de produção | `davilasconcept.com.br` — Cloudflare Pages (ver seção 9) |

O repositório é privado porque contém fotos de pacientes identificáveis.
Manter assim.

---

## 2. O que é o projeto

Landing page institucional da **D'avila's Concept**, clínica odontológica da
**Dra. Tanira D'avila**. Cliente da GM Assessoria. A LP existe porque campanha
de busca no Google Ads exige site ativo.

Unidades:
- São Paulo — Rua Galvão Bueno, 412, Liberdade (perto do metrô)
- Rio Branco (AC) — Travessa Rio Branco, 684, sala 02, bairro Cerâmica

Registro: EPAO 0235. WhatsApp atual na página: `+55 68 99225-7126`.

### Posicionamento definido com a cliente

- **Eixo da página: o "avatar do sorriso"** — planejamento digital em que a boca
  é escaneada e o resultado é simulado antes de qualquer procedimento. É o
  diferencial competitivo escolhido para o mercado de São Paulo.
- **Alinhadores como porta de entrada** para tratamentos mais complexos.
- **Não atende convênio.** Isso está explícito na página, de propósito, para
  filtrar lead fora do perfil.
- **Harmonização orofacial foi descontinuada.** Não pode aparecer na página.
- Público SP: 25–50 anos, classe média-alta. Bairros Liberdade, Aclimação,
  Bela Vista, Saúde, Jardins, Ibirapuera, Higienópolis.
- Objeção principal é preço. A comunicação trabalha valor agregado e
  longevidade do tratamento, nunca desconto.

### Identidade visual

Extraída do Instagram @davilasconcept.

```
--ink      #14100D   fundo escuro
--bone     #EFE9E0   texto claro
--paper    #FBF8F4   fundo claro
--terra    #A85818   terracota da marca (amostrada do logo)
--terra-2  #C9803F   terracota clara
```

Tipografia: **Bodoni Moda** (títulos), **Spectral** (texto e interface),
**Italianno** (assinatura da marca). Sem nenhuma fonte sem serifa — foi pedido
explícito da cliente, que achou grotesca "cara de tecnologia".

---

## 3. Estrutura

```
index.html               a landing page; CSS embutido, JSON-LD no fim
privacidade.html         política de privacidade (LGPD)
js/app.js                TODO o JavaScript — consentimento e vídeo do topo
fonts/                   18 woff2 self-hosted (Bodoni, Spectral, Italianno)
img/                     fotos da página
media/hero.mp4           loop do topo, 9,1s, 827 KB, H.264 1440x696 @30fps
media/hero-poster.webp   primeiro quadro, 50 KB, 1440x696
media/og-davilas-concept.jpg  preview de link, 1200x630
_headers                 Cloudflare: segurança + cache (é aqui que mora a CSP)
_redirects               vazio de propósito — ver comentário dentro do arquivo
404.html                 obrigatório: sem ele a Pages trata o site como SPA e
                         responde a home em qualquer caminho errado, com 200
robots.txt / sitemap.xml
site.webmanifest, favicon.ico, apple-touch-icon.png, icon-192/512.png
.well-known/security.txt
vercel.json              só do ambiente de teste; força noindex no .vercel.app
```

O JavaScript fica em arquivo externo **por causa da CSP** — script inline é
bloqueado. Ver seção 7 antes de mexer.

O HTML tem ~26 KB e renderiza de imediato; o vídeo carrega em seguida
atrás do poster.

`Video 2 LP Tanira.mp4` (23 MB, 1920x1080) é o original do vídeo do topo.
Fica fora do git pelo `.gitignore` — é a fonte para qualquer reencode.

O vídeo do topo é uma **tela dividida**: à esquerda o sorriso atual, à direita a
simulação do avatar. Tem rótulos sobrepostos ("Sorriso hoje" / "Avatar —
simulação") e legenda dizendo que é simulação e não garantia de resultado.

---

## 4. Vídeo do topo — resolvido

Dois problemas, os dois corrigidos e no ar.

**1. Aparecia imagem no lugar do vídeo** (commit `a590085`)

A causa não era o autoplay: o script tinha um `useFallback()` que inseria um
`<img class="fallback">` com `z-index:2` **por cima** do vídeo. Era disparado
por um `setTimeout` de 2,5s — ou seja, em qualquer conexão um pouco lenta a
peça congelava numa foto mesmo com o vídeo funcionando.

Removidos o fallback inteiro, o `setTimeout` e o CSS `.hero-fig img.fallback`,
que ficou órfão. Também saiu o bloco que desligava o `autoplay` com "reduzir
movimento" ligado: aqui o vídeo É o conteúdo, não enfeite; as animações
decorativas já respeitam a preferência via CSS. O script hoje só garante
`muted`, chama `play()` e tenta de novo no primeiro gesto se o navegador
recusar.

**2. Vídeo pixelado** (commit `1f7d7db`)

O arquivo tinha 760x368 e o CSS o exibe num box de 1440x696 — quase 2x de
upscale. Reencodado direto do original 1920x1080:

```
crop=1738:840:91:76   recorta o "x" da gravação de tela (topo) e o cursor
                      do mouse (base), mantendo a divisão no centro (x=960)
scale=1440:696        resolução nativa de exibição, sem upscale
setsar=1              pixel quadrado
```

O encoder é o `h264_qsv` (Intel QuickSync) — **não há ffmpeg instalado nesta
máquina**, mas existe um completo embutido no CapCut, que resolve:
`~/AppData/Local/CapCut/Apps/<versão>/ffmpeg.exe`. Esse build não tem libx264,
só encoders de hardware; `global_quality 32` foi o ponto onde q28/q30/q32
ficaram indistinguíveis (a fonte é gravação de tela, o detalhe satura).

O poster é extraído do **primeiro quadro do mp4 final**, não do original —
senão o enquadramento pula quando o vídeo começa.

**Como validar:** o Chrome de automação desta máquina não carrega mídia
(`readyState` trava em 0 mesmo com o arquivo servindo 206 correto), então
conferir baixando da produção:

```bash
curl -s "https://lpteste-davilas.vercel.app/media/hero.mp4?n=$RANDOM" -o /tmp/p.mp4
ffmpeg -i /tmp/p.mp4 -f null -    # deve decodificar sem erro, 1440x696, 9,1s
```

---

## 5. Identidade e domínio

| Item | Valor |
|---|---|
| Razão social | T. N. Fontes LTDA |
| CNPJ | 43.104.780/0001-22 |
| Nome fantasia | D'avila's Concept |
| Domínio | `davilasconcept.com.br` (Registro.br, no nome da cliente) |
| E-mail do encarregado (LGPD) | tanirafontes@gmail.com |
| WhatsApp único | +55 68 99225-7126 — atende as duas unidades |
| CEP São Paulo | 01506-000 |
| CEP Rio Branco | **não confirmado** — a Travessa Rio Branco tem 6 CEPs por trecho. Ficou fora do schema de propósito: CEP errado é pior que CEP ausente. |

---

## 6. SEO — o que foi feito

Tudo está no `index.html`, no `_headers` e nos arquivos de raiz.

**Indexação**
- `noindex` removido; `robots` agora é `index,follow` com
  `max-image-preview:large` (habilita a miniatura grande no resultado).
- `canonical` apontando para `https://davilasconcept.com.br/`.
- `robots.txt` e `sitemap.xml` na raiz, com as duas URLs.
- `_redirects` manda `www` → apex com 301, para não dividir autoridade.
- O domínio `.vercel.app` recebeu `X-Robots-Tag: noindex` no `vercel.json`:
  enquanto os dois ambientes existirem, só a produção é indexável.

**Título e descrição** — `Dentista na Liberdade, São Paulo | D'avila's Concept`
(52 caracteres) e descrição de 157. Os dois dentro do limite de truncagem do
Google. O termo principal é *dentista + bairro*, que é como o público de SP
busca; a marca vem depois, porque ninguém procura por ela ainda.

**Palavras-chave no conteúdo visível.** O texto aprovado falava em
"Implantodontia" e "Estética & Reabilitação" — nomes de especialidade, não
termos de busca. Foram acrescentados, sem mudar o tom, os termos que as pessoas
realmente digitam: *implante dentário*, *lentes de contato dental*,
*alinhadores transparentes*, *tratamento de gengivite e periodontite*,
*clínica odontológica*. O H1 continua o mesmo — ele é o argumento de conversão,
e o peso de SEO foi para title, H2, schema e corpo do texto.

**Dados estruturados** (JSON-LD no fim do `index.html`) — um `@graph` com
`Organization` (com CNPJ), `WebSite`, `WebPage`, `Person` (Dra. Tanira), dois
`Dentist` (uma por unidade, cada uma com endereço, mapa, especialidade, lista
de procedimentos e bairros atendidos) e `FAQPage` com as 5 perguntas. É o que
alimenta o painel do Google, o Maps e as respostas de IA.

**NAP.** Nome, endereço e telefone agora aparecem idênticos no rodapé, nas
unidades, na política e no schema. Divergência de NAP é o erro que mais derruba
clínica no mapa — precisa bater com o Google Business Profile.

**Performance** (Core Web Vitals pesam em SEO e no Índice de Qualidade do Ads)
- Fontes self-hosted em `fonts/`: sumiram duas conexões externas e o CSS
  bloqueante do Google Fonts. Só os subsets latinos, 18 faces.
- `width`/`height` em todas as imagens → CLS ≈ 0.
- `loading="lazy"` abaixo da dobra; preload do poster e da Bodoni.

**Preview de link** — `media/og-davilas-concept.jpg`, 1200×630, 68 KB, gerado
para a marca. Não usa a peça antes/depois de propósito: preview é publicidade,
e o antes/depois esbarra na CFO-196/2019. Todas as URLs de OG são absolutas —
era por isso que o WhatsApp não renderizava nada.

**Favicon e manifesto** — `favicon.ico`, `apple-touch-icon.png`, ícones 192/512
e `site.webmanifest`. Antes a aba aparecia em branco.

---

## 7. Segurança

Configurada no `_headers` (a Cloudflare Pages aplica por rota):

| Cabeçalho | Efeito |
|---|---|
| `Strict-Transport-Security` | 2 anos, `includeSubDomains`, `preload` |
| `Content-Security-Policy` | `default-src 'none'` e lista explícita por tipo |
| `X-Frame-Options` + `frame-ancestors` | bloqueia clickjacking |
| `X-Content-Type-Options` | `nosniff` |
| `Referrer-Policy` | `strict-origin-when-cross-origin` |
| `Permissions-Policy` | câmera, microfone, geolocalização e pagamento negados |
| `Cross-Origin-Opener-Policy` | isola a janela |

Para a CSP funcionar sem `'unsafe-inline'` em script, **todo o JavaScript saiu
para `js/app.js`**. Não volte a usar `<script>` inline nem atributos `style=`:
os dois quebram a política. `style-src` mantém `'unsafe-inline'` porque o CSS é
embutido de propósito — a página é estática e não tem um único campo de
entrada, então não há superfície de injeção.

Também no repositório: `.well-known/security.txt` com canal de contato.

**Ao ligar o Google Ads:** a tag de conversão precisa de domínios que a CSP
ainda bloqueia. As linhas exatas estão comentadas dentro do `_headers`. E não
use tags "HTML personalizado" no GTM — elas injetam script inline e serão
bloqueadas. Use os modelos nativos.

**Ainda falta amarrar, e é no painel, não no código:**
- [ ] **DNSSEC** ligado no Registro.br e na Cloudflare.
- [ ] **Registro CAA** autorizando só a Let's Encrypt (`letsencrypt.org`), para
      ninguém mais conseguir emitir certificado para o domínio.
- [ ] **SPF, DKIM e DMARC** — mesmo sem e-mail no domínio, publique
      `v=spf1 -all` e um `_dmarc` com `p=reject`. Sem isso qualquer um manda
      e-mail se passando por `@davilasconcept.com.br`, e clínica é alvo fácil.
- [ ] **2FA** na conta Cloudflare, no Registro.br e no GitHub da cliente.
- [ ] Enviar o site ao **HSTS preload list** (hstspreload.org) depois de
      algumas semanas estável — a diretiva `preload` já está no cabeçalho.

---

## 8. Pendências

- [x] Política de privacidade e aviso de cookies — LGPD, dados da cliente
      preenchidos. O banner é quem carrega o GTM: nenhuma tag roda antes do
      "Aceitar".
- [x] `noindex`, tarja de protótipo, preview de WhatsApp, SEO e segurança.
- [ ] **Compliance CFO.** A Resolução CFO-196/2019 restringe antes/depois em
      publicidade odontológica. A peça do topo foi enquadrada como *simulação
      de planejamento*, não como resultado clínico, justamente por isso.
      Validar com a cliente antes de subir campanha. É também por isso que não
      existe `VideoObject` no schema: não interessa levar essa peça para a
      busca de vídeo antes do aval.
- [ ] **Horário de funcionamento.** Ficou fora do schema porque ninguém
      informou. Com ele, o Google exibe "aberto agora" no resultado. Pedir à
      cliente e acrescentar `openingHoursSpecification` nos dois nós `Dentist`.
- [ ] **CEP de Rio Branco** (ver tabela da seção 5).
- [ ] **Retrato oficial da Dra. Tanira.** A seção de autoridade e o preview de
      link usam a foto dela apresentando o planejamento. Confirmar ou trocar.
- [ ] **Google Business Profile** nas duas unidades, com NAP idêntico ao do
      rodapé. Para busca local isso pesa mais que a landing page inteira.
- [ ] **Search Console + Bing Webmaster Tools**: verificar o domínio e enviar o
      sitemap no dia em que o DNS propagar.
- [ ] **GTM + GA4.** Criar o contêiner, colar o ID na constante `GTM` de
      `js/app.js`, criar a propriedade GA4 e as conversões de clique no
      WhatsApp.

---

## 9. Publicar na Cloudflare

1. **Cloudflare → Add a domain** → `davilasconcept.com.br`, plano Free. A
   Cloudflare devolve **dois nameservers**; anote-os.
2. **DNSSEC no Registro.br → DESLIGAR primeiro.** Trocar nameserver com DNSSEC
   ativo derruba o domínio inteiro, e `.br` costuma vir com DNSSEC ligado.
   Esperar o desligamento propagar antes do passo 3.
3. **Registro.br → Alterar servidores DNS** → substituir pelos dois da
   Cloudflare, copiados exatamente. Propagação: minutos a 24 h. Esperar a zona
   ficar **Active** na Cloudflare antes de seguir.
4. **Pages** → Workers & Pages → Create → Pages → Connect to Git → repositório
   `lpteste-davilas`. Framework preset: nenhum. Build command: `exit 0`
   (recomendado pela Cloudflare para projeto sem build). Root directory: vazio.
   O `_headers` é lido automaticamente da raiz.
5. **Pages → Custom domains** → adicionar **só o apex** `davilasconcept.com.br`.
   A Cloudflare cria o CNAME sozinha; o apex funciona por CNAME flattening.
   **Não** adicionar o `www` aqui: isso *serve* o site no www e cria conteúdo
   duplicado, em vez de redirecionar.
6. **www → apex** (receita oficial da Cloudflare para Pages):
   - **DNS** → criar `A` / `www` / `192.0.2.1` / **Proxied**. É um IP reservado
     para documentação; ninguém o alcança, serve só para a requisição entrar no
     edge da Cloudflare, que é onde o redirect acontece.
   - **Bulk Redirects** → lista com origem `www.davilasconcept.com.br`, destino
     `https://davilasconcept.com.br`, 301, marcando *Preserve query string*,
     *Subpath matching* e *Preserve path suffix*.
   - Alternativa igualmente gratuita: Rules → Redirect Rules, `https://www.*`
     → `https://${1}`, 301.
7. **SSL/TLS** → modo **Full (strict)**, "Always Use HTTPS" ligado,
   "Automatic HTTPS Rewrites" ligado, TLS mínimo 1.2.
   **HSTS**: ligar aqui, em Edge Certificates — a diretiva existe no `_headers`,
   mas HSTS via `_headers` não é comportamento documentado da Pages.
5. Conferir no ar, sem cache:

```bash
curl -sI "https://davilasconcept.com.br/" | grep -iE "strict-transport|content-security|x-frame"
curl -s  "https://davilasconcept.com.br/robots.txt"
curl -sI "https://www.davilasconcept.com.br/" | grep -i location   # 301 para o apex
```

6. Validar em: [Rich Results Test](https://search.google.com/test/rich-results),
   [PageSpeed Insights](https://pagespeed.web.dev/),
   [securityheaders.com](https://securityheaders.com/) e o
   [depurador de compartilhamento](https://developers.facebook.com/tools/debug/),
   que força o WhatsApp a reler o preview.

---

## 10. Fluxo de trabalho

```bash
git clone https://github.com/jvggesteira/lpteste-davilas.git
cd lpteste-davilas

# editar index.html

git add -A
git commit -m "corrige loop do video no topo"
git push
```

O push no `main` dispara o deploy na Vercel automaticamente. O build leva
cerca de 20 segundos.

Para conferir o que está no ar de verdade, sem cair em cache:

```bash
curl -s "https://lpteste-davilas.vercel.app/index.html?n=$RANDOM" | wc -c
curl -s "https://lpteste-davilas.vercel.app/index.html?n=$RANDOM" | grep -c "setAttribute('autoplay'"
```

---

## 11. Armadilhas já mapeadas

- **A Vercel serve do cache de borda.** Sempre usar query aleatória ou
  `Ctrl+Shift+R` ao verificar.
- **A URL longa de deployment** (`lpteste-davilas-xxxx-gm-assessoria.vercel.app`)
  cai na tela de login da Vercel para quem não está logado. O link para o
  cliente é sempre `lpteste-davilas.vercel.app`.
- **Existem várias cópias de `index.html`** na pasta de Downloads, de versões
  diferentes. Trabalhar sempre a partir do repositório clonado — as cópias
  `index_1.html` e `index_2.html` foram apagadas do repositório em 28/09/2026.
- **`vercel.json` não aceita chave desconhecida.** O schema é estrito: um
  `"$comment"` no topo derruba o build inteiro com "Deployment failed" e um
  link genérico para a documentação. JSON não tem comentário — a explicação
  vai no handoff, não no arquivo.
- **A Vercel não avisa que falhou.** O site continua servindo a versão
  anterior do cache de borda e o `Age` só cresce. Para saber o que aconteceu
  de verdade, sem depender do painel:
  `gh api repos/jvggesteira/lpteste-davilas/commits/<sha>/status`
- **Existem duas equipes "GM ASSESSORIA" na Vercel**, com o mesmo nome e slugs
  diferentes (`gm-assessoria` e `gm-assessoria-e4a1814e`). O projeto está na
  primeira, `team_13gS4fspXWFyKQX9pUVaLwsC`, id
  `prj_YkNylWQha2vyotsmi8Kh4VdLIUNQ`.
- **O conector da Vercel no Claude** tem escopo apenas de leitura: retorna 403
  em `create_deployment` e `list_deployments`. Por isso o deploy precisa sair
  de um ambiente com git.
