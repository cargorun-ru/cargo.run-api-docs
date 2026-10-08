import fs from "node:fs";
import path from "node:path";

const source = process.argv[2];
const target = process.argv[3];

if (!source || !target) {
  throw new Error("Usage: node generate-partner-models.mjs <openapi.json> <models.md>");
}

const document = JSON.parse(fs.readFileSync(source, "utf8"));
const schemas = document.components?.schemas ?? {};

// OpenAPI describes the reusable CLR models, while the partner contract also
// contains operation-specific validation rules and string enum serialization.
const requiredOverrides = new Map([
  ["ClientCredentialsTokenModel", new Set(["grantType", "clientId", "clientSecret"])],
  ["ApplyBidFromIntegrationContext", new Set(["bid", "inn"])],
  ["IntegrationBidEditModel", new Set(["bidPoints", "cargos", "car", "driver"])],
  ["IntegrationBidPointModel", new Set(["planEnterDate", "geozone"])],
  ["IntegrationBidPointAddressModel", new Set(["location", "address"])],
  ["PointEditModel", new Set(["coordinates"])],
  ["Point", new Set(["coordinates"])],
  ["CargoModel", new Set(["name"])],
  ["IntegrationBidDetailsModel.bid.cargos", new Set(["name"])]
]);

const optionalOverrides = new Map([
  ["IntegrationBidEditModel", new Set(["id"])]
]);

const typeOverrides = new Map(Object.entries({
  "IntegrationBidDetailsModel.bid.status": "BidStatus",
  "IntegrationBidDetailsModel.bid.bidPointLoadUnloadStatus": "BidPointLoadUnloadStatus",
  "IntegrationBidDetailsModel.bid.paymentPeriodType": "PaymentPeriodType",
  "IntegrationBidDetailsModel.bid.invoiceTriggerType": "InvoiceTriggerType",
  "IntegrationBidDetailsModel.bid.sourceType": "SourceType",
  "IntegrationBidDetailsModel.events.type": "IntegrationBidEventType",
  "IntegrationBidDetailsModel.bid.bidPoints.type": "BidPointType",
  "IntegrationBidDetailsModel.bid.cargos.unitOfMeasure": "UnitOfMeasure",
  "IntegrationBidDetailsModel.bid.payment.documentsTrackingStatus": "DocumentsTrackingStatus",
  "IntegrationBidDetailsModel.bid.payment.paymentStatus": "BidPaymentStatus",
  "IntegrationBidDetailsModel.plannedRoute.routeOptions.country": "RouterCountryType",
  "IntegrationBidDetailsModel.plannedRoute.routeOptions.routerProfile": "RouterProfile",
  "IntegrationBidDetailsModel.bid.bidPoints.geozone.type": "MapObjectType",
  "IntegrationBidDetailsModel.plannedRoute.routeOptions.avoidTollRoadFlags": "AvoidTollRoadFlags",
  "IntegrationBidDetailsModel.plannedRoute.routeOptions.avoidSpecialRoadFlags": "AvoidSpecialRoadFlags"
}));

const descriptionOverrides = new Map(Object.entries({
  "ClientCredentialsTokenModel.grantType": "Тип выдачи токена. Передавайте фиксированное значение `client_credentials`.",
  "ClientCredentialsTokenModel.clientId": "Идентификатор интеграционного клиента, выданный CARGO.RUN.",
  "ClientCredentialsTokenModel.clientSecret": "Секрет интеграционного клиента, выданный CARGO.RUN.",
  "IntegrationBidEditModel.bidPoints": "Точки маршрута: минимум одна точка погрузки и одна точка выгрузки. CARGO.RUN сортирует точки по `planEnterDate`.",
  "IntegrationBidEditModel.id": "Внутренний идентификатор заявки CARGO.RUN. Не указывается при создании. При обновлении используется, если поиск по `externalId` не нашёл заявку; найденная по `externalId` заявка имеет приоритет.",
  "IntegrationBidEditModel.cargos": "Грузы. Передайте как минимум один груз; у каждого груза обязательно поле `name`.",
  "IntegrationBidEditModel.trailer": "Прицеп. Необязателен; если объект передан, поле `number` обязательно.",
  "ApplyBidFromIntegrationContext.inn": "ИНН организации перевозчика: 10 цифр для организации или 12 цифр для ИП. Обязателен при синхронном и асинхронном создании или обновлении заявки.",
  "IntegrationBidListModel.externalId": "В `Bids/GetList` — идентификатор, переданный партнёром при создании заявки; в `Bids/GetCurrentList` — идентификатор заказа, указанный перевозчиком для платформы партнёра.",
  "IntegrationBidListModel.updatedAt": "Дата последнего изменения заявки. Для курсорной выборки используйте `$filter=updatedAt gt {курсор}&$orderby=updatedAt,id` и небольшое перекрытие интервалов.",
  "BidForExternalSyncModel.sourceType": "Источник заявки в CARGO.RUN. Поле возвращается сервером; партнёр его не задаёт.",
  "IntegrationBidDetailsModel.bid.sourceType": "Источник заявки в CARGO.RUN. Поле возвращается сервером; партнёр его не задаёт.",
  "IntegrationBidDetailsModel.driverMessages": "Сокращённые сообщения водителя. Поля `type` и `flags` доступны только в синхронной модели `ChatMessageGetModel`.",
  "ChatMessageGetModel.fileId": "Устаревшее поле. В новой интеграции используйте `files[]`.",
  "ChatMessageGetModel.fileIds": "Устаревшее поле. В новой интеграции используйте `files[]`.",
  "ChatMessageGetModel.file": "Устаревшее поле. В новой интеграции используйте `files[]`.",
  "ChatMessageGetModel.files": "Авторитетный список файлов сообщения для новой интеграции.",
  "QueuedApiTaskObjectAddModel.body": "Тело объекта. Обязательно для `action=Write`; для `Read` и `ReadQuery` не передаётся.",
  "QueuedApiTaskObjectAddModel.status": "Диагностический статус. В документированных партнёрских командах не передаётся.",
  "QueuedApiTaskObjectAddModel.sourceType": "Служебное поле. В документированных партнёрских командах не передаётся.",
  "QueuedApiTaskObjectResultModel.id": "Внутренний идентификатор обработанного объекта CARGO.RUN.",
  "PointEditModel.coordinates": "Координаты точки в формате `[долгота, широта]`, WGS 84.",
  "Point.coordinates": "Координаты точки в формате `[долгота, широта]`, WGS 84.",
  "Point.type": "Тип геометрии (`Point`). Поле возвращается сервером и не передаётся в `PointEditModel`.",
  "IntegrationBidDetailsModel.bid.bidPoints.geozone.location.type": "Тип геометрии (`Point`). Поле возвращается сервером.",
  "TraveledRouteFixedAtPartModel.coordinate": "Координата фактического маршрута в формате `[долгота, широта]`, WGS 84.",
  "PropertyNameValueJsonObject.value": "Строковое значение дополнительного поля. Числа, даты и boolean передаются в строковом представлении.",
  "IntegrationBidDetailsModel.bid.extendedProperties.value": "Строковое значение дополнительного поля. Числа, даты и boolean передаются в строковом представлении.",
  "IntegrationBidDetailsModel.bid.bidPoints.extendedProperties.value": "Строковое значение дополнительного поля. Числа, даты и boolean передаются в строковом представлении.",
  "IntegrationBidDetailsModel.bid.cargos.extendedProperties.value": "Строковое значение дополнительного поля. Числа, даты и boolean передаются в строковом представлении.",
  "QueuedApiTaskObjectAddModel.version": "Версия объекта. Если указано `id`, а `version` не передан, проверка версии не выполняется.",
  "QueuedApiTaskObjectAddModel.query": "OData-запрос для `ReadQuery`. При его использовании поля `id`, `version` и `key` не передаются.",
  "QueuedApiTaskObjectResultModel.version": "Версия объекта. Если указано `id`, а `version` отсутствует, проверка версии не выполнялась.",
  "QueuedApiTaskObjectResultModel.query": "OData-запрос задачи `ReadQuery`; поля `id`, `version` и `key` для такой задачи отсутствуют."
}));

const constraintOverrides = new Map(Object.entries({
  "ClientCredentialsTokenModel.grantType": "значение: `client_credentials`",
  "IntegrationBidEditModel.bidPoints": "min items: `2`",
  "IntegrationBidEditModel.externalId": "max length: `72`",
  "IntegrationBidEditModel.comment": "max length: `4096`",
  "IntegrationBidEditModel.clientBidNumber": "max length: `256`",
  "IntegrationBidEditModel.price": "min: `0`; max: `9999999999`",
  "IntegrationBidPointModel.externalId": "max length: `72`",
  "IntegrationBidPointModel.comment": "max length: `8092`",
  "TraveledRouteFixedAtPartModel.coordinate": "min items: `2`; max items: `2`"
}));

const roots = [
  "ClientCredentialsTokenModel",
  "IntegrationOrganizationCheckModel",
  "CreateIntegrationOrganizationContext",
  "ApplyBidFromIntegrationContext",
  "IntegrationBidEditModel",
  "IntegrationBidListModel",
  "BidForExternalSyncModel",
  "IntegrationBidDetailsModel",
  "IntegrationBidEventModel",
  "RouteSimpleModel",
  "CarRouteForExternalModel",
  "ChatMessageGetModel",
  "QueuedApiTaskCommandsCollectionModel",
  "QueuedApiTaskAddCommandsModel",
  "QueuedApiTaskObjectAddModel",
  "EnqueueApiTasksResponseModel",
  "EnqueuedApiTaskResponseModel",
  "QueuedApiTaskGetResultsModel",
  "QueuedApiTaskObjectResultModel"
].filter((name) => schemas[name]);

const referenced = new Set(roots);
const visitRefs = (value) => {
  if (!value || typeof value !== "object") return;
  if (typeof value.$ref === "string") {
    const name = value.$ref.split("/").at(-1);
    if (schemas[name] && !referenced.has(name)) {
      referenced.add(name);
      visitRefs(schemas[name]);
    }
  }
  for (const child of Object.values(value)) visitRefs(child);
};
for (const name of roots) visitRefs(schemas[name]);

const normalizeTerms = (value) => String(value ?? "—")
  .replaceAll("внешними площадками", "партнёрскими сервисами")
  .replaceAll("внешней площадки", "партнёрского сервиса")
  .replaceAll("внешней площадке", "партнёрскому сервису")
  .replaceAll("внешней площадкой", "партнёрским сервисом")
  .replaceAll("внешнюю площадку", "партнёрский сервис")
  .replaceAll("внешняя площадка", "партнёрский сервис")
  .replaceAll("площадки", "партнёрского сервиса")
  .replaceAll("площадке", "партнёрскому сервису")
  .replaceAll("площадка", "партнёрский сервис")
  .replaceAll("внешним партнёрский сервисм", "партнёрским сервисам")
  .replaceAll("Текущая партнёрский сервис", "Текущий партнёрский сервис")
  .replaceAll("на партнёрскому сервису", "в партнёрском сервисе")
  .replaceAll("Расчетная дата вьезда", "Расчётная дата въезда")
  .replaceAll("Обьем", "Объём")
  .replaceAll("Оставшиеся количество объектов", "Оставшееся количество объектов")
  .replaceAll("Модель задания с указаным типом", "Модель задания с указанным типом")
  .replaceAll("Average value (optional)", "Среднее значение")
  .replaceAll("Fixed at date", "Дата и время фиксации")
  .replaceAll("Bid point model for a view", "Точка маршрута")
  .replaceAll("Bid statuses", "Статус заявки")
  .replaceAll("Internal entity type", "Тип внутренней сущности")
  .replaceAll("Task object result status", "Статус результата обработки объекта")
  .replaceAll("Queued api task status", "Статус очереди заданий")
  .replaceAll("Activity sign", "Признак активности")
  .replaceAll("Activity status", "Сведения о неактивности")
  .replaceAll("Mechanic", "Механик")
  .replaceAll("Is deleted?", "Признак удаления")
  .replaceAll("IsVatTop", "isVatTop")
  .replaceAll("Values", "Значения");

const escapeCell = (value) => normalizeTerms(value)
  .replaceAll("|", "\\|")
  .replaceAll("\n", "<br>");

const refName = (schema) => schema?.$ref?.split("/").at(-1);
const nullable = (schema) => {
  const types = Array.isArray(schema?.type) ? schema.type : [schema?.type];
  return types.includes("null") || schema?.oneOf?.some((x) => x.type === "null") === true;
};

const baseType = (schema, inlineName) => {
  if (typeOverrides.has(inlineName)) return `\`${typeOverrides.get(inlineName)}\``;
  if (!schema) return "не указан";
  const directRef = refName(schema);
  if (directRef) return `\`${directRef}\``;
  const nonNullOneOf = schema.oneOf?.filter((x) => x.type !== "null") ?? [];
  if (nonNullOneOf.length === 1) return baseType(nonNullOneOf[0], inlineName);
  const types = (Array.isArray(schema.type) ? schema.type : [schema.type]).filter(Boolean).filter((x) => x !== "null");
  const type = types.find((x) => x !== "string") ?? types[0];
  if (type === "array") {
    const itemRef = refName(schema.items);
    if (itemRef) return `\`${itemRef}[]\``;
    if (schema.items?.properties) return `\`${inlineName}[]\``;
    const itemType = baseType(schema.items, `${inlineName}Item`);
    return itemType.startsWith("`") && itemType.endsWith("`")
      ? `\`${itemType.slice(1, -1)}[]\``
      : `${itemType}[]`;
  }
  if (type === "object" || schema.properties) return `\`${inlineName}\``;
  if (schema.format) return `\`${schema.format}\``;
  return `\`${type ?? "any"}\``;
};

const constraints = (schema) => {
  const result = [];
  if (schema.default !== undefined) result.push(`по умолчанию: \`${schema.default}\``);
  if (schema.minimum !== undefined) result.push(`min: \`${schema.minimum}\``);
  if (schema.maximum !== undefined) result.push(`max: \`${schema.maximum}\``);
  if (schema.minLength !== undefined) result.push(`min length: \`${schema.minLength}\``);
  if (schema.maxLength !== undefined) result.push(`max length: \`${schema.maxLength}\``);
  if (schema.minItems !== undefined) result.push(`min items: \`${schema.minItems}\``);
  if (schema.maxItems !== undefined) result.push(`max items: \`${schema.maxItems}\``);
  if (schema.enum) result.push(`значения: ${schema.enum.map((x) => `\`${x}\``).join(", ")}`);
  return result.join("; ") || "—";
};

const inlineSchemas = new Map();
const captureInline = (schema, name) => {
  const candidate = schema?.items?.properties ? schema.items : schema;
  if (candidate?.properties && !refName(candidate)) inlineSchemas.set(name, candidate);
};

const renderSchema = (name, schema, level = 2) => {
  const title = `${"#".repeat(level)} \`${name}\``;
  const lines = [title, ""];
  if (schema.description) lines.push(normalizeTerms(schema.description.trim()), "");

  const properties = schema.properties ?? {};
  const required = new Set(schema.required ?? []);
  for (const field of requiredOverrides.get(name) ?? []) required.add(field);
  for (const field of optionalOverrides.get(name) ?? []) required.delete(field);
  if (Object.keys(properties).length === 0) {
    lines.push("Схема не содержит именованных полей.", "");
    return lines;
  }

  lines.push("| Поле | Тип | Обязательно | `null` | Ограничения | Описание |", "|---|---|---:|---:|---|---|");
  for (const [propertyName, propertySchema] of Object.entries(properties)) {
    const inlineName = `${name}.${propertyName}`;
    captureInline(propertySchema, inlineName);
    const description = descriptionOverrides.get(inlineName) ?? propertySchema.description;
    const allowsNull = required.has(propertyName) && (requiredOverrides.get(name)?.has(propertyName) ?? false)
      ? false
      : nullable(propertySchema);
    const propertyConstraints = constraintOverrides.get(inlineName) ?? constraints(propertySchema);
    lines.push(`| \`${propertyName}\` | ${escapeCell(baseType(propertySchema, inlineName))} | ${required.has(propertyName) ? "Да" : "Нет"} | ${allowsNull ? "Да" : "Нет"} | ${escapeCell(propertyConstraints)} | ${escapeCell(description)} |`);
  }
  lines.push("");
  return lines;
};

const output = [
  "# Модели запросов и ответов",
  "",
  "Колонка «Обязательно» отражает контракт партнёрского API с учётом бизнес-валидации конкретных операций. Все enum в JSON передаются строковыми значениями из раздела «Возможные значения полей».",
  "",
  "## Результаты операций",
  "",
  "### `ClientCredentialsTokenResponse`",
  "",
  "| Поле | Тип | Обязательно | `null` | Описание |",
  "|---|---|---:|---:|---|",
  "| `accessToken` | `AccessToken` | Да | Нет | Токен доступа и срок действия |",
  "",
  "### `AccessToken`",
  "",
  "| Поле | Тип | Обязательно | `null` | Описание |",
  "|---|---|---:|---:|---|",
  "| `token` | `string` | Да | Нет | JWT для заголовка `Authorization` |",
  "| `expiresIn` | `int32` | Да | Нет | Срок действия в секундах |",
  "",
  "### `ApplyBidResultModel`",
  "",
  "| Поле | Тип | Обязательно | `null` | Описание |",
  "|---|---|---:|---:|---|",
  "| `id` | `int64` | Да | Нет | ID созданной или обновлённой заявки CARGO.RUN |",
  "| `isRouteBuilt` | `boolean` | Да | Нет | Маршрут успешно построен |",
  "",
  "### `OrganizationApplyResult`",
  "",
  "| Поле | Тип | Обязательно | `null` | Описание |",
  "|---|---|---:|---:|---|",
  "| `id` | `int64` | Да | Нет | ID созданной или найденной организации |",
  "",
  "### `EnqueueApiTasksResponseModel`",
  "",
  "| Поле | Тип | Обязательно | `null` | Описание |",
  "|---|---|---:|---:|---|",
  "| `latencyMsec` | `int32` | Да | Нет | Оценка задержки очереди в миллисекундах |",
  "| `enqueuedInMsec` | `int32` | Да | Нет | Время постановки команд в миллисекундах |",
  "| `commands` | `EnqueuedApiTaskResponseModel[]` | Да | Нет | Результат постановки каждой команды |",
  "",
  "### `EnqueuedApiTaskResponseModel`",
  "",
  "| Поле | Тип | Обязательно | `null` | Описание |",
  "|---|---|---:|---:|---|",
  "| `id` | `int64` | Нет | Да | ID задачи; отсутствует, если команда не поставлена |",
  "| `action` | `QueuedApiTaskAction` | Да | Нет | Действие задачи |",
  "| `status` | `QueuedApiTaskEnqueueStatus` | Да | Нет | Результат постановки |",
  "| `readyInMsec` | `int64` | Да | Нет | Ориентировочная задержка до готовности |",
  "| `message` | `string` | Нет | Да | Причина отказа в постановке |",
  "",
  "### `QueuedApiTaskEnqueueStatus`",
  "",
  "Возможные результаты постановки команды перечислены в разделе «Возможные значения полей».",
  "",
  "### `QueuedApiTaskCallbackPayload`",
  "",
  "| Поле | Тип | Обязательно | `null` | Описание |",
  "|---|---|---:|---:|---|",
  "| `eventId` | `uuid` | Да | Нет | Уникальный ID события для дедупликации |",
  "| `taskId` | `int64` | Да | Нет | ID задачи |",
  "| `action` | `QueuedApiTaskAction` | Да | Нет | Действие задачи |",
  "| `status` | `QueuedApiTaskStatus` | Да | Нет | Статус задачи |",
  "| `origin` | `QueuedApiTaskOrigin` | Да | Нет | Запрос партнёра или подписка |",
  "| `completedAt` | `date-time` | Нет | Да | Время завершения |",
  "| `attemptCount` | `int32` | Да | Нет | Число попыток обработки задачи |",
  "| `maxAttemptCount` | `int32` | Да | Нет | Максимум попыток обработки |",
  "| `message` | `string` | Нет | Да | Сообщение задачи |",
  "| `objects` | `QueuedApiTaskObjectResultModel[]` | Нет | Да | Результаты объектов |",
  "",
  "## Основные модели запросов и ответов",
  ""
];

for (const name of roots) output.push(...renderSchema(name, schemas[name], 3));

output.push("## Связанные модели", "");
for (const name of [...referenced].filter((name) => !roots.includes(name)).sort()) {
  output.push(...renderSchema(name, schemas[name], 3));
}

output.push("## Вложенные модели", "");
const renderedInline = new Set();
while (true) {
  const next = [...inlineSchemas.entries()].find(([name]) => !renderedInline.has(name));
  if (!next) break;
  const [name, schema] = next;
  renderedInline.add(name);
  output.push(...renderSchema(name, schema, 3));
}

fs.mkdirSync(path.dirname(target), { recursive: true });
fs.writeFileSync(target, `${output.join("\n").trimEnd()}\n`, "utf8");
