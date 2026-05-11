import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'

const app = new Hono().basePath('/api')

app.use('*', logger())
app.use('*', cors())

app.get('/health', (c) => {
  return c.json({ success: true, data: { status: 'ok' } })
})

export default app
