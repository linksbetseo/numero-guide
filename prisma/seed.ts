import { PrismaClient } from "@prisma/client";
import { hashPassword } from "../src/lib/password";

const prisma = new PrismaClient();

const plans = [
  {
    slug: "start",
    name: "Start",
    description: "Jedna ścieżka refleksji i 11 dni dostępu do prywatnego przewodnika.",
    priceCents: 21900,
    durationDays: 11,
    pathLimit: 1,
    highlighted: false,
  },
  {
    slug: "glebiej",
    name: "Głębiej",
    description: "Trzy ścieżki, miesiąc pracy i spokojniejsze tempo rozmów.",
    priceCents: 31900,
    durationDays: 31,
    pathLimit: 3,
    highlighted: true,
  },
  {
    slug: "pelna-mapa",
    name: "Pełna mapa",
    description: "Sześć ścieżek i 61 dni dostępu dla pełniejszego procesu.",
    priceCents: 41900,
    durationDays: 61,
    pathLimit: 6,
    highlighted: false,
  },
];

const paths = [
  {
    slug: "kierunek",
    name: "Kierunek",
    description: "Porządkowanie decyzji, priorytetów i najbliższego kroku.",
  },
  {
    slug: "relacje",
    name: "Relacje",
    description: "Wzorce bliskości, granice i sposób komunikacji.",
  },
  {
    slug: "praca",
    name: "Praca i sprawczość",
    description: "Talenty, rytm działania i miejsce, w którym rośnie energia.",
  },
  {
    slug: "zmiana",
    name: "Zmiana",
    description: "Przechodzenie przez nowe etapy bez utraty kontaktu ze sobą.",
  },
  {
    slug: "dobrostan",
    name: "Dobrostan",
    description: "Codzienne zasoby, odpoczynek i sygnały przeciążenia.",
  },
  {
    slug: "sens",
    name: "Sens",
    description: "Dłuższa perspektywa, wartości i pytania, które wracają.",
  },
];

const knowledgeDocuments = [
  {
    slug: "jezyk-odpowiedzi",
    title: "Język odpowiedzi",
    content:
      "Przewodnik mówi językiem refleksji. Nie wydaje poleceń, nie diagnozuje i nie obiecuje przyszłości. Pomaga nazwać wzorce, zasoby, napięcia i pytania do dalszego sprawdzania w życiu.",
  },
  {
    slug: "liczba-drogi-zycia",
    title: "Liczba drogi życia",
    content:
      "Liczba drogi życia jest traktowana jako symboliczny opis podstawowego rytmu: jak osoba zwykle startuje, uczy się, reaguje na zmianę i czego potrzebuje, aby odzyskać poczucie kierunku.",
  },
  {
    slug: "liczba-ekspresji",
    title: "Liczba ekspresji",
    content:
      "Liczba ekspresji opisuje sposób pokazywania potencjału na zewnątrz. W rozmowie służy do szukania języka działania, a nie do oceniania charakteru.",
  },
  {
    slug: "fair-use",
    title: "Uczciwe korzystanie",
    content:
      "Produkt jest prywatnym narzędziem refleksyjnym. Długie serie pytań są ograniczane miękkimi limitami, żeby odpowiedzi pozostały uważne i koszt usługi był przewidywalny.",
  },
];

async function main() {
  for (const plan of plans) {
    await prisma.plan.upsert({
      where: { slug: plan.slug },
      create: plan,
      update: plan,
    });
  }

  for (const [index, path] of paths.entries()) {
    await prisma.path.upsert({
      where: { slug: path.slug },
      create: { ...path, sortOrder: index + 1 },
      update: { ...path, sortOrder: index + 1 },
    });
  }

  for (const document of knowledgeDocuments) {
    await prisma.knowledgeDocument.upsert({
      where: { slug: document.slug },
      create: document,
      update: document,
    });
  }

  const admin = await prisma.user.upsert({
    where: { email: "admin@example.test" },
    create: {
      email: "admin@example.test",
      passwordHash: await hashPassword("admin12345"),
      role: "ADMIN",
      displayName: "Admin",
    },
    update: {
      role: "ADMIN",
      displayName: "Admin",
    },
  });

  const demo = await prisma.user.upsert({
    where: { email: "demo@example.test" },
    create: {
      email: "demo@example.test",
      passwordHash: await hashPassword("demo12345"),
      role: "USER",
      displayName: "Konto demo",
    },
    update: {
      displayName: "Konto demo",
    },
  });

  const demoPlan = await prisma.plan.findUniqueOrThrow({ where: { slug: "glebiej" } });
  const startsAt = new Date();
  const endsAt = new Date(startsAt);
  endsAt.setDate(endsAt.getDate() + demoPlan.durationDays);

  await prisma.accessGrant.create({
    data: {
      userId: demo.id,
      planId: demoPlan.id,
      startsAt,
      endsAt,
      status: "ACTIVE",
    },
  });

  const seededPaths = await prisma.path.findMany({
    orderBy: { sortOrder: "asc" },
    take: demoPlan.pathLimit,
  });

  for (const [index, path] of seededPaths.entries()) {
    await prisma.userPath.upsert({
      where: { userId_pathId: { userId: demo.id, pathId: path.id } },
      create: {
        userId: demo.id,
        pathId: path.id,
        status: index === 0 ? "ACTIVE" : "AVAILABLE",
      },
      update: {
        status: index === 0 ? "ACTIVE" : "AVAILABLE",
      },
    });
  }

  await prisma.auditLog.create({
    data: {
      actorUserId: admin.id,
      targetUserId: demo.id,
      eventType: "seed.completed",
      metadata: JSON.stringify({ demoAccessDays: demoPlan.durationDays }),
    },
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
