import { prisma } from "./db";

export function formatMoney(cents: number, currency = "PLN") {
  return new Intl.NumberFormat("pl-PL", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

export async function getPlans() {
  return prisma.plan.findMany({
    orderBy: [{ priceCents: "asc" }],
  });
}

export async function getPaths() {
  return prisma.path.findMany({
    orderBy: [{ sortOrder: "asc" }],
  });
}
