import { mkdir, rm, cp, readFile, writeFile } from 'node:fs/promises'

const dist = 'dist'
await rm(dist, { recursive: true, force: true })
await mkdir(dist, { recursive: true })
await cp('src', `${dist}/src`, { recursive: true })
let html = await readFile('index.html', 'utf8')
if (process.env.GITHUB_PAGES === 'true') {
  html = html.replace('src="/src/app.js"', 'src="/Greece-guide/src/app.js"')
}
await writeFile(`${dist}/index.html`, html)
console.log('✓ Built Greece Guide static site into dist/')
