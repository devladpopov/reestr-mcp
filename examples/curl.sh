#!/usr/bin/env bash
# Вызов MCP без клиента: JSON-RPC 2.0 POST. Ключ необязателен (без него до 10 строк в ответе).
U=https://reestr-reestrov.ru/api/mcp
H=(-H 'Content-Type: application/json' -H 'Accept: application/json, text/event-stream')
[ -n "${REESTR_KEY:-}" ] && H+=(-H "Authorization: Bearer $REESTR_KEY")

# список инструментов
curl -s "${H[@]}" "$U" -d '{"jsonrpc":"2.0","id":1,"method":"tools/list"}'

# все допуски компании по ИНН
curl -s "${H[@]}" "$U" -d '{"jsonrpc":"2.0","id":2,"method":"tools/call","params":{"name":"check_permits","arguments":{"inn":"7707083893"}}}'

# записи реестра НОСТРОЙ по части названия
curl -s "${H[@]}" "$U" -d '{"jsonrpc":"2.0","id":3,"method":"tools/call","params":{"name":"query_registry","arguments":{"source":"nostroy","name":"мостострой"}}}'
