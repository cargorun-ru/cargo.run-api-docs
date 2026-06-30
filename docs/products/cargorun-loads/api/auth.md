# Авторизация

API использует JWT-токены. Полученный access token передается в заголовке `Authorization`.

---

## 1. Получение токена

```http
POST /api/Account/GenerateToken
```

### Тело запроса

```json
{
  "email": "user@example.com",
  "password": "password"
}
```

### Ответ

```json
{
  "token": "string",
  "expires": 0,
  "refreshToken": "string"
}
```

Access token действует около 30 минут.

---

## 2. Передача токена

```http
Authorization: Bearer <access_token>
```

Пример:

```http
GET <baseUrl>/api/Orders/GetIntegrationList
Authorization: Bearer eyJhbGciOiJIUzI1...
```

---

## 3. Обновление токена

```http
POST /api/Account/RefreshToken
```

### Тело запроса

```json
{
  "token": "<access_token>",
  "refreshToken": "<refresh_token>"
}
```

### Ответ

```json
{
  "token": "string",
  "expires": 0,
  "refreshToken": "string"
}
```

---

## 4. Рекомендации

- Не запрашивайте новый токен перед каждым API-вызовом.
- Используйте `RefreshToken` после истечения access token.
- Не сохраняйте токены в открытых логах.
- При ошибке `401` обновите токен и повторите запрос один раз.
