/**
 * Gerencia o SSH tunnel para o serveo.net e atualiza o webhook do UazAPI
 * automaticamente quando a URL mudar.
 *
 * Execute: node tunnel.js
 */
import { spawn } from 'child_process'
import axios from 'axios'

const UAZAPI_URL   = 'https://adriane.uazapi.com'
const ADMIN_TOKEN  = 'GZCWcuWkdbGqlkYzo19mlddgC7V0JLPavogiVO0wdNYbJbAi9h'
const INST_TOKEN   = '55ef4997-2db1-4fc8-8531-6290ba267f11'

let currentUrl = null

async function updateWebhook(url) {
  if (url === currentUrl) return
  currentUrl = url
  try {
    const { data } = await axios.post(`${UAZAPI_URL}/webhook`, {
      url: `${url}/webhook`,
      enabled: true,
      events: ['messages', 'sender'],
      excludeMessages: ['wasSentByApi', 'isGroupYes'],
    }, {
      headers: {
        'admin-token': ADMIN_TOKEN,
        token: INST_TOKEN,
        'Content-Type': 'application/json',
      }
    })
    console.log(`[TUNNEL] Webhook atualizado → ${url}/webhook`)
  } catch (err) {
    console.error('[TUNNEL] Erro ao atualizar webhook:', err.message)
  }
}

function startTunnel() {
  console.log('[TUNNEL] Iniciando tunnel SSH...')

  const ssh = spawn('ssh', [
    '-o', 'StrictHostKeyChecking=no',
    '-o', 'ServerAliveInterval=30',
    '-o', 'ServerAliveCountMax=10',
    '-R', '80:localhost:3000',
    'serveo.net'
  ], { stdio: ['ignore', 'pipe', 'pipe'] })

  let buffer = ''

  ssh.stdout.on('data', (data) => {
    buffer += data.toString()
    const match = buffer.match(/https:\/\/[a-z0-9-]+\.serveousercontent\.com/)
    if (match) {
      const url = match[0]
      console.log(`[TUNNEL] URL pública: ${url}`)
      updateWebhook(url)
    }
  })

  ssh.stderr.on('data', (data) => {
    const msg = data.toString()
    if (msg.includes('Forwarding')) {
      const match = msg.match(/https:\/\/[a-z0-9-]+\.serveousercontent\.com/)
      if (match) {
        console.log(`[TUNNEL] URL pública: ${match[0]}`)
        updateWebhook(match[0])
      }
    }
  })

  ssh.on('close', (code) => {
    console.log(`[TUNNEL] Tunnel encerrado (code ${code}). Reconectando em 5s...`)
    currentUrl = null
    setTimeout(startTunnel, 5000)
  })

  return ssh
}

startTunnel()
console.log('[TUNNEL] Gerenciador iniciado. Ctrl+C para parar.')
