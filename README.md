# Luminaria MVP

Pierwszy sprint aplikacji typu numerologiczny przewodnik AI. To własny produkt, bez kopiowania nazwy, treści, layoutu, promptów ani cudzej bazy wiedzy.

## Zakres sprintu

- Next.js App Router + TypeScript.
- Prisma schema z domenami: auth, billing, access, numerology, chat, admin.
- Lokalna baza SQLite dla szybkiego MVP. Modele są przygotowane tak, żeby później przejść na PostgreSQL.
- Demo checkout tworzący konto, zamówienie i aktywny dostęp czasowy.
- Sesje na bezpiecznych cookies, role `USER` i `ADMIN`.
- Profil numerologiczny zapisywany jako locked, z deterministycznym trace obliczeń.
- Czat z historią w DB, fake AI providerem i podstawowymi guardrails/fair use.
- Admin lite: reset profilu, nadanie dostępu, cofnięcie dostępu.

## Uruchomienie lokalne

```bash
npm install
npm run prisma:generate
npm run db:reset
npm run dev
```

Aplikacja będzie dostępna pod `http://localhost:3000`.

## Konta seed

- Użytkownik demo: `demo@example.test` / `demo12345`
- Admin: `admin@example.test` / `admin12345`

## Przydatne komendy

```bash
npm test
npm run lint
npm run typecheck
npm run build
```

`npm run db:reset` tworzy lokalny plik `prisma/dev.db` z SQL wygenerowanego przez Prisma i uruchamia seed. W tym środowisku `prisma db push` zwracał pusty błąd schema engine dla SQLite, dlatego MVP ma jawny helper `scripts/create-sqlite-db.mjs`.

## Następne kroki

- Podmienić SQLite na PostgreSQL i dodać migracje.
- Dodać prawdziwy Stripe/PayU/Przelewy24 webhook z idempotencją.
- Zastąpić fake AI providerem OpenAI/innym modelem przez interfejs dostawcy.
- Rozbudować knowledge base o CRUD, wersje i wyszukiwanie semantyczne.
- Dodać eksport/usunięcie danych użytkownika i pełne dokumenty prawne.
