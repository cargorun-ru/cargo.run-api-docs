# Подключение и авторизация

## Что выдаёт CARGO.RUN

Для партнёрского сервиса создаётся интеграционный клиент. CARGO.RUN передаёт:

- `clientId`;
- `clientSecret`;
- `<baseUrl>` тестового или промышленного API.

Дополнительно CARGO.RUN настраивает платформу клиента, разрешения, callback и подписки.

## Получение токена

```http
POST <baseUrl>/api/Account/Token
Content-Type: application/json
```

```json
{
  "grantType": "client_credentials",
  "clientId": "partner-client-id",
  "clientSecret": "partner-client-secret"
}
```

| Поле | Тип | Обязательно | Значение |
|---|---|---:|---|
| `grantType` | string | Да | Всегда `client_credentials` |
| `clientId` | string | Да | Идентификатор интеграционного клиента |
| `clientSecret` | string | Да | Секрет интеграционного клиента |

Из успешного ответа нужны:

```json
{
  "accessToken": {
    "token": "<jwt-token>",
    "expiresIn": 3600
  }
}
```

`expiresIn` задаётся в секундах. Поля пользовательской авторизации `refreshToken`, `twoFactorToken`, `twoFactorProvider`, `currentUser` и `requiresTwoFactor` не входят в публичный M2M-контракт и не должны использоваться.

## Использование токена

Во всех методах, кроме получения токена, передавайте:

```http
Authorization: Bearer <accessToken.token>
```

Для JSON-запросов:

```http
Content-Type: application/json
```

## Обновление токена

- кешируйте токен до окончания `expiresIn`;
- не запрашивайте новый токен перед каждым вызовом;
- вызывайте [`Account/Token`](reference/endpoints.md#post-apiaccounttoken) не чаще двух раз за 30 секунд, иначе возможен `429 Too Many Requests`;
- при `401 Unauthorized` один раз получите новый токен и повторите исходный запрос;
- не записывайте `clientSecret` и токен в логи.

## Настройка callback

Сотрудник CARGO.RUN указывает для интеграционного клиента:

- `callbackTarget` — HTTPS URL партнёра;
- `callbackSecret` — секрет HMAC-подписи;
- платформу, которой соответствуют связанные заявки;
- подписку `Bid/Summary` или `Bid/Default`.

Партнёрский сервис не меняет эти настройки через M2M API.

Формат запросов, подпись и правила повторной доставки описаны в разделе [Webhook и подписки](webhooks.md).

## Проверка callback

```http
POST <baseUrl>/api/integrations/Tasks/Ping
Authorization: Bearer <accessToken.token>
```

CARGO.RUN отправит на callback тестовый webhook с заголовком:

```http
X-Cargorun-Webhook-Event: ping
```

Метод позволяет проверить доступность endpoint и реализацию проверки подписи.
