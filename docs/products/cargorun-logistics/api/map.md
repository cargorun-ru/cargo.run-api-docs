# Карта и геокодирование API

Методы карты преобразуют текстовый адрес или координаты в структурированные
данные, которые можно передать в `bidPoints[].geozone` при [создании заявки](./bids.md#truckingbids-apply).

Во всех запросах требуется заголовок `Authorization: Bearer <access_token>`.

## 1. Поиск по текстовому адресу

```http
POST /api/map/getmixedaddresses
Content-Type: application/json
```

```json
{
  "address": "Москва, Тверская улица, 1",
  "count": 5
}
```

| Поле | Тип | Обязательность | Описание |
|---|---|---|---|
| `address` | `string` | Да | Полный или неполный адрес |
| `count` | `int?` | Нет | Максимальное число вариантов |

Метод объединяет результаты доступных геокодеров. Источник отдельного варианта
указан в `geocoderSourceType`. Внешняя система должна выбрать подходящий вариант, а не
автоматически брать первый при неоднозначном поиске.

### Сокращённый пример ответа

Значения в примере иллюстративны; фактический ответ зависит от геокодера.

```json
{
  "suggestions": [
    {
      "displayName": "Россия, Москва, Тверская улица, 1",
      "location": {
        "type": "Point",
        "coordinates": [37.617, 55.757]
      },
      "address": {
        "city": "Москва",
        "village": null,
        "state": "Москва",
        "county": null,
        "street": "Тверская улица",
        "houseNumber": "1",
        "federalDistrict": "Центральный федеральный округ"
      },
      "geocoderSourceType": "Yandex",
      "locationId": null
    }
  ]
}
```

## 2. Поиск адреса по координатам

```http
POST /api/map/getaddress
Content-Type: application/json
```

```json
{
  "latitude": 55.757,
  "longitude": 37.617
}
```

| Поле | Тип | Описание |
|---|---|---|
| `latitude` | `double` | Широта |
| `longitude` | `double` | Долгота |

Метод возвращает один `AddressViewModel` с той же структурой элемента, что и в
`suggestions[]`: `displayName`, `location`, `address`, `geocoderSourceType` и `locationId`.

## 3. Заполнение точки заявки

Если во внешней системе уже есть координаты и все структурные части адреса, их можно
сразу передать в `geozone`. Иначе сначала вызовите метод карты и используйте его ответ:

| Ответ карты | `bidPoints[].geozone` |
|---|---|
| `displayName` | `address` |
| `location` | `location` |
| `address.city` | `city` |
| `address.village` | `village` |
| `address.state` | `state` |
| `address.county` | `county` |
| `address.street` | `street` |
| `address.houseNumber` | `houseNumber` |
| `address.federalDistrict` | `federalDistrict` |

```json
{
  "geozone": {
    "id": 0,
    "location": {
      "type": "Point",
      "coordinates": [37.617, 55.757]
    },
    "address": "Россия, Москва, Тверская улица, 1",
    "city": "Москва",
    "state": "Москва",
    "street": "Тверская улица",
    "houseNumber": "1",
    "federalDistrict": "Центральный федеральный округ",
    "radius": 2000,
    "type": "BidPoint"
  }
}
```

!!! warning
    В `location.coordinates` используется порядок GeoJSON: **[долгота, широта]**.
    В запросе `getaddress` эти же значения передаются именованными полями
    `longitude` и `latitude`.
