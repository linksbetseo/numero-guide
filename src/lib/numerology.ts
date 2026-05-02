export type NumerologyInput = {
  firstNames: string;
  lastNames: string;
  previousNames?: string;
  birthDate: string;
};

export type ReductionTrace = {
  source: string;
  numbers: number[];
  total: number;
  steps: number[];
  result: number;
};

export type NumberMeaning = {
  short: string;
  charKey: string;
  inAction: string;
  shadow: string;
};

export type NumerologyResult = {
  firstNames: string;
  lastNames: string;
  previousNames?: string;
  birthDate: string;
  lifePath: number;
  expression: number;
  soul: number;
  personality: number;
  birthDay: number;
  maturity: number;
  personalYear: number;
  challenges: [number, number, number, number];
  trace: Record<string, ReductionTrace>;
};

const letterValues: Record<string, number> = {
  A: 1,
  J: 1,
  S: 1,
  B: 2,
  K: 2,
  T: 2,
  C: 3,
  L: 3,
  U: 3,
  D: 4,
  M: 4,
  V: 4,
  E: 5,
  N: 5,
  W: 5,
  F: 6,
  O: 6,
  X: 6,
  G: 7,
  P: 7,
  Y: 7,
  H: 8,
  Q: 8,
  Z: 8,
  I: 9,
  R: 9,
};

const diacritics: Record<string, string> = {
  Ą: "A",
  Ć: "C",
  Ę: "E",
  Ł: "L",
  Ń: "N",
  Ó: "O",
  Ś: "S",
  Ż: "Z",
  Ź: "Z",
};

const vowels = new Set(["A", "E", "I", "O", "U", "Y"]);
const masterNumbers = new Set([11, 22, 33]);

export const numberMeanings: Record<number, NumberMeaning> = {
  1: {
    short: "Pionier",
    charKey:
      "Jedynka jest zawsze pierwsza w kolejce. Lubi wchodzić tam, gdzie inni się wahają — i często ma rację, że to robi. Płaci za to samotnością wyboru.",
    inAction:
      "W decyzji szuka ruchu do przodu. W relacji potrzebuje przestrzeni na bycie pierwszą(-ym). W zmianie inicjuje zamiast czekać.",
    shadow:
      "Pierwszy krok bez drugiego to nie odwaga, tylko ucieczka. Ryzyko: zaczynać za dużo, kończyć za mało.",
  },
  2: {
    short: "Mediator",
    charKey:
      "Dwójka czuje nastrój pomieszczenia, zanim ktokolwiek coś powie. Buduje mosty między ludźmi z naturalną lekkością. Czasem za cenę własnych granic.",
    inAction:
      "W decyzji szuka zgody i balansu. W relacji jest uważna(-y) na potrzeby drugiej osoby. W zmianie potrzebuje partnera — rzadko zmienia się w samotności.",
    shadow:
      "Nadmierna ugodowość może zamienić się w ciche pretensje. Pułapka: słuchać wszystkich, a zapomnieć o własnym głosie.",
  },
  3: {
    short: "Kreator",
    charKey:
      "Trójka myśli obrazami i mówi zanim pomyśli — co bywa darem i kłopotem naraz. Przynosi lekkość do każdego pokoju, który wchodzi.",
    inAction:
      "W decyzji szuka rozwiązania przez rozmowę lub twórczy pomysł. W relacji wnosi radość i ekspresję. W zmianie potrzebuje poczucia, że nowe jest ciekawsze niż stare.",
    shadow:
      "Powierzchowność i rozproszenie. Ryzyko: zacząć tysiąc projektów i nie dokończyć żadnego, bo nudzi się za wcześnie.",
  },
  4: {
    short: "Budowniczy",
    charKey:
      "Czwórka buduje powoli, ale solidnie. Wie, że bez fundamentu wszystko się sypie — i to daje jej spokój, który innych irytuje.",
    inAction:
      "W decyzji szuka planu i bezpieczeństwa. W relacji jest wierna(-y) i odpowiedzialna(-y). W zmianie potrzebuje harmonogramu — chaos ją paraliżuje.",
    shadow:
      "Sztywność i opór przed nowym. Ryzyko: tak bardzo bronić struktury, że nie wpuścić nic żywego.",
  },
  5: {
    short: "Odkrywca",
    charKey:
      "Piątka żyje szybciej niż inni. Zmiana jest dla niej powietrzem — bez niej się dusi. Przynosi świeżość i nowe perspektywy wszędzie, gdzie się zjawia.",
    inAction:
      "W decyzji szuka opcji, nie jednej odpowiedzi. W relacji potrzebuje wolności i niespodzianek. W zmianie jest pierwsza — i pierwsza się nudzi, gdy zmiana staje się rutyną.",
    shadow:
      "Ucieczka od zaangażowania i zobowiązań. Pułapka: ciągle szukać następnego, zanim skończy się obecne.",
  },
  6: {
    short: "Opiekun",
    charKey:
      "Szóstka widzi, kto potrzebuje pomocy, zanim ta osoba sama to zauważy. Tworzy domy i wspólnoty z naturalnej potrzeby — nie z obowiązku.",
    inAction:
      "W decyzji pyta: czy to dobre dla kogoś bliskiego? W relacji jest lojalna(-y) i troskliwa(-y). W zmianie działa spokojnie, gdy zmiana ma sens dla ludzi, których kocha.",
    shadow:
      "Perfekcjonizm i poświęcenie za cenę siebie. Ryzyko: troszczyć się o wszystkich, a siebie zostawić na końcu.",
  },
  7: {
    short: "Badacz",
    charKey:
      "Siódemka czyta między wierszami i nie wierzy w przypadki. To liczba badaczy, samotników i ludzi, którzy zadają niewygodne pytania na imprezie.",
    inAction:
      "W decyzji szuka sensu i prawdy — nie prędkości. W relacji potrzebuje głębi lub jej nie ma. W zmianie analizuje długo, ale gdy decyduje — wie dlaczego.",
    shadow:
      "Zamknięcie w głowie i dystans od życia. Pułapka: tak dużo analizować, że przegapić sam moment.",
  },
  8: {
    short: "Architekt",
    charKey:
      "Ósemka rozumie, jak działa moc — zarówno ta materialna, jak i ta w relacjach. Wie, co znaczy brać odpowiedzialność za wyniki.",
    inAction:
      "W decyzji szuka wpływu i skuteczności. W relacji jest silna(-y), ale potrzebuje wzajemności, nie zależności. W zmianie myśli strategicznie.",
    shadow:
      "Kontrola i materializm jako substytut więzi. Ryzyko: osiągnąć wszystko na zewnątrz i zostać pustkę w środku.",
  },
  9: {
    short: "Mędrzec",
    charKey:
      "Dziewiątka widzi szerszy obraz, gdy inni widzą tylko swój fragment. Ma w sobie coś z nauczyciela — nawet jeśli nigdy tak siebie nie nazwała(-a).",
    inAction:
      "W decyzji pyta: co jest naprawdę ważne w tej sytuacji? W relacji wnosi empatię i perspektywę. W zmianie wie, kiedy etap się skończył — i umie go zamknąć.",
    shadow:
      "Rozproszenie energii na cudze sprawy kosztem własnych. Pułapka: pomagać wszystkim, a własnych celów nie realizować.",
  },
  11: {
    short: "Wizjoner",
    charKey:
      "Jedenastka żyje na granicy między intuicją a codziennością. Widzi więcej niż inni — i czasem nie wie, co z tym zrobić.",
    inAction:
      "W decyzji ufa przeczuciom, ale potrzebuje uziemienia w faktach. W relacji jest inspirująca(-y), lecz wymaga dużo przestrzeni. W zmianie idzie za głosem wewnętrznym.",
    shadow:
      "Napięcie i nerwowość wynikające z ciągłego bycia w stanie 'pomiędzy'. Ryzyko: przepalić się od własnej wrażliwości.",
  },
  22: {
    short: "Budowniczy Marzeń",
    charKey:
      "Dwudziestodwójka to liczba tych, którzy budują rzeczy trwałe — projekty, organizacje, dziedzictwo. Myśli dekadami, nie dniami.",
    inAction:
      "W decyzji szuka rozwiązania na dużą skalę. W relacji jest filarem — stabilna(-y), odpowiedzialna(-y). W zmianie wdraża, nie tylko marzy.",
    shadow:
      "Przytłoczenie ciężarem własnych ambicji. Ryzyko: tak skupić się na dużym obrazie, że zaniedbać ludzi blisko.",
  },
  33: {
    short: "Mistrz Służby",
    charKey:
      "Trzydziestotrojka łączy troskę dwójki z ekspresją trójki i robi to na poziomie, który rzadko się widuje. To liczba tych, którzy naprawdę zmieniają ludzi wokół siebie.",
    inAction:
      "W decyzji pyta o dobro wspólne. W relacji jest głęboko obecna(-y) i opiekuńcza(-y). W zmianie prowadzi innych, ale potrzebuje też własnego prowadzenia.",
    shadow:
      "Poświęcenie bez granic. Ryzyko: dawać tak wiele, że nie zostaje nic dla siebie.",
  },
};

export function normalizeName(value: string) {
  return value
    .trim()
    .toUpperCase()
    .replace(/[ąćęłńóśżź]/g, (char) => diacritics[char.toUpperCase()] ?? char)
    .replace(/[^\p{L}\s-]/gu, "")
    .replace(/\s+/g, " ");
}

export function words(value: string) {
  return normalizeName(value)
    .split(/[\s-]+/)
    .map((word) => word.trim())
    .filter(Boolean);
}

export function findDuplicateWords(...values: string[]) {
  const seen = new Set<string>();
  const duplicates = new Set<string>();

  for (const word of values.flatMap(words)) {
    if (seen.has(word)) {
      duplicates.add(word);
    }
    seen.add(word);
  }

  return [...duplicates];
}

export function reduceNumber(value: number, keepMasters = true) {
  const steps: number[] = [value];
  let current = value;

  while (current > 9 && !(keepMasters && masterNumbers.has(current))) {
    current = String(current)
      .split("")
      .reduce((sum, digit) => sum + Number(digit), 0);
    steps.push(current);
  }

  return { result: current, steps };
}

function traceFromNumbers(source: string, numbers: number[], keepMasters = true): ReductionTrace {
  const total = numbers.reduce((sum, number) => sum + number, 0);
  const reduction = reduceNumber(total, keepMasters);

  return {
    source,
    numbers,
    total,
    steps: reduction.steps,
    result: reduction.result,
  };
}

function digits(value: string) {
  return value
    .replace(/\D/g, "")
    .split("")
    .filter(Boolean)
    .map(Number);
}

function nameNumbers(value: string, mode: "all" | "vowels" | "consonants" = "all") {
  return normalizeName(value)
    .replace(/[\s-]/g, "")
    .split("")
    .map((letter) => {
      const normalized = diacritics[letter] ?? letter;
      return { letter: normalized, value: letterValues[normalized] ?? 0 };
    })
    .filter(({ letter, value }) => {
      if (!value) return false;
      if (mode === "vowels") return vowels.has(letter);
      if (mode === "consonants") return !vowels.has(letter);
      return true;
    })
    .map(({ value }) => value);
}

export function validateNumerologyInput(input: NumerologyInput) {
  const errors: string[] = [];
  const duplicateWords = findDuplicateWords(input.firstNames, input.lastNames);

  if (words(input.firstNames).length === 0) {
    errors.push("Podaj co najmniej jedno imię.");
  }

  if (words(input.lastNames).length === 0) {
    errors.push("Podaj co najmniej jedno nazwisko.");
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(input.birthDate)) {
    errors.push("Data urodzenia musi mieć format RRRR-MM-DD.");
  } else {
    const [year, month, day] = input.birthDate.split("-").map(Number);
    const d = new Date(year, month - 1, day);
    if (d.getFullYear() !== year || d.getMonth() + 1 !== month || d.getDate() !== day) {
      errors.push("Podana data urodzenia nie istnieje w kalendarzu.");
    }
  }

  if (duplicateWords.length > 0) {
    errors.push(`Usuń powtórzone słowa: ${duplicateWords.join(", ")}.`);
  }

  return errors;
}

export function calculateNumerologyProfile(input: NumerologyInput): NumerologyResult {
  const errors = validateNumerologyInput(input);

  if (errors.length > 0) {
    throw new Error(errors.join(" "));
  }

  const fullName = `${input.firstNames} ${input.lastNames}`;
  const birthDigits = digits(input.birthDate);
  const dayStr = input.birthDate.slice(8, 10);
  const monthStr = input.birthDate.slice(5, 7);
  const yearStr = input.birthDate.slice(0, 4);
  const dayNum = parseInt(dayStr, 10);
  const monthNum = parseInt(monthStr, 10);

  const expressionTrace = traceFromNumbers(fullName, nameNumbers(fullName));
  const lifePathTrace = traceFromNumbers(input.birthDate, birthDigits);
  const soulTrace = traceFromNumbers(fullName, nameNumbers(fullName, "vowels"));
  const personalityTrace = traceFromNumbers(fullName, nameNumbers(fullName, "consonants"));
  const birthDayTrace = traceFromNumbers(dayStr, digits(dayStr));
  const maturityTrace = traceFromNumbers("lifePath + expression", [
    lifePathTrace.result,
    expressionTrace.result,
  ]);

  const currentYear = new Date().getFullYear();
  const personalYearTrace = traceFromNumbers(
    `personalYear ${currentYear}`,
    [...digits(dayStr), ...digits(monthStr), ...digits(String(currentYear))],
  );

  const c1 = reduceNumber(Math.abs(monthNum - dayNum)).result;
  const c2 = reduceNumber(Math.abs(parseInt(yearStr.slice(-2), 10) - monthNum)).result;
  const c3 = reduceNumber(Math.abs(c1 - c2)).result;
  const c4 = reduceNumber(
    Math.abs(parseInt(yearStr.slice(0, 2), 10) - parseInt(yearStr.slice(-2), 10)),
  ).result;

  return {
    firstNames: input.firstNames.trim(),
    lastNames: input.lastNames.trim(),
    previousNames: input.previousNames?.trim() || undefined,
    birthDate: input.birthDate,
    lifePath: lifePathTrace.result,
    expression: expressionTrace.result,
    soul: soulTrace.result,
    personality: personalityTrace.result,
    birthDay: birthDayTrace.result,
    maturity: maturityTrace.result,
    personalYear: personalYearTrace.result,
    challenges: [c1, c2, c3, c4],
    trace: {
      lifePath: lifePathTrace,
      expression: expressionTrace,
      soul: soulTrace,
      personality: personalityTrace,
      birthDay: birthDayTrace,
      maturity: maturityTrace,
      personalYear: personalYearTrace,
    },
  };
}

export function meaningFor(number: number, context: "short" | "charKey" | "inAction" | "shadow" = "short") {
  const meaning = numberMeanings[number] ?? numberMeanings[reduceNumber(number).result];
  if (!meaning) return "symboliczny kierunek";
  return meaning[context];
}
