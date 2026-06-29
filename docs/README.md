# CARGO.RUN Documentation Hub

Добро пожаловать в документацию CARGO.RUN. Это центральный сборник всех материалов для интеграции, разработки и использования продуктов CARGO.RUN.

---

## 📚 Доступные продукты

### CARGO.RUN Logistics
Полная документация по интеграции с системой управления перевозками CARGO.RUN Logistics через REST API.

**Что внутри:**
- Вводные материалы (введение, форматы данных, статусы)
- Сценарии интеграции с внешними системами (1С, ERP, WMS)
- Полный справочник методов API
- Примеры кода и интеграции

**Начните с:** [CARGO.RUN Logistics Documentation](./products/cargorun-logistics/index.md)

---

## 🚀 Быстрый старт

Если вы в первый раз работаете с нашим API:

1. **Прочитайте введение**  
   Поймите архитектуру API и основные концепции  
   [Введение](./products/cargorun-logistics/introduction.md)

2. **Ознакомьтесь с форматами и требованиями**  
   Узнайте, как правильно форматировать запросы  
   [Форматы данных](./products/cargorun-logistics/formats.md) | [Минимальные требования](./products/cargorun-logistics/minimal-requirements.md)

3. **Выберите сценарий интеграции**  
   - [Заявка создается в CARGO.RUN](./products/cargorun-logistics/integration/scenario-cr-to-external.md)
   - [Заявка создается во внешней системе](./products/cargorun-logistics/integration/scenario-external-to-cr.md)

4. **Получите примеры кода**  
   [Примеры для 1С и других систем](./products/cargorun-logistics/integration/examples-1c.md)

---

## 📖 Основные разделы

### Для интеграторов
- [Сценарии интеграции](./products/cargorun-logistics/integration/overview.md)
- [Синхронизация справочников](./products/cargorun-logistics/integration/sync.md)
- [Глоссарий терминов](./products/cargorun-logistics/glossary.md)

### Для разработчиков
- [Авторизация API](./products/cargorun-logistics/api/auth.md)
- [Обзор API](./products/cargorun-logistics/api/overview.md)
- [Справочник методов](./products/cargorun-logistics/api/):
  - [Заявки (Bids)](./products/cargorun-logistics/api/bids.md)
  - [Справочники](./products/cargorun-logistics/api/directories.md)
  - [Заказы (Distribution Bids)](./products/cargorun-logistics/api/distribution-bids.md)
  - [ЭТРН](./products/cargorun-logistics/api/etrn.md)
  - [Трекеры](./products/cargorun-logistics/api/trackers.md)
  - [Заправки](./products/cargorun-logistics/api/refueling-transactions.md)

---

## 🛠️ Инструменты и ресурсы

- **Swagger/OpenAPI** — полная спецификация API
- **Постман коллекция** — готовые примеры запросов
- **SDK** — библиотеки для популярных языков

---

## ❓ Часто задаваемые вопросы

**Где найти токен API?**  
Смотрите раздел [Авторизация](./products/cargorun-logistics/api/auth.md)

**Какие форматы данных поддерживаются?**  
[Форматы данных](./products/cargorun-logistics/formats.md)

**Как синхронизировать справочники?**  
[Синхронизация данных](./products/cargorun-logistics/integration/sync.md)

**Какие статусы может иметь заявка?**  
[Статусы](./products/cargorun-logistics/statuses.md)

---

## 📞 Поддержка

- Обратитесь в служу поддержки CARGO.RUN
- Оставьте вопрос в документации проекта
- Проверьте примеры в разделе интеграции

---

## 📝 Лицензия

Документация предоставляется в соответствии с условиями использования CARGO.RUN.

---

**Версия документации:** 1.0  
**Последнее обновление:** 2026-06-29
