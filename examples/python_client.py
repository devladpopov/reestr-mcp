"""Минимальный клиент MCP Реестра реестров без зависимостей (Python 3.8+).
Ключ необязателен: REESTR_KEY=rr_... python python_client.py 7707083893
"""
import json, os, sys, urllib.request

URL = 'https://reestr-reestrov.ru/api/mcp'


def call(tool, **args):
    body = {'jsonrpc': '2.0', 'id': 1, 'method': 'tools/call', 'params': {'name': tool, 'arguments': args}}
    hd = {'Content-Type': 'application/json', 'Accept': 'application/json'}
    if os.environ.get('REESTR_KEY'):
        hd['Authorization'] = 'Bearer ' + os.environ['REESTR_KEY']
    req = urllib.request.Request(URL, json.dumps(body).encode(), hd)
    with urllib.request.urlopen(req, timeout=120) as r:
        res = json.load(r)
    if 'error' in res:
        raise RuntimeError(res['error'])
    return json.loads(res['result']['content'][0]['text'])


if __name__ == '__main__':
    inn = sys.argv[1] if len(sys.argv) > 1 else '7707083893'
    r = call('check_permits', inn=inn)
    print(r.get('name'), '- найдено в', r.get('found_in'), 'реестрах')
    for s in r.get('sources', []):
        print('-', s.get('title'))
