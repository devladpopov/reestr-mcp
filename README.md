# Реестр реестров MCP: госреестры России для ИИ-ассистентов

[English below](#english)

Удалённый MCP-сервер [Реестра реестров](https://reestr-reestrov.ru/mcp/). Ассистент (Claude, ChatGPT, Cursor, VS Code и любой клиент MCP) сам находит нужный государственный реестр, проверяет компанию по ИНН и достаёт записи о лицензиях, членстве в СРО и аккредитациях. В каждом ответе источник и дата выгрузки.

- Адрес: `https://reestr-reestrov.ru/api/mcp`
- Транспорт: streamable HTTP (JSON-RPC 2.0, JSON-ответы, без сессий)
- Ключ не обязателен. Бесплатный ключ (только почта): https://reestr-reestrov.ru/mcp/#klyuch
- Официальный MCP Registry: `ru.reestr-reestrov/reestr`

## Инструменты

| Инструмент | Что делает |
|---|---|
| `search_registries` | Поиск по каталогу из ~600 государственных реестров: кто ведёт, закон, открытость, API, где проверить |
| `get_registry` | Паспорт реестра: ведомство, закон и статья, год, официальный сайт, как проверить запись |
| `registries_for_okved` | В каких реестрах обязан состоять бизнес с этим кодом ОКВЭД 2 |
| `list_agencies` | Ведомства и число их реестров |
| `check_inn` | Проверка компании или ИП по ИНН в реальном времени: ЕГРЮЛ/ЕГРИП, МСП, Федресурс, операторы ПДн, РНП, лицензии |
| `list_sources` | Около 100 официальных реестров с записями (лицензии, СРО, аккредитации, Банк России, РНП), дата обновления, число записей |
| `query_registry` | Записи одного реестра по ИНН, номеру лицензии или свидетельства, части названия, статусу |
| `check_permits` | Все лицензии, СРО и аккредитации компании по ИНН из всех источников |

Примеры вопросов и реальных ответов: [examples/PROMPTS.md](examples/PROMPTS.md).

## Подключение

**Claude** (веб и приложения): «Настройки», «Коннекторы», «Добавить свой коннектор», адрес `https://reestr-reestrov.ru/api/mcp`.

**Claude Code:**
```bash
claude mcp add --transport http reestr https://reestr-reestrov.ru/api/mcp
# с бесплатным ключом (до 50 строк в ответе вместо 10):
claude mcp add --transport http reestr https://reestr-reestrov.ru/api/mcp --header "Authorization: Bearer rr_..."
```

**ChatGPT:** режим разработчика, «Создать» коннектор, URL `https://reestr-reestrov.ru/api/mcp`, аутентификация «Нет».

**Cursor, VS Code и другие:** [examples/mcp.json](examples/mcp.json).

**Без клиента MCP:** [examples/curl.sh](examples/curl.sh), [examples/python_client.py](examples/python_client.py).

**Только локальные серверы (stdio):** [examples/reestr-mcp-local.mjs](examples/reestr-mcp-local.mjs), один файл без зависимостей, Node.js 18+, ходит в REST API допусков.

## Квоты

| | Без ключа | Бесплатный ключ | Тарифы API |
|---|---|---|---|
| Каталог реестров | 120 запросов в минуту с IP | так же | так же |
| Строк в ответе (записи реестров) | 10 | 50 | 500 |
| Запросов записей | 30 в сутки с IP | 100 в сутки | по тарифу |

Тарифы, массовая проверка списков ИНН и мониторинг: https://reestr-reestrov.ru/api-dostupy/#tarify

## Данные

Только официальные сайты ведомств и их открытые выгрузки, записи обновляются каждую ночь. Реестры с данными о частных лицах в инструменты записей не входят. Паспорт каталога под лицензией CC BY 4.0: [gosreestry-data](https://github.com/devladpopov/gosreestry-data). Это не официальный ресурс государственных органов; перед юридически значимым решением сверяйте запись на сайте ведомства (ссылка есть в ответе).

Издатель: ООО «Стадика», info@stadika.ru. Код примеров в этом репозитории: MIT.

---

## English

Remote MCP server for **Russian government registries** by [reestr-reestrov.ru](https://reestr-reestrov.ru/mcp/). Lets an AI assistant find the right state registry among ~600, check a Russian company by INN (tax ID) in real time, and pull actual records of licenses, SRO memberships and accreditations from ~100 official registries refreshed nightly. Every answer cites the source and the export date. Responses are in Russian.

- Endpoint: `https://reestr-reestrov.ru/api/mcp` (streamable HTTP, no session, JSON responses)
- No key required. Optional free key (email only) raises the row limit from 10 to 50: `Authorization: Bearer rr_...`
- Official MCP Registry name: `ru.reestr-reestrov/reestr`

```bash
claude mcp add --transport http reestr https://reestr-reestrov.ru/api/mcp
```

Tools: `search_registries`, `get_registry`, `registries_for_okved`, `list_agencies`, `check_inn`, `list_sources`, `query_registry`, `check_permits` (see table above).

Example prompts: "Which licenses and SRO memberships does INN 7707083893 have?", "Which registries must a dental clinic (OKVED 86.23) be listed in?", "Find construction companies named Mostostroy in the NOSTROY register."

Publisher: Stadika LLC (Russia), info@stadika.ru. Example code: MIT.
