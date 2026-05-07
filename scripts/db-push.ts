/* eslint-disable no-console */
import "dotenv/config";
import { neon } from "@neondatabase/serverless";

async function main(): Promise<void> {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error("DATABASE_URL not set");
    process.exit(1);
  }
  const sql = neon(url);

  await sql`
    DO $$ BEGIN
      CREATE TYPE booking_status AS ENUM ('pending', 'paid', 'cancelled', 'expired');
    EXCEPTION WHEN duplicate_object THEN null; END $$
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS bookings (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      excursion_slug text NOT NULL,
      excursion_title text NOT NULL,
      booking_date text NOT NULL,
      people integer NOT NULL,
      customer_name text NOT NULL,
      customer_email text NOT NULL,
      customer_phone text NOT NULL,
      customer_notes text,
      total_ars integer NOT NULL,
      status booking_status NOT NULL DEFAULT 'pending',
      lang text NOT NULL DEFAULT 'es',
      mp_preference_id text,
      mp_payment_id text,
      created_at timestamptz NOT NULL DEFAULT now(),
      updated_at timestamptz NOT NULL DEFAULT now()
    )
  `;

  await sql`CREATE INDEX IF NOT EXISTS bookings_excursion_idx ON bookings(excursion_slug)`;
  await sql`CREATE INDEX IF NOT EXISTS bookings_status_idx ON bookings(status)`;
  await sql`CREATE INDEX IF NOT EXISTS bookings_email_idx ON bookings(customer_email)`;

  console.log("✓ schema applied");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
