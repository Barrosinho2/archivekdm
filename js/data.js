/* =========================================================
   KDM ARCHIVING — dados da loja
   Tudo que muda com frequência mora aqui.
   Para ligar um e-commerce depois, troque CONFIG.checkout.mode
   e implemente o adaptador em app.js (Store.checkout).
   ========================================================= */

window.CONFIG = {
  marca: 'KDM Archiving',
  instagram: 'archivekdm',
  instagramUrl: 'https://www.instagram.com/archivekdm/',
  dmUrl: 'https://ig.me/m/archivekdm',
  whatsapp: null,          // ex.: '5515999999999' -> o CTA passa a abrir o WhatsApp com a mensagem pronta
  enjoeiUrl: null,         // ex.: 'https://www.enjoei.com.br/@archivekdm' -> aparece o botão "Ver no Enjoei"
  cidade: 'Tatuí-SP',
  desde: '2024',
  vendidos: 80,            // "+80 ARTIGOS VENDIDOS!"
  checkout: {
    mode: 'dm',            // 'dm' hoje. Futuro: 'nuvemshop' | 'shopify' | 'stripe' | 'mercadopago'
    moeda: 'BRL'
  },
  frases: {
    bio: 'Onde há Deus, nada faltará!',
    entrega: 'Entregamos para todo o Brasil.',
    compras: 'Compras via DM ou Enjoei.',
    fotos: 'Fotos reais do produto, não aceitamos devolução, compre via DM ou Enjoei.'
  }
};

window.CATEGORIAS = [
  { id: 'tenis',    nome: 'Tênis',              capa: 'img/recortes/air-jordan-1-low.webp' },
  { id: 'polos',    nome: 'Polos',              capa: 'img/recortes/polo-lacoste-yasburkey.webp' },
  { id: 'agasalhos',nome: 'Agasalhos',          capa: 'img/recortes/nike-tech-fleece-black.webp' },
  { id: 'camisas',  nome: 'Camisas e camisetas',capa: 'img/recortes/camisa-psg-jordan.webp' },
  { id: 'calcas',   nome: 'Calças',             capa: 'img/recortes/calca-reta-polo-wear.webp' },
  { id: 'bones',    nome: 'Bonés',              capa: 'img/produtos/bone-lacoste-five-panel-03.webp' }
];

/* status: 'disponivel' | 'vendido'
   encomenda: true quando a legenda dizia "VENDIDO SOB ENCOMENDA"
   preco em reais (number) ou null
   estoque: peça única = 1 (0 quando vendida) -> pronto para e-commerce
   capa: índice (0-based) da foto principal; hover: foto que aparece no hover do card */
window.PRODUTOS = [
  {
    id: 'kdm-001', slug: 'air-jordan-1-low', nome: 'Air Jordan 1 Low', marca: 'Jordan', categoria: 'tenis',
    preco: 299.90, status: 'disponivel', encomenda: false, estoque: 1,
    tamanho: '41', cond: 10, cor: 100, obs: null,
    recorte: 'img/recortes/air-jordan-1-low.webp', capa: 0, hover: 2, data: '2026-10-31',
    post: 'https://www.instagram.com/archivekdm/p/DfK4r1clClU/',
    fotos: ['img/produtos/air-jordan-1-low-01.webp','img/produtos/air-jordan-1-low-02.webp','img/produtos/air-jordan-1-low-03.webp','img/produtos/air-jordan-1-low-04.webp','img/produtos/air-jordan-1-low-05.webp']
  },
  {
    id: 'kdm-002', slug: 'polo-lacoste-yasburkey', nome: 'Polo Edição Lacoste x Yasburkey', marca: 'Lacoste', categoria: 'polos',
    preco: 199.90, status: 'disponivel', encomenda: false, estoque: 1,
    tamanho: 'T4/M', cond: 9.7, cor: 98, obs: null,
    recorte: 'img/recortes/polo-lacoste-yasburkey.webp', capa: 0, hover: 2, data: '2026-11-14',
    post: 'https://www.instagram.com/archivekdm/p/DfvE5IDlEls/',
    fotos: ['img/produtos/polo-lacoste-yasburkey-01.webp','img/produtos/polo-lacoste-yasburkey-02.webp','img/produtos/polo-lacoste-yasburkey-03.webp','img/produtos/polo-lacoste-yasburkey-04.webp']
  },
  {
    id: 'kdm-003', slug: 'nike-tech-fleece-black', nome: 'Tech Fleece Black', marca: 'Nike', categoria: 'agasalhos',
    preco: null, status: 'vendido', encomenda: true, estoque: 0,
    tamanho: 'M', cond: 10, cor: 100, obs: null,
    recorte: 'img/recortes/nike-tech-fleece-black.webp', capa: 0, hover: 1, data: '2026-11-14',
    post: 'https://www.instagram.com/archivekdm/p/DfvDX5QFPcL/',
    fotos: ['img/produtos/nike-tech-fleece-black-01.webp','img/produtos/nike-tech-fleece-black-02.webp','img/produtos/nike-tech-fleece-black-03.webp','img/produtos/nike-tech-fleece-black-04.webp']
  },
  {
    id: 'kdm-004', slug: 'jaqueta-nike-club-america', nome: 'Jaqueta América do México', marca: 'Nike', categoria: 'agasalhos',
    preco: null, status: 'vendido', encomenda: false, estoque: 0,
    tamanho: 'M', cond: 10, cor: 100, obs: null,
    recorte: 'img/recortes/jaqueta-nike-club-america.webp', capa: 0, hover: 5, data: '2026-11-14',
    post: 'https://www.instagram.com/archivekdm/p/DfvC0OclPPL/',
    fotos: ['img/produtos/jaqueta-nike-club-america-01.webp','img/produtos/jaqueta-nike-club-america-02.webp','img/produtos/jaqueta-nike-club-america-03.webp','img/produtos/jaqueta-nike-club-america-04.webp','img/produtos/jaqueta-nike-club-america-05.webp','img/produtos/jaqueta-nike-club-america-06.webp','img/produtos/jaqueta-nike-club-america-07.webp']
  },
  {
    id: 'kdm-005', slug: 'polo-puma-bmw-motorsport', nome: 'Polo Puma BMW', marca: 'Puma', categoria: 'polos',
    preco: null, status: 'vendido', encomenda: true, estoque: 0,
    tamanho: 'L/G', cond: 10, cor: 100, obs: null,
    recorte: 'img/recortes/polo-puma-bmw-motorsport.webp', capa: 0, hover: 1, data: '2026-11-14',
    post: 'https://www.instagram.com/archivekdm/p/DfvCKpXlME3/',
    fotos: ['img/produtos/polo-puma-bmw-motorsport-01.webp','img/produtos/polo-puma-bmw-motorsport-02.webp','img/produtos/polo-puma-bmw-motorsport-03.webp','img/produtos/polo-puma-bmw-motorsport-04.webp','img/produtos/polo-puma-bmw-motorsport-05.webp','img/produtos/polo-puma-bmw-motorsport-06.webp','img/produtos/polo-puma-bmw-motorsport-07.webp']
  },
  {
    id: 'kdm-006', slug: 'moletom-lacoste-live-ocean', nome: 'Moletom Lacoste L!VE Ocean', marca: 'Lacoste', categoria: 'agasalhos',
    preco: null, status: 'vendido', encomenda: false, estoque: 0,
    tamanho: 'L/G (veste M)', cond: 9.7, cor: 100, obs: null,
    recorte: 'img/recortes/moletom-lacoste-live-ocean.webp', capa: 0, hover: 1, data: '2026-10-27',
    post: 'https://www.instagram.com/archivekdm/p/DfAJgPWlG4I/',
    fotos: ['img/produtos/moletom-lacoste-live-ocean-01.webp','img/produtos/moletom-lacoste-live-ocean-02.webp','img/produtos/moletom-lacoste-live-ocean-03.webp','img/produtos/moletom-lacoste-live-ocean-04.webp','img/produtos/moletom-lacoste-live-ocean-05.webp']
  },
  {
    id: 'kdm-007', slug: 'camisa-psg-jordan', nome: 'Camisa PSG x Jordan', marca: 'Jordan', categoria: 'camisas',
    preco: null, status: 'vendido', encomenda: false, estoque: 0,
    tamanho: 'L/G (veste até M)', cond: 9.7, cor: 100, obs: 'Leve desgaste no patrocínio',
    recorte: 'img/recortes/camisa-psg-jordan.webp', capa: 0, hover: 1, data: '2026-10-27',
    post: 'https://www.instagram.com/archivekdm/p/DfAKMgOlBbV/',
    fotos: ['img/produtos/camisa-psg-jordan-01.webp','img/produtos/camisa-psg-jordan-02.webp','img/produtos/camisa-psg-jordan-03.webp','img/produtos/camisa-psg-jordan-04.webp','img/produtos/camisa-psg-jordan-05.webp']
  },
  {
    id: 'kdm-008', slug: 'polo-tommy-hilfiger', nome: 'Polo Tommy Hilfiger', marca: 'Tommy Hilfiger', categoria: 'polos',
    preco: null, status: 'vendido', encomenda: true, estoque: 0,
    tamanho: 'S/P', cond: 9, cor: 100, obs: 'Leve detalhe na gola',
    recorte: 'img/recortes/polo-tommy-hilfiger.webp', capa: 0, hover: 1, data: '2026-10-27',
    post: 'https://www.instagram.com/archivekdm/p/DfAJZdOlAsl/',
    fotos: ['img/produtos/polo-tommy-hilfiger-01.webp','img/produtos/polo-tommy-hilfiger-02.webp','img/produtos/polo-tommy-hilfiger-03.webp','img/produtos/polo-tommy-hilfiger-04.webp']
  },
  {
    id: 'kdm-009', slug: 'camiseta-nike-dri-fit-2021', nome: 'Camiseta Nike Dri-Fit 2021', marca: 'Nike', categoria: 'camisas',
    preco: null, status: 'vendido', encomenda: false, estoque: 0,
    tamanho: 'M', cond: 10, cor: 100, obs: null,
    recorte: 'img/recortes/camiseta-nike-dri-fit-2021.webp', capa: 0, hover: 1, data: '2026-10-27',
    post: 'https://www.instagram.com/archivekdm/p/DfAKGPvlPl6/',
    fotos: ['img/produtos/camiseta-nike-dri-fit-2021-01.webp','img/produtos/camiseta-nike-dri-fit-2021-02.webp','img/produtos/camiseta-nike-dri-fit-2021-03.webp','img/produtos/camiseta-nike-dri-fit-2021-04.webp']
  },
  {
    id: 'kdm-010', slug: 'calca-reta-polo-wear', nome: 'Calça Reta Polo Wear', marca: 'Polo Wear', categoria: 'calcas',
    preco: null, status: 'vendido', encomenda: false, estoque: 0,
    tamanho: '42', cond: 9.8, cor: 100, obs: null,
    recorte: 'img/recortes/calca-reta-polo-wear.webp', capa: 0, hover: 3, data: '2026-10-27',
    post: 'https://www.instagram.com/archivekdm/p/DfAKZYJFEbi/',
    fotos: ['img/produtos/calca-reta-polo-wear-01.webp','img/produtos/calca-reta-polo-wear-02.webp','img/produtos/calca-reta-polo-wear-03.webp','img/produtos/calca-reta-polo-wear-04.webp','img/produtos/calca-reta-polo-wear-05.webp']
  },
  {
    id: 'kdm-011', slug: 'bone-lacoste-five-panel', nome: 'Boné Lacoste Five Panel Girolle', marca: 'Lacoste', categoria: 'bones',
    preco: null, status: 'vendido', encomenda: false, estoque: 0,
    tamanho: 'U (único)', cond: 9.7, cor: 97, obs: null,
    recorte: null, capa: 2, hover: 0, data: '2026-10-27',
    post: 'https://www.instagram.com/archivekdm/p/DfAJ7CPFCMY/',
    fotos: ['img/produtos/bone-lacoste-five-panel-01.webp','img/produtos/bone-lacoste-five-panel-02.webp','img/produtos/bone-lacoste-five-panel-03.webp','img/produtos/bone-lacoste-five-panel-04.webp','img/produtos/bone-lacoste-five-panel-05.webp']
  }
];

/* Fotos de etiqueta e detalhe usadas na faixa "Fotos reais" */
window.ETIQUETAS = [
  { img: 'img/produtos/polo-lacoste-yasburkey-03.webp', legenda: 'Gola — Polo Lacoste' },
  { img: 'img/produtos/jaqueta-nike-club-america-05.webp', legenda: 'Etiqueta — Jaqueta América' },
  { img: 'img/produtos/polo-puma-bmw-motorsport-06.webp', legenda: 'Etiqueta — Polo Puma BMW' },
  { img: 'img/produtos/air-jordan-1-low-05.webp', legenda: 'Solado — Air Jordan 1 Low' },
  { img: 'img/produtos/calca-reta-polo-wear-04.webp', legenda: 'Etiqueta — Calça Polo Wear' },
  { img: 'img/produtos/moletom-lacoste-live-ocean-04.webp', legenda: 'Etiqueta — Moletom L!VE' },
  { img: 'img/produtos/camisa-psg-jordan-02.webp', legenda: 'Patrocínio — Camisa PSG' },
  { img: 'img/produtos/bone-lacoste-five-panel-04.webp', legenda: 'Etiqueta — Boné Lacoste' }
];
