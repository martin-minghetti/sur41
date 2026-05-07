import { describe, it, expect } from "vitest";
import { bookingFormSchema } from "@/lib/server/validation";

const valid = {
  excursionSlug: "canopy",
  bookingDate: "2026-12-15",
  people: "2",
  customerName: "Martín",
  customerEmail: "Martin@Example.COM",
  customerPhone: "+54 9 294 1234567",
  customerNotes: "Sin gluten",
  lang: "es",
};

describe("bookingFormSchema", () => {
  it("accepts a valid form", () => {
    const r = bookingFormSchema.safeParse(valid);
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.people).toBe(2);
      expect(r.data.customerEmail).toBe("martin@example.com");
    }
  });

  it("rejects malformed date", () => {
    const r = bookingFormSchema.safeParse({ ...valid, bookingDate: "15/12/26" });
    expect(r.success).toBe(false);
  });

  it("rejects people > 20", () => {
    const r = bookingFormSchema.safeParse({ ...valid, people: "21" });
    expect(r.success).toBe(false);
  });

  it("rejects email without @", () => {
    const r = bookingFormSchema.safeParse({ ...valid, customerEmail: "nope" });
    expect(r.success).toBe(false);
  });

  it("rejects phone with letters", () => {
    const r = bookingFormSchema.safeParse({
      ...valid,
      customerPhone: "+54 abc",
    });
    expect(r.success).toBe(false);
  });

  it("strips notes if empty string", () => {
    const r = bookingFormSchema.safeParse({ ...valid, customerNotes: "" });
    expect(r.success).toBe(true);
  });

  it("defaults lang to es", () => {
    const { lang: _lang, ...rest } = valid;
    void _lang;
    const r = bookingFormSchema.safeParse(rest);
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.lang).toBe("es");
  });
});
