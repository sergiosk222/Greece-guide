import { articles, categories, statusLabels } from './data/articles.js'

const nav = ['Home', 'Articles', 'About', 'Disclaimer', 'Suggest Correction']
const sectionOrder = ['Коротко', 'Кому нужно', 'Что понадобится', 'Куда обращаться', 'Пошагово', 'Частые ошибки', 'Официальный источник', 'Предупреждение']
const root = document.querySelector('#root')
let searchQuery = ''
let selectedCategory = 'Все'

function statusClass(status) {
  return status === 'verified' ? 'status verified' : status === 'needs_update' ? 'status update' : 'status draft'
}

function label(route) {
  return { Home: 'Главная', Articles: 'Статьи', About: 'О проекте', Disclaimer: 'Дисклеймер', 'Suggest Correction': 'Предложить исправление' }[route]
}

function routeTo(page, articleId) {
  window.location.hash = articleId ? `#/${page}/${articleId}` : `#/${page}`
}

function route() {
  const [, page = 'Home', articleId] = (window.location.hash || '#/Home').split('/')
  return { page, articleId }
}

function layout(content) {
  root.innerHTML = `
    <header class="site-header">
      <div class="header-inner">
        <button class="brand focus-ring" data-route="Home">
          <span class="brand-mark">✓</span>
          <span><strong>Greece Guide</strong><small>Официально. Просто. Бесплатно.</small></span>
        </button>
        <nav class="desktop-nav">${nav.map((item) => `<button class="nav-btn focus-ring" data-route="${item}">${label(item)}</button>`).join('')}</nav>
        <button class="menu-btn focus-ring" aria-expanded="false" aria-label="Открыть меню">☰</button>
      </div>
      <div class="mobile-nav" hidden>${nav.map((item) => `<button data-route="${item}">${label(item)}</button>`).join('')}</div>
    </header>
    ${content}
    <footer>Greece Guide — бесплатный справочник. Не является юридической консультацией.</footer>
  `
  root.querySelectorAll('[data-route]').forEach((button) => button.addEventListener('click', () => routeTo(button.dataset.route)))
  const menu = root.querySelector('.menu-btn')
  const mobileNav = root.querySelector('.mobile-nav')
  menu.addEventListener('click', () => {
    const open = mobileNav.hasAttribute('hidden')
    mobileNav.toggleAttribute('hidden', !open)
    menu.setAttribute('aria-expanded', String(open))
    menu.textContent = open ? '×' : '☰'
  })
}

function searchBox(value = '') {
  return `
    <label class="search-label">
      <span>Поиск по справочнику</span>
      <div class="search-box"><span class="icon" aria-hidden="true">🔎</span><input id="article-search" value="${escapeHtml(value)}" placeholder="Например: ΑΜΚΑ, ΑΦΜ, gov.gr" /></div>
    </label>
  `
}

function articleCard(article) {
  return `
    <article class="card motion-card">
      <div class="badges"><span class="category-badge">${article.category}</span><span class="${statusClass(article.status)}">${statusLabels[article.status]}</span></div>
      <h3>${article.title}</h3>
      <p>${article.summary}</p>
      <dl><dt>Последняя проверка</dt><dd>${article.lastChecked}</dd><dt>Источник</dt><dd>${article.sourceName}</dd></dl>
      <button class="primary-btn focus-ring" data-article="${article.id}">Открыть статью</button>
    </article>
  `
}

function home() {
  const filtered = filterArticles(searchQuery, 'Все')
  layout(`
    <section class="hero"><div class="container"><p class="eyebrow">Для жителей Греции, пожилых людей и иностранцев</p><h1>Греческие процедуры простым человеческим языком</h1><p class="hero-text">Мы объясняем, где искать официальную информацию, какие шаги проверить и как не попасть на неофициальные сайты.</p>${searchBox(searchQuery)}</div></section>
    <main class="container main-space"><section><h2>Разделы</h2><div class="category-grid">${categories.map((category) => `<button class="category-card focus-ring" data-route="Articles"><span class="icon" aria-hidden="true">📄</span>${category}</button>`).join('')}</div></section><h2>Популярные статьи</h2><div class="cards-grid">${filtered.map(articleCard).join('')}</div></main>
  `)
  wireSearch(home)
  wireArticleButtons()
}

function articlesPage() {
  const filtered = filterArticles(searchQuery, selectedCategory)
  layout(`
    <main class="container page"><h1>Статьи</h1>${searchBox(searchQuery)}<div class="filters">${['Все', ...categories].map((category) => `<button class="${selectedCategory === category ? 'active' : ''}" data-category="${category}">${category}</button>`).join('')}</div><div class="cards-grid">${filtered.map(articleCard).join('')}</div></main>
  `)
  wireSearch(articlesPage)
  root.querySelectorAll('[data-category]').forEach((button) => button.addEventListener('click', () => { selectedCategory = button.dataset.category; articlesPage() }))
  wireArticleButtons()
}

function articleDetail(id) {
  const article = articles.find((item) => item.id === id) || articles[0]
  layout(`
    <main class="container article-page"><button class="back-btn focus-ring" data-route="Articles">← Все статьи</button><h1>${article.title}</h1><div class="badges"><span class="${statusClass(article.status)}">${statusLabels[article.status]}</span><span class="category-badge">Проверено: ${article.lastChecked}</span></div>${sectionOrder.map((section) => `<section class="content-section"><h2>${section}</h2><p class="${section === 'Предупреждение' ? 'warning-text' : ''}">${article.sections[section]}</p></section>`).join('')}<div class="article-actions"><a href="${article.sourceUrl}" target="_blank" rel="noreferrer" class="primary-btn focus-ring">Открыть источник ↗</a><button class="secondary-btn focus-ring" data-route="Suggest Correction">Предложить исправление</button></div></main>
  `)
}

function simplePage(type) {
  const pages = {
    About: ['О проекте', 'Greece Guide помогает читать официальные процедуры проще. Проект не заменяет государственные сайты и не даёт юридических консультаций.'],
    Disclaimer: ['Дисклеймер', 'Информация носит справочный характер. Перед действием проверяйте актуальные требования на официальном сайте. Статус «Проверено» ставит только владелец проекта после ручной проверки.'],
    'Suggest Correction': ['Предложить исправление', 'Нашли ошибку? Подготовьте ссылку на официальный источник и описание проблемы. Публикация изменений возможна только после ручной проверки владельца проекта.'],
  }
  const [title, text] = pages[type]
  layout(`<main class="container page narrow"><h1>${title}</h1><p class="lead">${text}</p><div class="notice"><span class="icon" aria-hidden="true">⚠️</span><strong>Используйте только официальные источники:</strong> gov.gr, efka.gov.gr, ypergasias.gov.gr, aade.gr, dypa.gov.gr, eopyy.gov.gr, migration.gov.gr, stratologia.gr и сайты Δήμος.</div></main>`)
}

function filterArticles(query, category) {
  const lower = query.toLowerCase()
  return articles.filter((article) => (category === 'Все' || article.category === category) && `${article.title} ${article.summary} ${article.category}`.toLowerCase().includes(lower))
}

function wireSearch(render) {
  const input = root.querySelector('#article-search')
  input.addEventListener('input', () => { searchQuery = input.value; render() })
}

function wireArticleButtons() {
  root.querySelectorAll('[data-article]').forEach((button) => button.addEventListener('click', () => routeTo('Article', button.dataset.article)))
}

function escapeHtml(value) {
  return value.replace(/[&<>'"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[char])
}

function render() {
  const { page, articleId } = route()
  if (page === 'Articles') articlesPage()
  else if (page === 'Article') articleDetail(articleId)
  else if (['About', 'Disclaimer', 'Suggest Correction'].includes(page)) simplePage(page)
  else home()
}

window.addEventListener('hashchange', render)
render()
