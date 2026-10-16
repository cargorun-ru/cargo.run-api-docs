import fs from "node:fs";
import path from "node:path";

const docsRoot = process.argv[2] ?? "docs";
const sectionRoot = path.join(docsRoot, "products", "cargorun-loads");
const baseUrl = "https://cargorun-ru.github.io/cargo.run-api-docs/products/cargorun-loads";
const files = [
  "index.md", "introduction.md", "minimal-requirements.md", "formats.md", "statuses.md", "glossary.md",
  "integration/overview.md", "integration/scenario-cr-to-external.md", "integration/scenario-external-to-cr.md",
  "integration/scenario-forwarder-tracking.md", "integration/scenario-transporter.md", "integration/order-responses.md",
  "integration/sync.md", "integration/examples-1c.md", "api/overview.md", "api/errors-and-limits.md",
  "api/auth.md", "api/orders.md", "api/order-lifecycle.md", "api/order-responses.md", "api/reports.md",
  "api/counterparties.md", "api/transporter.md", "api/directories.md", "api/map.md", "for-ai.md"
];

const descriptions = {
  "index.md": "обзор и навигация", "introduction.md": "назначение и архитектура",
  "minimal-requirements.md": "минимальные поля заказа", "formats.md": "форматы значений",
  "statuses.md": "статусы", "glossary.md": "термины", "integration/overview.md": "потоки данных",
  "integration/scenario-cr-to-external.md": "получение заказов из CARGO.RUN",
  "integration/scenario-external-to-cr.md": "создание заказов из внешней системы",
  "integration/scenario-forwarder-tracking.md": "GPS-отслеживание перевозки экспедитором",
  "integration/scenario-transporter.md": "интеграция перевозчика",
  "integration/order-responses.md": "работа с откликами", "integration/sync.md": "синхронизация",
  "integration/examples-1c.md": "примеры для 1С", "api/overview.md": "общие правила API",
  "api/errors-and-limits.md": "ошибки и ограничения", "api/auth.md": "авторизация",
  "api/orders.md": "заказы", "api/order-lifecycle.md": "жизненный цикл заказа",
  "api/order-responses.md": "отклики и ручное назначение", "api/reports.md": "отчеты",
  "api/counterparties.md": "контрагенты", "api/transporter.md": "API перевозчика",
  "api/directories.md": "справочники", "api/map.md": "геокодирование и маршруты",
  "for-ai.md": "правила для LLM и ИИ-агентов"
};

const index = ["# CARGO.RUN Загрузки", "", "> Машиночитаемый индекс документации для LLM и ИИ-агентов.", ""];
for (const file of files) {
  const url = file === "index.md" ? `${baseUrl}/` : `${baseUrl}/${file.replace(/\.md$/, "/")}`;
  index.push(`- [${file}](${url}): ${descriptions[file]}.`);
}
fs.writeFileSync(path.join(docsRoot, "cargorun-loads-llms.txt"), `${index.join("\n")}\n`, "utf8");

const full = ["# CARGO.RUN Загрузки", "", `> Полная машиночитаемая версия. Источник: ${baseUrl}/`, ""];
for (const file of files) {
  const content = fs.readFileSync(path.join(sectionRoot, file), "utf8").replace(/[ \t]+$/gm, "").trim();
  full.push("---", "", `Source: products/cargorun-loads/${file}`, "", content, "");
}
fs.writeFileSync(path.join(docsRoot, "cargorun-loads-llms-full.txt"), `${full.join("\n").trimEnd()}\n`, "utf8");
