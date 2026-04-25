import { describe, it, expect } from "vitest";
import { UsernameCheckSchema } from "@/features/user/schema/username-schema";

describe("Username Schema", () => {
  it("should validate valid username", () => {
    const validData = { username: "test_user123" };
    const result = UsernameCheckSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it("should reject username too short", () => {
    const invalidData = { username: "ab" };
    const result = UsernameCheckSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toContain("3文字以上");
    }
  });

  it("should reject username too long", () => {
    const invalidData = { username: "a".repeat(21) };
    const result = UsernameCheckSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toContain("20文字以内");
    }
  });

  it("should reject username with invalid characters", () => {
    const invalidData = { username: "test-user" };
    const result = UsernameCheckSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toContain("英数字とアンダースコア");
    }
  });

  it("should accept username with underscores", () => {
    const validData = { username: "test_user_123" };
    const result = UsernameCheckSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });
});
