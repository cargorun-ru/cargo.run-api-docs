import fs from "node:fs";
import path from "node:path";

const docsRoot = process.argv[2] ?? "docs";
const sectionRoot = path.join(docsRoot, "products", "cargorun-logistics");
const baseUrl = "https://cargorun-ru.github.io/cargo.run-api-docs/products/cargorun-logistics";
const files = [
  "index.md", "introduction.md", "minimal-requirements.md", "formats.md", "statuses.md", "glossary.md",
  "integration/overview.md", "integration/scenario-cr-to-external.md", "integration/scenario-external-to-cr.md",
  "integration/sync.md", "integration/async-sync-v2.md", "integration/examples-1c.md", "api/overview.md", "api/auth.md", "api/bids.md",
  "api/async-tasks.md",
  "api/distribution-bids.md", "api/counterparties.md", "api/directories.md", "api/custom-catalogs.md",
  "api/etrn.md", "api/refueling-transactions.md", "api/trackers.md", "for-ai.md"
];

const descriptions = {
  "index.md": "обзор и навигация", "introduction.md": "назначение, архитектура и базовый URL",
  "minimal-requirements.md": "обязательные поля", "formats.md": "форматы значений и ошибок",
  "statuses.md": "статусы сущностей", "glossary.md": "термины",
  "integration/overview.md": "потоки данных", "integration/scenario-cr-to-external.md": "получение заявок из CARGO.RUN",
  "integration/scenario-external-to-cr.md": "создание заявок из внешней системы", "integration/sync.md": "инкрементальная синхронизация",
  "integration/async-sync-v2.md": "асинхронная синхронизация заявок API 2.0",
  "integration/examples-1c.md": "пример для 1С", "api/overview.md": "общие правила API",
  "api/auth.md": "получение и обновление токена", "api/bids.md": "заявки",
  "api/async-tasks.md": "асинхронная очередь API 2.0",
  "api/distribution-bids.md": "заказы на распределение", "api/counterparties.md": "контрагенты",
  "api/directories.md": "справочники", "api/custom-catalogs.md": "пользовательские справочники",
  "api/etrn.md": "ЭТРН", "api/refueling-transactions.md": "транзакции заправок",
  "api/trackers.md": "трекеры", "for-ai.md": "правила для LLM и ИИ-агентов"
};

const index = ["# CARGO.RUN Логистика", "", "> Машиночитаемый индекс документации для LLM и ИИ-агентов.", ""];
for (const file of files) {
  const url = file === "index.md" ? `${baseUrl}/` : `${baseUrl}/${file.replace(/\.md$/, "/")}`;
  index.push(`- [${file}](${url}): ${descriptions[file]}.`);
}
fs.writeFileSync(path.join(docsRoot, "cargorun-logistics-llms.txt"), `${index.join("\n")}\n`, "utf8");

const full = ["# CARGO.RUN Логистика", "", `> Полная машиночитаемая версия. Источник: ${baseUrl}/`, ""];
for (const file of files) {
  const content = fs.readFileSync(path.join(sectionRoot, file), "utf8")
    .replace(/[ \t]+$/gm, "")
    .trim();
  full.push("---", "", `Source: products/cargorun-logistics/${file}`, "", content, "");
}
fs.writeFileSync(path.join(docsRoot, "cargorun-logistics-llms-full.txt"), `${full.join("\n").trimEnd()}\n`, "utf8");
