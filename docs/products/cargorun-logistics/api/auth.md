# Авторизация и доступ к API

Этот раздел описывает, как получить доступ к API CARGO.RUN и как передавать токен авторизации в запросах.

---

## 1. Общие принципы

Доступ к API CARGO.RUN защищён с помощью **JWT-токена**, который передаётся в HTTP-заголовке:

```http
Authorization: Bearer <access_token>
```

Заголовок передается во все методы, которым требуется авторизация. Формат значения: слово `Bearer`, пробел и токен доступа.

---

## 2. Базовый URL

Базовый URL API определяется для конкретного клиента при подключении:

```text
https://api.app.cargorun.ru/
https://api.test.cargorun.ru/
https://api.<customer>.cargorun.ru/
```

Во всех примерах далее используется абстрактный `<baseUrl>`.

---

## 3. Получение токена доступа

Для получения токена используется метод:

```
POST /api/Account/GenerateToken
```

### 3.1. Модель запроса

```json
{
  "userName": "string",
  "password": "string",
  "code": "string"
}
```

Для интеграции поле `code` может быть проигнорировано. Используется для авторизации водителей.

Полученный токен имеет ограниченный срок действия и не требует повторного запроса
при каждой операции. До его истечения или после ответа `401` обновите пару токенов.

Не вычисляйте срок действия самостоятельно: используйте `accessToken.expiresIn`
из ответа. Значение задаётся сервером и может отличаться между средами.


### 3.2. Пример запроса

```http
POST <baseUrl>/api/Account/GenerateToken
Content-Type: application/json

{
  "userName": "user@example.com",
  "password": "P@ssw0rd",
  "code": "999999"
}
```

### 3.3. Успешный ответ

Основные поля ответа:

| Поле | Тип | Описание |
|---|---|---|
| `accessToken.token` | `string` | JWT для заголовка `Authorization` |
| `accessToken.expiresIn` | `integer` | Срок действия access token в секундах |
| `refreshToken` | `string` | Токен для обновления пары токенов |
| `requiresTwoFactor` | `boolean` | Требуется ли второй фактор |
| `twoFactorToken` | `object?` | Временный токен второго фактора, если он требуется |
| `currentUser` | `object?` | Данные текущего пользователя |

Сокращённый пример без пользовательских данных:

```json
{
  "accessToken": {
    "token": "<jwt>",
    "expiresIn": 1800
  },
  "refreshToken": "<refresh_token>",
  "requiresTwoFactor": false,
  "twoFactorToken": null
}
```

### 3.4. Ограничения метода

Метод `/api/Account/GenerateToken` не предназначен для регулярного или частого вызова. На стороне сервера действуют ограничения (cooldown), и при слишком частом запросе токена сервер может вернуть ошибку `429`.

Причина введения ограничения:

- метод должен использоваться только для начальной авторизации пользователя;
- дальнейшая работа с API должна выполняться через механизм обновления токена (`RefreshToken`).

---

## 4. Обновление токена

Для обновления токена необходимо использовать метод:

```
POST /api/Account/RefreshToken
```

### 4.1. Модель запроса

```json
{
  "accessToken": "string",
  "refreshToken": "string"
}
```

### 4.2. Пример запроса

```http
POST <baseUrl>/api/Account/RefreshToken
Content-Type: application/json

{
  "accessToken": "<старый_access_token>",
  "refreshToken": "<refresh_token>"
}
```

При успехе метод возвращает новую пару в том же формате. Сохраните оба новых
значения атомарно; не продолжайте использовать прежний refresh token, если сервер
вернул новый.

---

## 5. Передача токена в запросах

```http
Authorization: Bearer <access_token>
```

Пример:

```http
GET <baseUrl>/api/bids/GetListForExternal
Authorization: Bearer eyJhbGciOiJIUzI1...
```

---

## 6. Ошибки авторизации

### 401 Unauthorized
- отсутствует заголовок
- токен просрочен или недействителен

### 403 Forbidden
- недостаточно прав

---

## 7. Рекомендации по безопасности

- не хранить токены в логах;
- ограничить доступ к файлам конфигурации;
- использовать только HTTPS;
- при утечке токена немедленно перевыпустить.

---

## 8. Связанные разделы

- [Общий обзор](../integration/overview.md)
- [Синхронизация справочников](../integration/sync.md)
- [Примеры для 1С](../integration/examples-1c.md)
