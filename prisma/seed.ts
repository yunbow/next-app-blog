import { PrismaClient } from "@prisma/client";
import { seedDev } from "./seeds/dev";
import { seedProd } from "./seeds/prod";

const prisma = new PrismaClient();

const VALID_MODES = ["dev", "prod"] as const;
type SeedMode = (typeof VALID_MODES)[number];

/**
 * Mode 解決順 (上が優先):
 *   1. CLI 引数: `tsx prisma/seed.ts dev|prod`
 *   2. 環境変数: SEED_MODE=dev|prod
 *   3. NODE_ENV=production なら "prod"、それ以外は "dev"
 *
 * NODE_ENV=production で dev seed を走らせるのは事故の元なので明示的に拒否する。
 */
function resolveMode(): SeedMode {
  const arg = process.argv[2];
  const envValue = process.env.SEED_MODE;
  const candidate = arg ?? envValue;

  if (candidate) {
    if (!VALID_MODES.includes(candidate as SeedMode)) {
      throw new Error(
        `Invalid seed mode: "${candidate}". Expected one of: ${VALID_MODES.join(", ")}`
      );
    }
    return candidate as SeedMode;
  }

  return process.env.NODE_ENV === "production" ? "prod" : "dev";
}

async function main() {
  const mode = resolveMode();

  if (process.env.NODE_ENV === "production" && mode === "dev") {
    throw new Error(
      "Refusing to run dev seed when NODE_ENV=production. " +
        "If this is intentional, override NODE_ENV explicitly."
    );
  }

  console.log(`Start seeding (mode=${mode})...`);
  if (mode === "prod") {
    await seedProd(prisma);
  } else {
    await seedDev(prisma);
  }
  console.log("Seeding finished.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
