# WB Tariffs Service

Сервис делает две вещи:
- раз в час забирает тарифы коробов WB и сохраняет их в PostgreSQL;
- раз в час обновляет данные в Google Sheets (`stocks_coefs`) для всех `spreadsheet_id` из БД.

## Стек
- Node.js 20 + TypeScript
- PostgreSQL + knex
- Docker Compose
- Google Sheets API

## Быстрый старт
1. Скопировать `example.env` в `.env`.
2. Заполнить обязательные переменные:
   - `WB_API_TOKEN`
   - `GOOGLE_SERVICE_ACCOUNT_PROJECT_ID`
   - `GOOGLE_SERVICE_ACCOUNT_CLIENT_EMAIL`
   - `GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY`
   - `GOOGLE_SPREADSHEET_IDS`
3. Запустить:

```bash
docker compose up --build
```

## Google Sheets (кратко)
1. Создать таблицу и лист `stocks_coefs`.
2. Выдать доступ `Editor` для `GOOGLE_SERVICE_ACCOUNT_CLIENT_EMAIL`.
3. Взять `spreadsheet_id` из URL таблицы и добавить в `GOOGLE_SPREADSHEET_IDS`.
4. Убедиться, что `GOOGLE_SERVICE_ACCOUNT_*` заполнены в `.env`.

## Что делает приложение при старте
- применяет миграции;
- запускает seed;
- стартует worker;
- поднимает `GET /health` на `:5000`.

## Как проверить, что все работает
1. Health:

```bash
curl http://localhost:5000/health
```

Ожидаемый ответ: `{"status":"ok"}`.

2. В логах контейнера `app` должны быть успешные шаги:
- `[wb-ingest] done: upserted=...`
- `[sheets-sync] done: spreadsheets=... rows=...`

3. В БД должна заполняться таблица `wb_box_tariffs_daily`, а в Google Sheet (лист `stocks_coefs`) должны обновляться строки.

## Бизнес-правила
- `tariff_date` хранится как дата дня.
- Повторный hourly запуск в тот же день обновляет записи, а не создает дубли (`daily upsert`).
- Перед выгрузкой в Google Sheets данные сортируются по возрастанию коэффициента.

## Переменные окружения (минимум)
- БД (по ТЗ): `POSTGRES_DB=postgres`, `POSTGRES_USER=postgres`, `POSTGRES_PASSWORD=postgres`.
- `WB_API_TOKEN` — токен WB API.
- `GOOGLE_SERVICE_ACCOUNT_*` — доступ к Google Sheets через service account.
- `GOOGLE_SPREADSHEET_IDS` — список таблиц через запятую.
