# Синхронное API

Синхронный метод возвращает результат обработки в ответе на тот же HTTP-запрос. Этот способ проще для одиночных операций и обязателен для получения фактического маршрута.

## Доступные операции

| Задача | Метод |
|---|---|
| Получить токен | [`POST /api/Account/Token`](reference/endpoints.md#post-apiaccounttoken) |
| Проверить организацию | [`GET /api/integrations/Organizations/Check`](reference/endpoints.md#get-apiintegrationsorganizationscheck) |
| Создать организацию или получить доступ | [`POST /api/integrations/Organizations/Apply`](reference/endpoints.md#post-apiintegrationsorganizationsapply) |
| Создать или обновить заявку | [`POST /api/integrations/Bids/Apply`](reference/endpoints.md#post-apiintegrationsbidsapply) |
| Получить собственные заявки | [`GET /api/integrations/Bids/GetList`](reference/endpoints.md#get-apiintegrationsbidsgetlist) |
| Получить связанные заявки перевозчиков | [`GET /api/integrations/Bids/GetCurrentList`](reference/endpoints.md#get-apiintegrationsbidsgetcurrentlist) |
| Получить карточку заявки | [`GET /api/integrations/Bids/Get`](reference/endpoints.md#get-apiintegrationsbidsget) |
| Получить события | [`GET /api/integrations/Bids/GetEvents`](reference/endpoints.md#get-apiintegrationsbidsgetevents) |
| Получить плановый маршрут | [`GET /api/integrations/Bids/GetPlannedRoute`](reference/endpoints.md#get-apiintegrationsbidsgetplannedroute) |
| Получить фактический маршрут | [`GET /api/integrations/Bids/GetActualRoute`](reference/endpoints.md#get-apiintegrationsbidsgetactualroute) |
| Получить сообщения и файлы | [`GET /api/integrations/Bids/GetDriverMessages`](reference/endpoints.md#get-apiintegrationsbidsgetdrivermessages) |

## OData-параметры

Списковые методы поддерживают `$filter`, `$orderby`, `$top`, `$skip`, `$count`, `$select` и `$expand`. Общее количество записей передаётся в заголовке `X-MetaCount`.

Для инкрементальной синхронизации используйте стабильную сортировку:

```http
GET <baseUrl>/api/integrations/Bids/GetCurrentList?$filter=updatedAt%20gt%202026-10-06T08:00:00Z&$orderby=updatedAt,id&$top=100
```

## Форматы

| Данные | Формат |
|---|---|
| Ответные дата и время | ISO 8601 с UTC-смещением |
| Дата без времени | `YYYY-MM-DD`, без часового пояса |
| Плановые даты точек | Локальное время координат точки без UTC-смещения |
| Координаты | `[longitude, latitude]`, WGS 84, градусы |
| Расстояние | Метры |
| Продолжительность | Секунды |
| Enum | Строковое имя значения |

`updatedAt` представляет абсолютный момент времени. В OData-фильтрах рекомендуется приводить курсор к UTC и передавать его с суффиксом `Z`; значение со смещением и эквивалентное значение в UTC сравниваются одинаково.

## Ошибки

Бизнес-ошибки синхронных команд могут возвращаться как обычный текст с HTTP `400`, а не как JSON. Не повторяйте `400` и `403` без изменения запроса или прав доступа. При чтении `404` означает, что заявка не существует либо недоступна текущему партнёру; различить эти случаи по HTTP-статусу нельзя.

Полный контракт каждого метода приведён в [справочнике API](reference/endpoints.md).
