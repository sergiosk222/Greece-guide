import { readdir, readFile } from 'node:fs/promises'
import path from 'node:path'

const requiredArticleSections = [
  'Коротко',
  'Кому нужно',
  'Что понадобится',
  'Куда обращаться',
  'Пошагово',
  'Частые ошибки',
  'Официальный источник',
  'Предупреждение',
]
const approvedDomains = [
  'gov.gr',
  'efka.gov.gr',
  'ypergasias.gov.gr',
  'aade.gr',
  'dypa.gov.gr',
  'eopyy.gov.gr',
  'migration.gov.gr',
  'stratologia.gr',
]
const filesToCheck = ['src/main.jsx', 'src/data/articles.js', 'src/styles.css', 'README.md']
const errors = []

for (const file of filesToCheck) {
  const text = await readFile(file, 'utf8')
  if (text.includes('\t')) errors.push(`${file}: tabs are not allowed`)
  if (!text.endsWith('\n')) errors.push(`${file}: must end with a newline`)
}

const { articles, categories } = await import(path.resolve('src/data/articles.js'))
const ids = new Set()
for (const article of articles) {
  if (ids.has(article.id)) errors.push(`${article.id}: duplicate article id`)
  ids.add(article.id)
  for (const field of ['id', 'title', 'category', 'summary', 'status', 'lastChecked', 'sourceName', 'sourceUrl', 'sections']) {
    if (!article[field]) errors.push(`${article.id}: missing ${field}`)
  }
  if (!categories.includes(article.category)) errors.push(`${article.id}: unknown category ${article.category}`)
  if (article.status !== 'draft') errors.push(`${article.id}: demo/new articles must stay draft until owner verification`)
  const host = new URL(article.sourceUrl).hostname.replace(/^www\./, '')
  if (!approvedDomains.some((domain) => host === domain || host.endsWith(`.${domain}`))) {
    errors.push(`${article.id}: sourceUrl must use an approved official domain`)
  }
  for (const section of requiredArticleSections) {
    if (!article.sections?.[section]) errors.push(`${article.id}: missing section ${section}`)
  }
}

const promptFiles = await readdir('agent-prompts')
for (const file of ['research-agent.md', 'translator-agent.md', 'editor-agent.md', 'quality-check-agent.md', 'publisher-agent.md']) {
  if (!promptFiles.includes(file)) errors.push(`agent-prompts/${file}: missing`)
}

if (errors.length) {
  console.error(errors.map((error) => `✗ ${error}`).join('\n'))
  process.exit(1)
}
console.log('✓ Greece Guide lint checks passed')
