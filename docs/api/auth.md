# Авторизация и доступ к API

Этот раздел описывает, как получить доступ к API CARGO.RUN и как передавать токен авторизации в запросах.

---

## 1. Общие принципы

Доступ к API CARGO.RUN защищён с помощью **JWT-токена**, который передаётся в HTTP-заголовке:

```http
Authorization: Bearer <access_token>
```

В swagger-схеме используется схема безопасности `Bearer`:

- тип: `apiKey`
- заголовок: `Authorization`
- формат: `Bearer {token}`

---

## 2. Базовый URL

Базовый URL API определяется для конкретного клиента при подключении:

```text
https://app.cargorun.ru/
https://test.cargorun.ru/
https://<customer>.cargorun.ru/
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

Полученный токен действителен в течение 30 минут и не требует повторного запроса при каждой операции. По истечении срока действия ключа (30 мин) необходимо отправить запрос на обновление токена.


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

- [Общий обзор](./integration/overview.md)
- [Синхронизация справочников](./integration/sync.md)
- [Примеры для 1С](./integration/examples-1c.md)



