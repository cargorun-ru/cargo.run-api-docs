import fs from "node:fs";
import path from "node:path";

const source = process.argv[2];
const target = process.argv[3];

if (!source || !target) {
  throw new Error("Usage: node generate-partner-models.mjs <openapi.json> <models.md>");
}

const document = JSON.parse(fs.readFileSync(source, "utf8"));
const schemas = document.components?.schemas ?? {};

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
  "QueuedApiTaskObjectResultModel",
  "OrganizationIntegrationLeadListModel",
  "MarkOrganizationIntegrationLeadPaidContext",
  "ConfirmDriverAuthorizationContext"
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
  .replaceAll("площадка", "партнёрский сервис");

const escapeCell = (value) => normalizeTerms(value)
  .replaceAll("|", "\\|")
  .replaceAll("\n", "<br>");

const refName = (schema) => schema?.$ref?.split("/").at(-1);
const nullable = (schema) => {
  const types = Array.isArray(schema?.type) ? schema.type : [schema?.type];
  return types.includes("null") || schema?.oneOf?.some((x) => x.type === "null") === true;
};

const baseType = (schema, inlineName) => {
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
    return `${baseType(schema.items, `${inlineName}Item`)}[]`;
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
  if (Object.keys(properties).length === 0) {
    lines.push("Схема не содержит именованных полей.", "");
    return lines;
  }

  lines.push("| Поле | Тип | Обязательно | `null` | Ограничения | Описание |", "|---|---|---:|---:|---|---|");
  for (const [propertyName, propertySchema] of Object.entries(properties)) {
    const inlineName = `${name}.${propertyName}`;
    captureInline(propertySchema, inlineName);
    lines.push(`| \`${propertyName}\` | ${escapeCell(baseType(propertySchema, inlineName))} | ${required.has(propertyName) ? "Да" : "Нет"} | ${nullable(propertySchema) ? "Да" : "Нет"} | ${escapeCell(constraints(propertySchema))} | ${escapeCell(propertySchema.description)} |`);
  }
  lines.push("");
  return lines;
};

const output = [
  "# Модели запросов и ответов",
  "",
  "Колонка «Обязательно» учитывает правила партнёрского API. Для создания заявки необходимо передать `bid`, `inn`, автомобиль, водителя, минимум две точки и `planEnterDate` каждой точки. Поле `IntegrationBidEditModel.id` при создании можно не передавать.",
  "",
  "## Результаты операций",
  "",
  "### `ClientCredentialsTokenResponse`",
  "",
  "| Поле | Тип | Обязательно | `null` | Описание |",
  "|---|---|---:|---:|---|",
  "| `accessToken` | `AccessToken` | Да | Нет | Токен доступа и срок действия |",
  "| `refreshToken` | `string` | Нет | Да | Для M2M не заполняется |",
  "| `twoFactorToken` | `object` | Нет | Да | Для M2M не заполняется |",
  "| `currentUser` | `object` | Нет | Да | Для M2M не заполняется |",
  "| `requiresTwoFactor` | `boolean` | Да | Нет | Для M2M всегда `false` |",
  "| `twoFactorProvider` | `string` | Нет | Да | Для M2M не заполняется |",
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
fs.writeFileSync(target, `${output.join("\n")}\n`, "utf8");
