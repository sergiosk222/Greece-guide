import http from 'node:http'
import { readFile, stat } from 'node:fs/promises'
import path from 'node:path'

const root = process.argv[2] || '.'
const port = Number(process.argv[3] || process.env.PORT || 5173)
const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.json': 'application/json; charset=utf-8' }

const server = http.createServer(async (request, response) => {
  try {
    const url = new URL(request.url, `http://localhost:${port}`)
    const pathname = decodeURIComponent(url.pathname === '/' ? '/index.html' : url.pathname)
    const filePath = path.join(root, pathname.replace(/^\/Greece-guide\//, '/'))
    const fileStat = await stat(filePath)
    const finalPath = fileStat.isDirectory() ? path.join(filePath, 'index.html') : filePath
    const body = await readFile(finalPath)
    response.writeHead(200, { 'content-type': types[path.extname(finalPath)] || 'application/octet-stream' })
    response.end(body)
  } catch {
    response.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' })
    response.end('Not found')
  }
})

server.listen(port, () => console.log(`Greece Guide dev server: http://localhost:${port}`))
