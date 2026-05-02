import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, unlinkSync } from "node:fs";
import { dirname, join } from "node:path";
import { DatabaseSync } from "node:sqlite";

const dbPath = join("prisma", "dev.db");
const diff = spawnSync(
  "npx",
  [
    "prisma",
    "migrate",
    "diff",
    "--from-empty",
    "--to-schema-datamodel",
    "prisma/schema.prisma",
    "--script",
  ],
  {
    encoding: "utf8",
    shell: true,
  },
);

if (diff.status !== 0) {
  process.stdout.write(diff.stdout);
  process.stderr.write(diff.stderr);
  process.exit(diff.status ?? 1);
}

mkdirSync(dirname(dbPath), { recursive: true });

if (existsSync(dbPath)) {
  unlinkSync(dbPath);
}

const db = new DatabaseSync(dbPath);
db.exec("PRAGMA foreign_keys = ON;");
db.exec(diff.stdout);
db.close();

console.log(`Created ${dbPath}`);
