"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { grantAccessForPlan, getCurrentAccess, revokeActiveAccess } from "@/lib/access";
import { createSession, destroySession, requireAdmin, requireUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { calculateNumerologyProfile, validateNumerologyInput } from "@/lib/numerology";
import { hashPassword, verifyPassword } from "@/lib/password";
import { writeAuditLog } from "@/lib/audit";

function value(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function redirectWithError(path: string, error: string): never {
  redirect(`${path}${path.includes("?") ? "&" : "?"}error=${encodeURIComponent(error)}`);
}

export async function loginAction(formData: FormData) {
  const email = value(formData, "email").toLowerCase();
  const password = value(formData, "password");
  const next = value(formData, "next") || "/app";
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    redirectWithError("/login", "Nieprawidłowy e-mail lub hasło.");
  }

  if (!(await verifyPassword(password, user.passwordHash))) {
    redirectWithError("/login", "Nieprawidłowy e-mail lub hasło.");
  }

  await createSession(user.id);
  redirect(next.startsWith("/") ? next : "/app");
}

export async function logoutAction() {
  await destroySession();
  redirect("/");
}

export async function checkoutAction(formData: FormData) {
  const planSlug = value(formData, "plan");
  const email = value(formData, "email").toLowerCase();
  const password = value(formData, "password");
  const displayName = value(formData, "displayName");
  const checkoutPath = `/checkout?plan=${encodeURIComponent(planSlug)}`;

  const acceptedAll =
    formData.get("terms") &&
    formData.get("aiTerms") &&
    formData.get("privacy") &&
    formData.get("immediateService");

  if (!acceptedAll) {
    redirectWithError(checkoutPath, "Zaznacz wymagane zgody, aby aktywować dostęp demo.");
  }

  if (!email.includes("@") || password.length < 8) {
    redirectWithError(checkoutPath, "Podaj poprawny e-mail i hasło min. 8 znaków.");
  }

  const plan = await prisma.plan.findUnique({ where: { slug: planSlug } });

  if (!plan) {
    redirectWithError("/checkout", "Nie znaleziono planu.");
  }

  const existingUser = await prisma.user.findUnique({ where: { email } });
  let user = existingUser;

  if (existingUser) {
    const ok = await verifyPassword(password, existingUser.passwordHash);
    if (!ok) {
      redirectWithError(checkoutPath, "Konto z tym e-mailem już istnieje. Zaloguj się tym samym hasłem.");
    }
  } else {
    user = await prisma.user.create({
      data: {
        email,
        passwordHash: await hashPassword(password),
        displayName: displayName || null,
      },
    });
  }

  const providerOrderId = `demo_${randomUUID()}`;
  const now = new Date();

  await prisma.order.create({
    data: {
      userId: user!.id,
      planId: plan.id,
      status: "PAID",
      email,
      amountCents: plan.priceCents,
      currency: plan.currency,
      provider: "demo",
      providerOrderId,
      termsVersion: "terms-v1",
      aiTermsVersion: "ai-terms-v1",
      privacyVersion: "privacy-v1",
      immediateServiceConsentAt: now,
      paidAt: now,
    },
  });

  await grantAccessForPlan({
    userId: user!.id,
    planId: plan.id,
    providerOrderId,
  });
  await createSession(user!.id);
  redirect("/app");
}

export async function saveProfileAction(formData: FormData) {
  const user = await requireUser();
  const access = await getCurrentAccess(user.id);

  if (!access) {
    redirect("/app/access");
  }

  const input = {
    firstNames: value(formData, "firstNames"),
    lastNames: value(formData, "lastNames"),
    previousNames: value(formData, "previousNames"),
    birthDate: value(formData, "birthDate"),
  };
  const errors = validateNumerologyInput(input);

  if (errors.length > 0) {
    redirectWithError("/app/profile", errors.join(" "));
  }

  const existing = await prisma.numerologyProfile.findUnique({
    where: { userId: user.id },
  });

  if (existing?.lockedAt) {
    redirectWithError("/app/profile", "Profil jest już zablokowany. Reset może wykonać admin.");
  }

  const result = calculateNumerologyProfile(input);
  const data = {
    firstNames: result.firstNames,
    lastNames: result.lastNames,
    previousNames: result.previousNames ?? null,
    birthDate: result.birthDate,
    lifePath: result.lifePath,
    expression: result.expression,
    soul: result.soul,
    personality: result.personality,
    birthDay: result.birthDay,
    maturity: result.maturity,
    personalYear: result.personalYear,
    challenges: JSON.stringify(result.challenges),
    trace: JSON.stringify(result.trace),
    lockedAt: new Date(),
  };

  if (existing) {
    await prisma.numerologyProfile.update({
      where: { userId: user.id },
      data,
    });
  } else {
    await prisma.numerologyProfile.create({
      data: {
        userId: user.id,
        ...data,
      },
    });
  }

  await writeAuditLog({
    eventType: "profile.locked",
    actorUserId: user.id,
    targetUserId: user.id,
    metadata: {
      lifePath: result.lifePath,
      expression: result.expression,
    },
  });

  redirect("/app/chat");
}

export async function selectPathAction(formData: FormData) {
  const user = await requireUser();
  const pathId = value(formData, "pathId");
  const current = await prisma.userPath.findUnique({
    where: { userId_pathId: { userId: user.id, pathId } },
  });

  if (!current) {
    redirect("/app");
  }

  await prisma.$transaction([
    prisma.userPath.updateMany({
      where: { userId: user.id, status: "ACTIVE" },
      data: { status: "AVAILABLE" },
    }),
    prisma.userPath.update({
      where: { userId_pathId: { userId: user.id, pathId } },
      data: { status: "ACTIVE" },
    }),
  ]);

  revalidatePath("/app");
  redirect("/app/chat");
}

export async function adminResetProfileAction(formData: FormData) {
  const admin = await requireAdmin();
  const userId = value(formData, "userId");
  const existing = await prisma.numerologyProfile.findUnique({ where: { userId } });

  if (existing) {
    await prisma.numerologyProfile.update({
      where: { userId },
      data: {
        lockedAt: null,
        resetCount: { increment: 1 },
      },
    });
  }

  await prisma.conversation.deleteMany({ where: { userId } });
  await writeAuditLog({
    eventType: "profile.reset",
    actorUserId: admin.id,
    targetUserId: userId,
    metadata: { hadProfile: Boolean(existing) },
  });

  revalidatePath("/admin");
  redirect("/admin");
}

export async function adminGrantAccessAction(formData: FormData) {
  const admin = await requireAdmin();
  const userId = value(formData, "userId");
  const planSlug = value(formData, "plan");
  const plan = await prisma.plan.findUnique({ where: { slug: planSlug } });

  if (plan) {
    await grantAccessForPlan({
      userId,
      planId: plan.id,
      actorUserId: admin.id,
      providerOrderId: `admin_${randomUUID()}`,
    });
  }

  revalidatePath("/admin");
  redirect("/admin");
}

export async function adminRevokeAccessAction(formData: FormData) {
  const admin = await requireAdmin();
  const userId = value(formData, "userId");

  await revokeActiveAccess({ userId, actorUserId: admin.id });
  revalidatePath("/admin");
  redirect("/admin");
}
