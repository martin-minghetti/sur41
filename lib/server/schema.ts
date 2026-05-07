import {
  pgTable,
  text,
  integer,
  timestamp,
  uuid,
  pgEnum,
} from "drizzle-orm/pg-core";

export const bookingStatus = pgEnum("booking_status", [
  "pending",
  "paid",
  "cancelled",
  "expired",
]);

export const bookings = pgTable("bookings", {
  id: uuid("id").primaryKey().defaultRandom(),
  excursionSlug: text("excursion_slug").notNull(),
  excursionTitle: text("excursion_title").notNull(),
  bookingDate: text("booking_date").notNull(),
  people: integer("people").notNull(),
  customerName: text("customer_name").notNull(),
  customerEmail: text("customer_email").notNull(),
  customerPhone: text("customer_phone").notNull(),
  customerNotes: text("customer_notes"),
  totalArs: integer("total_ars").notNull(),
  status: bookingStatus("status").notNull().default("pending"),
  lang: text("lang").notNull().default("es"),
  mpPreferenceId: text("mp_preference_id"),
  mpPaymentId: text("mp_payment_id"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export type Booking = typeof bookings.$inferSelect;
export type NewBooking = typeof bookings.$inferInsert;
