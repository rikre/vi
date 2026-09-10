import { describe, expect, it } from "vitest";
import {
  isValidCode,
  isValidEmail,
  isValidPassword,
  isValidPhone,
  normalizePhone,
} from "@/lib/auth-validation";

describe("auth validation", () => {
  it("validates mainland China phone numbers", () => {
    expect(isValidPhone("13800138000")).toBe(true);
    expect(isValidPhone("12800138000")).toBe(false);
    expect(isValidPhone("1380013800")).toBe(false);
    expect(normalizePhone("138 0013-8000 extra")).toBe("13800138000");
  });

  it("validates email addresses", () => {
    expect(isValidEmail("creator@bollo.video")).toBe(true);
    expect(isValidEmail(" creator@bollo.video ")).toBe(true);
    expect(isValidEmail("creator@bollo")).toBe(false);
    expect(isValidEmail("creator bollo.video")).toBe(false);
  });

  it("requires exactly six numeric verification-code digits", () => {
    expect(isValidCode("123456")).toBe(true);
    expect(isValidCode("12345")).toBe(false);
    expect(isValidCode("12345a")).toBe(false);
  });

  it("accepts passwords between 6 and 128 characters", () => {
    expect(isValidPassword("bollo1")).toBe(true);
    expect(isValidPassword("12345")).toBe(false);
    expect(isValidPassword("x".repeat(129))).toBe(false);
  });
});
