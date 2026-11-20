# Site KDM Archiving (@archivekdm)

HTML, CSS e JS puros. Abra a pasta inteira (o `index.html` sozinho não carrega as imagens).
Bibliotecas por CDN: GSAP + ScrollTrigger (animações), Lenis (scroll suave), Google Fonts (Archivo e IBM Plex Mono).

## Onde mexer
- `js/data.js`: CONFIG (WhatsApp, Enjoei, contador de vendidos), categorias e produtos.
  - Produto novo: copie um objeto de `PRODUTOS`, troque `id`, `slug`, fotos e `status`.
  - Vendeu: `status: 'vendido'`, `estoque: 0`, `preco: null`.
  - `whatsapp: '55DDDNUMERO'` faz todos os botões abrirem o WhatsApp com a mensagem pronta.
  - `enjoeiUrl` mostra o botão "Ver no Enjoei" na peça e no rodapé.
- `css/style.css`: cores e fontes nas variáveis do topo (`:root`).

## Pronto para e-commerce
- Cada produto já tem `id` (SKU), `preco`, `estoque` e `slug`.
- Página da peça abre por URL: `#peca-<slug>` (ex.: `#peca-air-jordan-1-low`).
- Sacola e favoritos funcionam (localStorage). Peça única: quantidade sempre 1.
- O checkout passa por `Store.checkoutHref()` em `js/app.js`. Hoje `CONFIG.checkout.mode = 'dm'`.
  Para Nuvemshop, Shopify, Stripe ou Mercado Pago: troque o `mode` e devolva a URL do carrinho da plataforma nessa função. Para buscar os produtos de uma API, troque `window.PRODUTOS` por um `fetch`.

## Fora do catálogo
As camisas de seleção "tailandesas" (México, Itália, Espanha) ficaram de fora: são réplicas.
