import fs from "node:fs";
import path from "node:path";

const docsRoot = process.argv[2] ?? "docs";
const target = process.argv[3] ?? path.join(docsRoot, "llms-full.txt");
const sectionRoot = path.join(docsRoot, "products", "partner-integrations");

const files = [
  "index.md",
  "getting-started.md",
  "auth.md",
  "access.md",
  "scenarios/create-update-bid.md",
  "scenarios/receive-bids.md",
  "scenarios/track-execution.md",
  "scenarios/recovery.md",
  "sync-api.md",
  "async-queue.md",
  "webhooks.md",
  "reliability.md",
  "reference/endpoints.md",
  "reference/errors-and-limits.md",
  "examples.md",
  "launch-checklist.md",
  "for-ai.md"
];

const output = [
  "# CARGO.RUN — интеграция с партнёрскими сервисами",
  "",
  "> Полная машиночитаемая версия документации. Источник: https://cargorun-ru.github.io/cargo.run-api-docs/products/partner-integrations/",
  ""
];

for (const file of files) {
  const source = path.join(sectionRoot, file);
  const content = fs.readFileSync(source, "utf8")
    .replace(/--8<-- \"([^\"]+)\"/g, (_, includedFile) =>
      fs.readFileSync(includedFile.startsWith(`${docsRoot}/`) ? includedFile : path.join(docsRoot, includedFile), "utf8").trim()
    )
    .trim();
  output.push("---", "", `Source: products/partner-integrations/${file}`, "", content, "");
}

fs.writeFileSync(target, `${output.join("\n").trimEnd()}\n`, "utf8");
