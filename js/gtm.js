/* Google Tag Manager — GTM-P2L2CTQP.
   Externo e nao inline de proposito: a CSP em _headers nao tem 'unsafe-inline'
   em script-src. Arquivo servido de 'self', entao passa sem afrouxar a CSP.

   So carrega no dominio de producao. O mesmo commit vai para a Cloudflare
   Pages (davilasconcept.com.br) e para a Vercel (lpteste-davilas.vercel.app,
   ambiente de teste): sem esta guarda cada visita de QA virava evento no
   mesmo conjunto de dados do Meta e sujava a otimizacao dos anuncios. */
(function(w,d,s,l,i){
if (['davilasconcept.com.br','www.davilasconcept.com.br'].indexOf(d.location.hostname) < 0) return;
w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-P2L2CTQP');
