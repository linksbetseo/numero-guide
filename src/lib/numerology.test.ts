import { describe, expect, it } from "vitest";
import {
  calculateNumerologyProfile,
  findDuplicateWords,
  meaningFor,
  reduceNumber,
} from "./numerology";

describe("numerology", () => {
  it("reduces regular and master numbers deterministically", () => {
    expect(reduceNumber(29).result).toBe(11);
    expect(reduceNumber(38).result).toBe(11);
    expect(reduceNumber(44).result).toBe(8);
  });

  it("calculates a stable profile from name and birth date", () => {
    const profile = calculateNumerologyProfile({
      firstNames: "Anna Maria",
      lastNames: "Kowalska",
      birthDate: "1990-05-17",
    });

    expect(profile.lifePath).toBe(5);
    expect(profile.expression).toBe(3);
    expect(profile.soul).toBe(3);
    expect(profile.personality).toBe(9);
    expect(profile.birthDay).toBe(8);
    expect(profile.maturity).toBe(8);
    expect(profile.trace.lifePath.steps).toEqual([32, 5]);
  });

  it("detects duplicated official words across name fields", () => {
    expect(findDuplicateWords("Jan Piotr", "Nowak Jan")).toEqual(["JAN"]);
  });

  it("has a fallback symbolic meaning", () => {
    // 14 redukuje się do 5 (Odkrywca), sprawdzamy że zwraca sensowny string
    expect(meaningFor(14)).toBeTruthy();
    expect(meaningFor(14, "charKey").toLowerCase()).toContain("zmiana");
  });
});
