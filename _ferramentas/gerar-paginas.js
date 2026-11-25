// Gera index.html (corrigido) e as subpáginas a partir de "RIO VERDE VIDROS.html" (intocado).
const fs = require('fs');
const path = require('path');
const ROOT = process.argv[2];
const src = fs.readFileSync(path.join(ROOT, 'RIO VERDE VIDROS.html'), 'utf8');

// ---------- utilidades ----------
const must = (cond, msg) => { if (!cond) throw new Error(msg); };
function grab(re, what) { const m = src.match(re); must(m, 'não encontrado: ' + what); return m[0]; }
function rep(html, a, b, what) {
  must(html.includes(a), 'não encontrado para substituir: ' + (what || a.slice(0, 80)));
  return html.split(a).join(typeof b === 'function' ? b() : b);
}
const F = n => `./RIO VERDE VIDROS_files/filters_format(avif,webp)_quality(${n})`;
const DIM = { 60: [3200, 2746], 1: [1200, 1480], 2: [1200, 1480], 3: [1200, 1480], 4: [1200, 1480], 5: [3200, 1800], 6: [580, 728], 7: [580, 728], 8: [580, 728], 9: [580, 728], 10: [580, 728], 11: [3200, 4800], 12: [3200, 4800], 13: [3200, 1800] };
const img = (n, alt, scope, lazy = true) => `<img width="${DIM[n][0]}" height="${DIM[n][1]}" data-nuxt-img="" class="base-image"${lazy ? ' loading="lazy"' : ''} alt="${alt || ''}" data-v-${scope}="" src="${F(n)}">`;

// ---------- peças extraídas do modelo ----------
const HOME_OPEN = '<div class="home-page">';
const iHome = src.indexOf(HOME_OPEN) + HOME_OPEN.length;
const iFooter = src.indexOf('<footer id="contato" class="footer"');
const iFooterEnd = src.indexOf('</footer>', iFooter) + '</footer>'.length;
must(iHome > 100 && iFooter > iHome && iFooterEnd > iFooter, 'estrutura da home mudou');
const PREFIX = src.slice(0, iHome);
const HOME_BODY = src.slice(iHome, iFooter);
const FOOTER_SRC = src.slice(iFooter, iFooterEnd);
const SUFFIX = src.slice(iFooterEnd);

const ARROW_BTN = grab(/<svg[^>]*class="arrow-svg" data-v-ac2a1310="">[\s\S]*?<\/svg>/, 'seta do botão');
const CTA_SVG = grab(/<svg[^>]*class="banner-cta-svg"[^>]*>[\s\S]*?<\/svg>/, 'desenho do banner-cta');
const PAGE_HEADER = grab(/<section id="inicio" class="page-header[\s\S]*?<\/section>/, 'page-header');
const SHOWROOM_SRC = grab(/<section id="showroom" class="banner-showroom"[\s\S]*?<\/section>/, 'banner-showroom');

const PROJECTS = [...src.matchAll(/<a href="projetos\.html#([^"]+)" class="project"[^>]*>([\s\S]*?)<\/a>/g)].map(m => ({
  id: m[1],
  name: (m[2].match(/<h3[^>]*>([^<]+)<\/h3>/) || [])[1],
  tags: [...m[2].matchAll(/<div class="product"[^>]*>([^<]+)<\/div>/g)].map(x => x[1]),
  img: +(m[2].match(/quality\((\d+)\)/) || [])[1],
}));
must(PROJECTS.length === 5 && PROJECTS.every(p => p.name && p.img), 'lista de projetos');

// ---------- componentes (mesma marcação e escopo da home) ----------
const button = (href, label, variant, scope) =>
  `<a href="${href}" class="base-button ${variant}"${scope ? ` data-v-${scope}=""` : ''} data-v-ac2a1310="">${ARROW_BTN}<div class="label" data-v-ac2a1310=""><span class="line" aria-hidden="true" data-v-ac2a1310="">${label}</span><span class="line" data-v-ac2a1310="">${label}</span></div></a>`;
const title = (text, scope) => `<h2 class="base-title" data-v-${scope}="" data-v-4a4379f9="">${text}</h2>`;
const heading = (lines, scope, align = 'start') =>
  `<div class="base-heading" data-v-${scope}="" data-v-342e3239="" aria-label="${lines.join(' ')}">` +
  lines.map(l => `<div class="line-mask" aria-hidden="true" style="position: relative; display: block; text-align: ${align}; overflow: clip;"><div class="line rv-line" aria-hidden="true" style="position: relative; display: block; text-align: ${align};">${l} </div></div>`).join('') +
  `</div>`;

function pageHeader(h1, variant) {
  let h = PAGE_HEADER;
  h = h.replace(/<h1 data-v-613436a9="">[\s\S]*?<\/h1>/, () => `<h1 data-v-613436a9="">${h1}</h1>`);
  h = rep(h, 'page-header is-white', 'page-header ' + variant);
  h = rep(h, 'aria-current="page" href="index.html" class="is-active is-exact-active logo"', 'href="index.html" class="logo"');
  return h;
}

function hero({ label, lines, t, text, image, alt, plain, pos }) {
  const pic = plain ? '' : img(image, alt, '4af64125', false).replace('<img ', pos ? `<img style="object-position: ${pos};" ` : '<img ');
  const bg = plain ? '' :
    `<div class="background" data-v-4af64125=""><div class="asset" data-v-4af64125="">${pic}</div></div>`;
  return `<section class="home-header rv-hero${plain ? ' is-plain' : ''}" data-rv-label="${label}" data-v-4af64125=""><div class="container" data-v-4af64125=""><div class="row" data-v-4af64125="">${heading(lines, '4af64125', 'center')}</div><div class="row" data-v-4af64125="">${title(t, '4af64125')}<p class="text" data-v-4af64125="">${text}</p></div></div>${bg}</section>`;
}

const textCta = ({ id, label, t, lines, btn }) =>
  `<section${id ? ` id="${id}"` : ''} class="text-cta" data-rv-label="${label}" data-v-5a29c052=""><div class="container" data-v-5a29c052="">${title(t, '5a29c052')}${heading(lines, '5a29c052', 'center')}${btn ? button(btn[0], btn[1], 'is-black', '5a29c052') : ''}</div></section>`;

const rows = items => `<ol class="rv-rows">` + items.map(i =>
  `<li class="rv-row"${i.id ? ` id="${i.id}"` : ''}><span class="rv-row-num">${i.num}</span><h3 class="rv-row-title">${i.title}</h3><div class="rv-row-body">${i.text ? `<p class="rv-row-text">${i.text}</p>` : ''}${i.tags ? pills(i.tags) : ''}</div></li>`).join('') + `</ol>`;
const pills = tags => `<div class="rv-pills">${tags.map(t => `<span class="rv-pill">${t}</span>`).join('')}</div>`;

const listSection = ({ id, label, t, lines, btn, items, intro }) =>
  `<section${id ? ` id="${id}"` : ''} class="featured-projects${intro ? ' rv-intro' : ''}" data-rv-label="${label}" data-v-7f1579d2=""><div class="container" data-v-7f1579d2="">${title(t, '7f1579d2')}<div class="content" data-v-7f1579d2="">${heading(lines, '7f1579d2')}${btn ? button(btn[0], btn[1], 'is-black', '7f1579d2') : ''}</div>${items ? `<div class="projects" data-v-7f1579d2="">${rows(items)}</div>` : ''}</div></section>`;

const duo = (layout, a, b, altA, altB) =>
  `<section class="assets-duo" data-v-97fd60b5=""><div class="${layout} container" data-v-97fd60b5=""><div class="is-image block" data-v-97fd60b5="">${img(a, altA, '97fd60b5')}</div><div class="is-image block" data-v-97fd60b5="">${img(b, altB, '97fd60b5')}</div></div></section>`;

const bannerCta = (o = {}) => {
  const t = o.t || 'Onde a visão encontra a obra';
  const lines = o.lines || ['A grande obra começa', 'ao entender o lugar'];
  const b1 = o.b1 || ['metodo.html', 'Nosso método'];
  const b2 = o.b2 || ['contato.html', 'Fale conosco'];
  return `<section class="banner-cta" data-rv-label="${o.label || 'Contato'}" data-v-f377522f=""><div class="container" data-v-f377522f="">${title(t, 'f377522f')}${heading(lines, 'f377522f')}<div class="buttons" data-v-f377522f="">${button(b1[0], b1[1], 'is-black', 'f377522f')}${button(b2[0], b2[1], 'is-alpha', 'f377522f')}</div>${CTA_SVG}</div></section>`;
};

const ADDRESS_PENDING = '<span class="rv-pending">Endereço a definir</span>';
function showroomBanner(btnHref, btnLabel) {
  let s = SHOWROOM_SRC;
  s = s.replace(/ style="translate: none; rotate: none; scale: none; transform: translate\(-?78px, 0px\);"/g, '');
  s = rep(s, '<p class="text" data-v-cc15621c="">&nbsp;</p>', `<p class="text" data-v-cc15621c="">${ADDRESS_PENDING}</p>`, 'endereço do showroom');
  s = rep(s, '<a href="showroom.html" class="base-button is-white"', `<a href="${btnHref}" class="base-button is-white"`);
  s = s.split('>Showroom</span>').join(`>${btnLabel}</span>`);
  return s;
}

const COLLECTION = [
  { id: 'portas', name: 'Portas', image: 1, alt: 'Porta de correr com trilho oculto',
    text: 'Portas de correr com trilho oculto, portas pivotantes e portas de abrir, com perfis finos e vãos amplos.',
    tags: ['Portas de correr minimalistas', 'Porta pivotante', 'Porta atemporal'] },
  { id: 'janelas', name: 'Janelas', image: 2, alt: 'Janela de abrir',
    text: 'Janelas de abrir e fixas que emolduram a paisagem sem pesar na fachada.',
    tags: ['Janela atemporal', 'Janela de abrir'] },
  { id: 'complementos', name: 'Complementos', image: 3, alt: 'Caixa de persiana',
    text: 'Peças que completam o conjunto, como caixas de persiana e guarda-corpos de vidro.',
    tags: ['Caixa de persiana', 'Guarda-corpo de vidro'] },
  { id: 'estrutural', name: 'Estrutural', image: 4, alt: 'Fachada com envidraçamento estrutural',
    text: 'Envidraçamento estrutural para fachadas, empenas e coberturas, com o mínimo de estrutura aparente.',
    tags: ['Envidraçamento estrutural vertical', 'Claraboia e lanternim'] },
];
const collectionBlocks = hrefFor => COLLECTION.map(c =>
  `<a href="${hrefFor(c)}" class="block" data-v-85542e5f=""><h3 class="title" data-v-85542e5f="">${c.name}</h3>${img(c.image, c.alt, '85542e5f')}</a>`).join('');

// ---------- rodapé corrigido ----------
let FOOTER = FOOTER_SRC;
FOOTER = rep(FOOTER, ' style="translate: none; rotate: none; scale: none; transform: translate(0%, -50%);"', '', 'transformação congelada do rodapé');
for (const net of ['Instagram', 'YouTube', 'LinkedIn', 'X']) {
  FOOTER = rep(FOOTER, `<a href="#" rel="noopener noreferrer" target="_blank" class="link" data-v-9ab3b4bc="">${net}</a>`,
    `<span class="link is-pending" title="Link pendente" data-v-9ab3b4bc="">${net}</span>`, 'rede ' + net);
}

// ---------- correções do "casco" (cabeçalho, menu, meta) ----------
const MENU_EMPTY = /<li class="mask" data-v-c8555c34=""><a href="#" rel="noopener noreferrer" target="_blank" class="link" data-v-c8555c34="">\s*<\/a><\/li>/;
function shell(html, page) {
  html = html.replace(/<title>[\s\S]*?<\/title>/, () => `<title>${page.title}</title>`);
  if (page.desc) {
    for (const k of ['name="description"', 'property="og:description"', 'name="twitter:description"'])
      html = html.replace(new RegExp(`<meta ${k} content="[^"]*">`), () => `<meta ${k} content="${page.desc}">`);
    for (const k of ['property="og:title"', 'name="twitter:title"'])
      html = html.replace(new RegExp(`<meta ${k} content="[^"]*">`), () => `<meta ${k} content="${page.ogTitle}">`);
  }
  // barra flutuante: tira transformação congelada, rótulo inicial = página atual
  html = rep(html, ' style="translate: none; rotate: none; scale: none; transform: translate(-50%, 0%) translate(-0.094px, 0px);"', '', 'transformação da barra');
  html = html.replace(/(<div class="title-inner" data-v-46983abb=""[^>]*>)Início(<\/div>)/, (a, b, c) => b + page.label + c);
  if (page.file !== 'index.html') {
    html = rep(html, '<a aria-current="page" href="index.html" class="is-active is-exact-active logo" aria-label="Início" data-v-46983abb=""',
      '<a href="index.html" class="logo" aria-label="Início" data-v-46983abb=""', 'logo da barra');
    html = html.replace('<a aria-current="page" href="index.html" class="is-active is-exact-active logo" data-v-9ab3b4bc=""',
      '<a href="index.html" class="logo" aria-label="Início" data-v-9ab3b4bc=""');
  }
  // menu: links vazios viram Privacidade / Termos; item da página atual fica ativo
  html = html.replace(MENU_EMPTY, '<li class="mask" data-v-c8555c34=""><a href="politica.html" class="link" data-v-c8555c34="">Privacidade</a></li>');
  html = html.replace(MENU_EMPTY, '<li class="mask" data-v-c8555c34=""><a href="termos.html" class="link" data-v-c8555c34="">Termos</a></li>');
  must(!MENU_EMPTY.test(html), 'menu ainda tem link vazio');
  html = html.replace(`<li class="item" data-v-c8555c34=""><div class="mask" data-v-c8555c34=""><a href="${page.file}"`,
    `<li class="item is-active" data-v-c8555c34=""><div class="mask" data-v-c8555c34=""><a href="${page.file}" aria-current="page"`);
  html = html.replace(`<a href="${page.file}" class="link" data-v-c8555c34="">`, `<a href="${page.file}" class="link is-active" aria-current="page" data-v-c8555c34="">`);
  // versão dos arquivos próprios
  html = rep(html, 'rv.css?v=4', 'rv.css?v=5');
  html = rep(html, 'rv.js?v=7', 'rv.js?v=8');
  return html;
}

// ---------- home ----------
function homeBody() {
  let b = HOME_BODY;
  b = rep(b, '<section class="home-header" data-v-4af64125="">', '<section class="home-header" data-rv-label="Início" data-v-4af64125="">');
  b = b.replace(SHOWROOM_SRC, () => showroomBanner('showroom.html', 'Showroom'));
  // blocos da coleção: sem transformação congelada e com link para a categoria
  b = b.replace(/<a href="colecao\.html" class="block" data-v-85542e5f=""( style="[^"]*")?>\s*<h3 class="title" data-v-85542e5f="">([^<]+)<\/h3>/g, (m, st, name) => {
    const c = COLLECTION.find(x => x.name === name); must(c, 'categoria ' + name);
    return `<a href="colecao.html#${c.id}" class="block" data-v-85542e5f=""><h3 class="title" data-v-85542e5f="">${name}</h3>`;
  });
  // resumo do Google: sem link real ainda
  b = b.replace(/<a href="#" target="_blank" rel="noopener noreferrer" class="summary"([^>]*)>([\s\S]*?)<\/a>/, (m, attrs, inner) => `<div class="summary"${attrs}>${inner}</div>`);
  return b;
}

// ---------- subpáginas ----------
const PAGES = [];
const add = p => PAGES.push(p);

add({
  file: 'sobre.html', label: 'Sobre', title: 'Sobre | Rio Verde Vidros', ogTitle: 'Sobre a Rio Verde Vidros',
  desc: 'Especialistas em vidro arquitetônico e estrutural sob medida. Conheça a Rio Verde Vidros e o que guia o nosso trabalho.',
  h1: 'Sobre a Rio Verde Vidros',
  body: () => [
    hero({ label: 'Sobre', lines: ['Damos forma à arquitetura', 'com ofício e inovação.'], t: 'Sobre a Rio Verde',
      text: 'Somos especialistas em vidro arquitetônico e estrutural sob medida. Do primeiro desenho à instalação, acompanhamos cada obra com o mesmo cuidado.', image: 12, alt: 'Casa com fachada envidraçada' }),
    textCta({ id: 'sobre', label: 'Quem somos', t: 'Quem somos', lines: ['Confiam na Rio Verde', 'os arquitetos que exigem', 'precisão, beleza e cuidado.'], btn: ['projetos.html', 'Ver projetos'] }),
    duo('is-portrait-6', 4, 11, 'Fachada com envidraçamento estrutural', 'Interior com grande janela triangular'),
    listSection({ id: 'valores', label: 'Valores', t: 'O que nos guia', lines: ['Clareza, qualidade', 'e parceria em cada peça.'], items: [
      { num: '01', title: 'Precisão', text: 'Cada vão é medido no lugar. O desenho só segue para a produção quando a obra e o vidro concordam.' },
      { num: '02', title: 'Ofício', text: 'Produção própria e acabamento cuidadoso, para que o vidro permaneça bonito por muito tempo.' },
      { num: '03', title: 'Parceria', text: 'Trabalhamos lado a lado com arquitetos e construtores, do primeiro esboço à entrega da obra.' },
      { num: '04', title: 'Clareza', text: 'Perfis mínimos e vidro limpo: a arquitetura conduz o olhar e a paisagem entra.' },
    ] }),
    bannerCta(),
  ].join(''),
});

add({
  file: 'colecao.html', label: 'Coleção', title: 'Coleção | Rio Verde Vidros', ogTitle: 'Coleção de vidros',
  desc: 'Portas, janelas, complementos e envidraçamento estrutural sob medida: conheça a coleção de vidros da Rio Verde Vidros.',
  h1: 'Coleção de vidros',
  body: () => [
    hero({ label: 'Coleção', lines: ['Vidro sob medida', 'para cada vão.'], t: 'Coleção de vidros',
      text: 'A coleção une ofício refinado, desenho preciso e qualidade que permanece. Feita para arquitetura ousada e visão sem concessões.', image: 60, alt: 'Casa com portas e janelas de vidro' }),
    `<section id="colecao" class="product-collection" data-rv-label="Coleção" data-v-85542e5f=""><div class="container" data-v-85542e5f="">${title('Categorias', '85542e5f')}<div class="content" data-v-85542e5f=""><div class="richtext" data-v-85542e5f=""><p>Quatro <strong>famílias de produto</strong>, desenhadas para trabalhar juntas e se adaptar a cada projeto.</p></div>${button('#detalhes', 'Ver detalhes', 'is-black', '85542e5f')}</div><div class="blocks" data-v-85542e5f="">${collectionBlocks(c => '#' + c.id)}</div></div></section>`,
    listSection({ id: 'detalhes', label: 'Detalhes', t: 'Detalhes', lines: ['Conheça cada família', 'da coleção.'], btn: ['contato.html', 'Pedir orçamento'],
      items: COLLECTION.map((c, i) => ({ id: c.id, num: '0' + (i + 1), title: c.name, text: c.text, tags: c.tags })) }),
    bannerCta(),
  ].join(''),
});

add({
  file: 'showroom.html', label: 'Showroom', title: 'Showroom | Rio Verde Vidros', ogTitle: 'Showroom Rio Verde Vidros',
  desc: 'Conheça as peças da Rio Verde Vidros em escala real no showroom e agende uma visita com a equipe.',
  h1: 'Showroom',
  body: () => [
    hero({ label: 'Showroom', lines: ['Veja o vidro', 'em escala real.'], t: 'Showroom',
      text: 'Um espaço para conhecer as peças de perto, comparar acabamentos e conversar sobre o projeto com a equipe.', image: 5, alt: 'Showroom com janelas expostas' }),
    textCta({ label: 'A visita', t: 'A visita', lines: ['Ver a peça em escala real', 'evita surpresa na instalação.', 'A visita organiza a escolha.'], btn: ['contato.html', 'Agendar visita'] }),
    showroomBanner('contato.html', 'Agendar visita'),
    listSection({ id: 'visita', label: 'Como funciona', t: 'Como funciona', lines: ['Uma visita', 'em três passos.'], items: [
      { num: '01', title: 'Agende', text: 'Escolha um horário pelo formulário de contato. A equipe confirma a visita.' },
      { num: '02', title: 'Traga o projeto', text: 'Plantas, fotos ou medidas aproximadas ajudam a orientar a conversa.' },
      { num: '03', title: 'Escolha com calma', text: 'Compare sistemas, perfis e acabamentos em tamanho real antes de decidir.' },
    ] }),
    duo('is-portrait-1', 1, 2, 'Porta de correr', 'Janela de abrir'),
    bannerCta(),
  ].join(''),
});

add({
  file: 'projetos.html', label: 'Projetos', title: 'Projetos | Rio Verde Vidros', ogTitle: 'Obras em destaque',
  desc: 'Obras em destaque da Rio Verde Vidros: portas, janelas e envidraçamento estrutural sob medida.',
  h1: 'Projetos',
  body: () => [
    hero({ label: 'Projetos', lines: ['Cada obra conta', 'a sua história.'], t: 'Obras em destaque',
      text: 'Uma seleção de obras feitas a quatro mãos com arquitetos e clientes, com rigor do desenho à instalação.', image: 11, alt: 'Interior com grande janela triangular' }),
    listSection({ intro: true, id: 'projetos', label: 'Projetos', t: 'Obras', lines: ['Feitas a quatro mãos,', 'com rigor.'], btn: ['contato.html', 'Começar um projeto'] }),
    `<section class="rv-section" data-rv-label="Projetos"><div class="rv-container"><ul class="rv-cards">${PROJECTS.map(p =>
      `<li class="rv-card" id="${p.id}"><div class="rv-card-image">${img(p.img, p.name, '7f1579d2')}</div><h3 class="rv-card-title">${p.name}</h3>${pills(p.tags)}</li>`).join('')}</ul></div></section>`,
    duo('is-portrait-6', 3, 12, 'Sala com portas de vidro', 'Casa com fachada envidraçada'),
    bannerCta(),
  ].join(''),
});

add({
  file: 'metodo.html', label: 'Método', title: 'Método | Rio Verde Vidros', ogTitle: 'Nosso método',
  desc: 'Do primeiro desenho à instalação: conheça o método de trabalho da Rio Verde Vidros.',
  h1: 'Nosso método',
  body: () => [
    hero({ label: 'Método', lines: ['A grande obra começa', 'ao entender o lugar.'], t: 'Nosso método',
      text: 'Um processo claro, do primeiro desenho à instalação, para que cada peça chegue à obra pronta para durar.', image: 13, alt: 'Interior com grandes painéis de vidro voltados para a mata' }),
    listSection({ id: 'metodo', label: 'Etapas', t: 'Etapas', lines: ['Quatro etapas,', 'um só desenho.'], items: [
      { num: '01', title: 'Escuta', text: 'Entendemos a obra, o lugar e o que a arquitetura pede. É aqui que começa o desenho.' },
      { num: '02', title: 'Desenho', text: 'Definimos sistemas, perfis e acabamentos junto com o arquiteto, peça por peça.' },
      { num: '03', title: 'Medição e produção', text: 'Cada vão é conferido no lugar. O desenho só segue para a produção quando a obra e o vidro concordam.' },
      { num: '04', title: 'Instalação', text: 'Montagem cuidadosa e acompanhamento até a entrega da obra.' },
    ] }),
    duo('is-portrait-3', 2, 4, 'Janela de abrir', 'Fachada com envidraçamento estrutural'),
    textCta({ label: 'Showroom', t: 'Showroom', lines: ['Veja as peças de perto', 'antes de decidir.'], btn: ['showroom.html', 'Visitar o showroom'] }),
    bannerCta({ t: 'Próximo passo', lines: ['Vamos conversar', 'sobre a sua obra?'], b1: ['contato.html', 'Fale conosco'], b2: ['projetos.html', 'Ver projetos'] }),
  ].join(''),
});

const field = (id, label, type, extra = '') =>
  `<div class="field" data-v-76d22425=""><label class="label" for="${id}" data-v-76d22425="">${label}</label><input class="input" id="${id}" name="${id.replace('f-', '')}" type="${type}" ${extra} data-v-76d22425=""></div>`;
add({
  file: 'contato.html', label: 'Contato', title: 'Contato | Rio Verde Vidros', ogTitle: 'Fale com a Rio Verde Vidros',
  desc: 'Fale com a Rio Verde Vidros: conte o vão, o prazo e o que a arquitetura pede.',
  h1: 'Contato',
  body: () => [
    hero({ label: 'Contato', lines: ['Conte o vão, o prazo', 'e o que a arquitetura pede.'], t: 'Contato',
      text: 'A equipe retorna para seguir o desenho com você.', image: 2, alt: 'Janela de abrir', pos: '50% 12%' }),
    `<section id="formulario" class="rv-section rv-contact" data-rv-label="Contato"><div class="rv-container">` +
      `<div class="row" data-v-76d22425=""><p class="text" data-v-76d22425="">Pedir orçamento</p>` +
      `<form class="column rv-quote" data-v-76d22425="">` +
        `<div class="group" data-v-76d22425=""><h3 class="title" data-v-76d22425="">O que você procura</h3><div class="buttons" data-v-76d22425="">` +
          ['Portas', 'Janelas', 'Complementos', 'Estrutural', 'Ainda não sei'].map(o => `<button type="button" class="button" aria-pressed="false" data-v-76d22425="">${o}</button>`).join('') +
        `</div></div>` +
        `<div class="group" data-v-76d22425=""><h3 class="title" data-v-76d22425="">Seus dados</h3>` +
          field('f-nome', 'Nome', 'text', 'required autocomplete="name"') +
          field('f-email', 'E-mail', 'email', 'required autocomplete="email"') +
          field('f-telefone', 'Telefone', 'tel', 'autocomplete="tel"') +
          field('f-cidade', 'Cidade da obra', 'text', 'autocomplete="address-level2"') +
        `</div>` +
        `<div class="group" data-v-76d22425=""><h3 class="title" data-v-76d22425=""><label for="f-mensagem">Sobre a obra</label></h3>` +
          `<textarea class="textarea" id="f-mensagem" name="mensagem" required placeholder="Medidas aproximadas, prazo e o que a arquitetura pede." data-v-76d22425=""></textarea>` +
          `<button class="submit" type="submit" data-v-76d22425="">Enviar mensagem</button>` +
          `<p class="success" role="status" hidden data-v-76d22425="">Recebemos sua mensagem. A equipe retorna em seguida.</p>` +
        `</div>` +
      `</form></div>` +
      `<div class="row" data-v-76d22425=""><p class="text" data-v-76d22425="">Atendimento</p><div class="column" data-v-76d22425=""><ul class="rv-info">` +
        `<li><span>Showroom</span>${ADDRESS_PENDING}</li>` +
        `<li><span>Telefone / WhatsApp</span><span class="rv-pending">A definir</span></li>` +
        `<li><span>E-mail</span><span class="rv-pending">A definir</span></li>` +
      `</ul></div></div>` +
    `</div></section>`,
  ].join(''),
});

add({
  file: 'midia.html', label: 'Mídia', title: 'Mídia | Rio Verde Vidros', ogTitle: 'Mídia',
  desc: 'Imagens de obra e de detalhe da Rio Verde Vidros.',
  h1: 'Mídia',
  body: () => [
    hero({ label: 'Mídia', lines: ['Imagens de obra', 'e de detalhe.'], t: 'Mídia',
      text: 'Imagens de obra e de detalhe, no mesmo rigor do vidro instalado.', image: 3, alt: 'Sala com portas de vidro' }),
    textCta({ label: 'Galeria', t: 'Galeria', lines: ['O vidro some,', 'a arquitetura fica.'] }),
    duo('is-portrait-6', 11, 12, 'Interior com grande janela triangular', 'Casa com fachada envidraçada'),
    duo('is-landscape-2', 13, 1, 'Interior voltado para a mata', 'Porta de correr'),
    duo('is-portrait-1', 2, 4, 'Janela de abrir', 'Fachada com envidraçamento estrutural'),
    duo('is-landscape-3', 60, 3, 'Casa com portas e janelas de vidro', 'Sala com portas de vidro'),
    bannerCta(),
  ].join(''),
});

add({
  file: 'noticias.html', label: 'Notícias', title: 'Notícias | Rio Verde Vidros', ogTitle: 'Notícias',
  desc: 'Notas curtas sobre obra, matéria e o ofício do vidro.',
  h1: 'Notícias',
  body: () => [
    hero({ label: 'Notícias', lines: ['Notas sobre obra,', 'matéria e ofício.'], t: 'Notícias',
      text: 'Notas curtas sobre obra, matéria e o ofício do vidro.', image: 4, alt: 'Fachada com envidraçamento estrutural' }),
    listSection({ id: 'notas', label: 'Notas', t: 'Notas', lines: ['O que estamos', 'pensando e fazendo.'], items: [
      { num: 'Nota 01', title: 'O caixilho some, a paisagem fica', text: 'Quando o perfil encolhe, a arquitetura passa a conduzir o olhar. É nesse desenho que a coleção se apoia.' },
      { num: 'Nota 02', title: 'Medição antes da fábrica', text: 'Cada vão é conferido no lugar. O desenho só segue para produção quando a obra e o vidro concordam.' },
      { num: 'Nota 03', title: 'Showroom como prova', text: 'Ver a peça em escala real evita surpresa na instalação. A visita organiza a escolha.' },
    ] }),
    bannerCta(),
  ].join(''),
});

const prose = (label, parts) =>
  `<section class="rv-section" data-rv-label="${label}"><div class="rv-container"><div class="rv-prose">${parts.map(([h, p]) => `<h2>${h}</h2><p>${p}</p>`).join('')}<p class="rv-note">Texto provisório — revisar antes de publicar</p></div></div></section>`;
add({
  file: 'politica.html', label: 'Privacidade', title: 'Política de privacidade | Rio Verde Vidros', ogTitle: 'Política de privacidade',
  desc: 'Política de privacidade do site da Rio Verde Vidros.', h1: 'Política de privacidade', plain: true,
  body: () => [
    hero({ plain: true, label: 'Privacidade', lines: ['Política de', 'privacidade'], t: 'Privacidade', text: 'Como este site trata as informações de quem o visita.' }),
    prose('Privacidade', [
      ['Dados pessoais', 'Este site não envia dados a terceiros e não mantém cadastro de visitantes.'],
      ['Formulário de contato', 'O formulário de contato só confirma a mensagem neste navegador, sem guardar cadastro. Nenhuma informação é armazenada ou enviada.'],
      ['Dúvidas', 'Para qualquer dúvida sobre privacidade, fale com a equipe pela <a href="contato.html">página de contato</a>.'],
    ]),
  ].join(''),
});
add({
  file: 'termos.html', label: 'Termos', title: 'Termos | Rio Verde Vidros', ogTitle: 'Termos e condições',
  desc: 'Termos e condições de uso do site da Rio Verde Vidros.', h1: 'Termos e condições', plain: true,
  body: () => [
    hero({ plain: true, label: 'Termos', lines: ['Termos e', 'condições'], t: 'Termos', text: 'Condições de uso do conteúdo deste site.' }),
    prose('Termos', [
      ['Conteúdo do site', 'O conteúdo apresenta o ofício e a coleção da Rio Verde Vidros. Imagens e descrições têm caráter ilustrativo.'],
      ['Medidas, prazos e orçamentos', 'Medidas, prazos e peças fechadas só valem depois de um desenho confirmado para a obra.'],
      ['Contato', 'Para dúvidas sobre estes termos, fale com a equipe pela <a href="contato.html">página de contato</a>.'],
    ]),
  ].join(''),
});

// ---------- saída ----------
function write(file, html) {
  must(!/\$[&`'\d]/.test(html.slice(0, 0)), '');
  fs.writeFileSync(path.join(ROOT, file), html);
  console.log('ok', file, (html.length / 1024).toFixed(0) + ' KB');
}

write('index.html', shell(PREFIX + homeBody() + FOOTER + SUFFIX, {
  file: 'index.html', label: 'Início',
  title: 'Vidros arquitetônicos e estruturais sob medida | Rio Verde Vidros',
}));
for (const p of PAGES) {
  const body = pageHeader(p.h1, p.plain ? 'is-black' : 'is-white') + p.body();
  write(p.file, shell(PREFIX + body + FOOTER + SUFFIX, p));
}
