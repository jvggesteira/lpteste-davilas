# Frente 2 — Metrificação sob restrição da Meta

Estado em 2026-11-03. Frente 1 (landing page) está **concluída e no ar**.
Esta frente é toda no painel da Meta e no GTM — não há código a mexer.

---

## O problema, em uma frase

A Meta classificou `davilasconcept.com.br` na categoria de saúde e **suprime
eventos padrão dentro do próprio navegador**, antes de virarem requisição.

Verificado em 2026-11-03 consultando a config que a Meta entrega ao pixel:

    connect.facebook.net/signals/config/1746356522402157?domain=<dominio>

| Domínio | `restrictedEventNames` |
|---|---|
| `davilasconcept.com.br` | `["Contact","Lead","Schedule"]` |
| `www.davilasconcept.com.br` | `["Contact","Lead","Schedule"]` |
| `lpteste-davilas.vercel.app` | `[]` |
| domínio aleatório (controle) | `[]` |

Comportamento confirmado no navegador, em produção:

- `Lead`, `Contact`, `Schedule` → suprimidos. Console: *"[Meta Pixel] - You are
  attempting to send a restricted event. The event was suppressed."*
- `PageView` → passa normalmente (146 eventos no período)
- evento personalizado (`trackCustom`) → **sai do navegador com 200**

Os 6 `Lead` que aparecem no painel vieram todos de `lpteste-davilas.vercel.app`
(dados até 31/out 01:41) — eram os testes de QA, feitos antes da guarda em
`js/gtm.js` que passou a carregar o GTM só em produção.

## Níveis de restrição aplicados

Segundo o artigo da Meta (ver Referências) existem três níveis. Vocês estão
sob pelo menos dois, conforme o suporte confirmou no chat de 2026-11-03:

1. **Configuração principal** — restringe parâmetros personalizados e partes
   da URL depois do domínio. *(É por isso que o desenho abaixo não usa
   `content_name`.)*
2. **Restrições em determinados eventos padrão** — os três eventos acima.
3. ~~Restrições completas~~ — não é o caso.

## Decisões já tomadas (não reabrir sem motivo novo)

- **Schema JSON-LD e copy visível ficam como estão.** A clínica realiza
  implante e periodontia; `"@type": "Dentist"` e `MedicalProcedure` são
  declarações verdadeiras. Mantê-las é a escolha correta.
- **Consequência aceita:** a classificação de saúde vai se manter. O caminho
  é o evento personalizado, não a recategorização.
- **Não criar pixel novo.** O suporte sugeriu, mas contradiz o próprio artigo
  que ele enviou: a categoria é atribuída à fonte de dados com base nos
  tópicos e serviços do site, não ao número do pixel. Pixel novo no mesmo
  site é reclassificado igual, e perde histórico, públicos e aprendizado.
- **Não declarar categoria "beleza / comércio local".** A página declara
  `MedicalProcedure` em dados estruturados; a declaração seria contradita
  pelo próprio site em dois cliques.
- **Manter o botão de WhatsApp.** O suporte mandou remover, mas a Meta recebe
  a URL da *página*, não o `href` dos links de saída. O risco real era o texto
  pré-preenchido, que já foi neutralizado na Frente 1.

## Passo a passo

| # | Passo | Onde | Feito |
|---|---|---|---|
| 2.1 | Verificar o domínio `davilasconcept.com.br` (registro TXT na Cloudflare) | Gerenciador de Negócios → Central de Segurança da Marca → Domínios | [ ] |
| 2.2 | Excluir o projeto da Vercel (confirmar antes que Cloudflare Pages é o único ambiente no ar) | Painel da Vercel | [ ] |
| 2.3 | Criar os eventos personalizados `GM_WPP_PAGINA` e `GM_WPP_FLUTUANTE` | Gerenciador de Eventos | [ ] |
| 2.4 | Trocar as 2 tags do Meta Pixel de evento padrão `Lead` para evento personalizado. **Remover o `content_name`** | GTM — tags `tag_id` 12 e 14 | [ ] |
| 2.5 | Publicar o contêiner | GTM | [ ] |
| 2.6 | **Revisar e confirmar os eventos personalizados** — sem isso eles saem do navegador e morrem na Meta | Gerenciador de Eventos | [ ] |
| 2.7 | Recriar as 2 conversões personalizadas sobre os novos eventos | Gerenciador de Eventos | [ ] |
| 2.8 | Apagar as 3 tags "HTML personalizado" pausadas (`tag_id` 3, 6, 8) | GTM | [ ] |
| 2.9 | Validar nos Eventos de Teste: clicar nos dois botões e confirmar a chegada | Gerenciador de Eventos | [ ] |

**Ordem:** 2.1 e 2.2 são independentes e podem ir primeiro. De 2.3 a 2.7 é uma
corrente — nenhum passo adianta sem o anterior. O 2.6 é o que efetivamente
destrava: é o fluxo oficial descrito no artigo da Meta.

### Por que dois nomes de evento e não um evento com parâmetro

Porque a "Configuração principal" restringe **parâmetros personalizados**. Um
único evento `GM_WPP_CLIQUE` diferenciado por `content_name: whatsapp_pagina`
teria o parâmetro descartado, e os dois botões virariam um número só. Dois
nomes próprios sobrevivem à restrição.

### Regra de nomenclatura (Termos das Ferramentas de Negócios da Meta)

Nome de evento, de conversão personalizada, de parâmetro e de público **não
pode refletir, insinuar ou se basear em informação proibida** — o que inclui
condição, estado de saúde ou procedimento. `GM_WPP_PAGINA` descreve o elemento
de interface, não a pessoa. Nomes como `lead_implante` violariam.

## Passos despriorizados (não no caminho crítico)

- **Contestar a classificação.** O suporte informou prazo de até 30 dias após
  as alterações. Com o schema mantido, a chance é baixa. Não construir o plano
  em cima disso.
- **Campanha de site como campanha de conversão.** Enquanto a restrição
  existir, a campanha de site funciona melhor como topo de funil (objetivo
  Tráfego, otimizado por visualizações da página de destino), com o `PageView`
  alimentando público de remarketing que a campanha de WhatsApp fecha.
  *Verificar se o público personalizado de site está mesmo crescendo — a
  classificação pode limitar isso também.*

## Pendência aberta

Cache de borda da Cloudflare ainda servia os nomes de imagem antigos
(`/img/perio.webp` e os outros 10) em 2026-11-03 após o deploy. A origem já
devolve 404 — é só cache. Resolve com Purge Everything ou sozinho em ~4h.
**Conferir se já caiu.**

## Referências

- Sobre Informações Proibidas —
  `business.facebook.com/business/help/361948878201809?id=188852726110565`
- Restrições de compartilhamento por categoria de fonte —
  `business.facebook.com/business/help/511197658391698`
- Bloco do pixel em `_headers` — onde conferir a lista de eventos restritos
- Guardrails de conformidade — topo do `index.html`, acima do loader do GTM
