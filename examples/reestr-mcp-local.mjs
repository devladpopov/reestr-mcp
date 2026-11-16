#!/usr/bin/env node
// MCP-сервер (stdio) для API «Допуски контрагента» reestr-reestrov.ru. Без зависимостей, Node.js 18+.
// Инструменты: check_permits (допуски по ИНН), list_sources (источники), permit_changes (изменения по ИНН).
// Ключ: переменная окружения REESTR_API_KEY (без ключа работает демо-лимит 10 запросов в день).
// Подключение (Claude Desktop, claude_desktop_config.json):
//   "mcpServers": { "reestr": { "command": "node", "args": ["/путь/reestr-mcp.mjs"], "env": { "REESTR_API_KEY": "rr_..." } } }
import { createInterface } from 'node:readline';

const BASE = process.env.REESTR_API_BASE || 'https://reestr-reestrov.ru';
const KEY = process.env.REESTR_API_KEY || '';
const VERSION = '1.0.0';

const TOOLS = [
  {
    name: 'check_permits',
    description: 'Допуски компании или ИП по ИНН в официальных отраслевых реестрах России: членство в СРО (НОСТРОЙ, НОПРИЗ), лицензии, аккредитации, реестры Банка России, РНП и др. Возвращает по каждому источнику found, записи (status, number, date_from, date_to), ссылку на первоисточник и дату выгрузки.',
    inputSchema: { type: 'object', properties: { inn: { type: 'string', description: 'ИНН: 10 цифр (организация) или 12 (ИП)' }, sources: { type: 'string', description: 'Необязательно: id источников через запятую (см. list_sources)' } }, required: ['inn'] },
  },
  { name: 'list_sources', description: 'Список источников API: id, название, ведомство, дата выгрузки, число записей.', inputSchema: { type: 'object', properties: {} } },
  {
    name: 'permit_changes',
    description: 'Изменения в реестрах допусков по ИНН: запись появилась, исчезла или изменилась (по ежедневным снимкам).',
    inputSchema: { type: 'object', properties: { inn: { type: 'string' }, since: { type: 'string', description: 'Дата YYYY-MM-DD, по умолчанию 30 дней назад' } }, required: ['inn'] },
  },
];

async function api(path, params) {
  const u = new URL(BASE + path);
  for (const [k, v] of Object.entries(params || {})) if (v) u.searchParams.set(k, v);
  const r = await fetch(u, { headers: { Accept: 'application/json', 'User-Agent': 'reestr-mcp/' + VERSION, ...(KEY ? { 'X-API-Key': KEY } : {}) } });
  const j = await r.json().catch(() => ({ error: 'bad_json' }));
  if (!r.ok) throw new Error(`HTTP ${r.status}: ${j.message || j.error || ''}`);
  return j;
}

async function callTool(name, a) {
  if (name === 'check_permits') return api('/api/v1/permits', { inn: String(a.inn || '').replace(/\D/g, ''), sources: a.sources });
  if (name === 'list_sources') {
    const j = await api('/api/v1/sources');
    return j.sources.map((s) => ({ id: s.id, title: s.title, agency: s.agency, mode: s.mode, updated_at: s.updated_at, records: s.records }));
  }
  if (name === 'permit_changes') return api('/api/v1/changes', { inn: String(a.inn || '').replace(/\D/g, ''), since: a.since });
  throw new Error('unknown tool ' + name);
}

const send = (m) => process.stdout.write(JSON.stringify(m) + '\n');
const rl = createInterface({ input: process.stdin });
rl.on('line', async (line) => {
  let m;
  try { m = JSON.parse(line); } catch { return; }
  const { id, method, params } = m;
  if (id === undefined || id === null) return; // уведомления (notifications/initialized и т.п.)
  try {
    if (method === 'initialize') {
      return send({ jsonrpc: '2.0', id, result: { protocolVersion: params?.protocolVersion || '2024-11-05', capabilities: { tools: {} }, serverInfo: { name: 'reestr-reestrov', version: VERSION } } });
    }
    if (method === 'ping') return send({ jsonrpc: '2.0', id, result: {} });
    if (method === 'tools/list') return send({ jsonrpc: '2.0', id, result: { tools: TOOLS } });
    if (method === 'tools/call') {
      try {
        const res = await callTool(params.name, params.arguments || {});
        return send({ jsonrpc: '2.0', id, result: { content: [{ type: 'text', text: JSON.stringify(res, null, 1) }] } });
      } catch (e) {
        return send({ jsonrpc: '2.0', id, result: { content: [{ type: 'text', text: 'Ошибка: ' + e.message }], isError: true } });
      }
    }
    send({ jsonrpc: '2.0', id, error: { code: -32601, message: 'Method not found' } });
  } catch (e) {
    send({ jsonrpc: '2.0', id, error: { code: -32603, message: e.message } });
  }
});
