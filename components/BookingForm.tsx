"use client";

import { useActionState, useEffect, useId, useState } from "react";
import { useRouter } from "next/navigation";
import {
  createBookingAction,
  type BookingActionState,
} from "@/lib/server/bookings";
import { formatPrice } from "@/lib/format";
import type { Lang } from "@/lib/excursions";
import { getDictionary } from "@/lib/dictionaries";

const initial: BookingActionState = { status: "idle" };

const DAY_MAP: Record<string, number> = {
  domingo: 0, sunday: 0, domingos: 0,
  lunes: 1, monday: 1, lunes_d: 1,
  martes: 2, tuesday: 2,
  miercoles: 3, miércoles: 3, wednesday: 3,
  jueves: 4, thursday: 4,
  viernes: 5, friday: 5,
  sabado: 6, sábado: 6, sabados: 6, sábados: 6, saturday: 6,
};

function parseAllowedDays(schedule?: string): number[] | null {
  if (!schedule) return null;
  const lower = schedule.toLowerCase();
  if (lower.includes("consultar")) return null;
  const allowed = new Set<number>();
  for (const [name, day] of Object.entries(DAY_MAP)) {
    if (lower.includes(name)) allowed.add(day);
  }
  return allowed.size > 0 ? Array.from(allowed) : null;
}

function tomorrowISO(): string {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().slice(0, 10);
}

export function BookingForm({
  lang,
  excursionSlug,
  priceArs,
  schedule,
  minAge,
}: {
  lang: Lang;
  excursionSlug: string;
  priceArs: number;
  schedule?: string;
  minAge?: number | null;
}) {
  const t = getDictionary(lang);
  const router = useRouter();
  const [state, action, pending] = useActionState(
    createBookingAction,
    initial,
  );
  const [people, setPeople] = useState(2);
  const [date, setDate] = useState(tomorrowISO());
  const allowedDays = parseAllowedDays(schedule);
  const dateId = useId();
  const peopleId = useId();
  const total = priceArs * people;

  useEffect(() => {
    if (state.status === "success") {
      router.push(state.redirectUrl);
    }
  }, [state, router]);

  const dateInvalid =
    allowedDays !== null && !allowedDays.includes(weekdayUTC(date));

  const fieldErrors =
    state.status === "error" ? (state.fieldErrors ?? {}) : {};

  return (
    <form action={action} className="border border-hairline">
      <input type="hidden" name="excursionSlug" value={excursionSlug} />
      <input type="hidden" name="lang" value={lang} />

      <div className="grid grid-cols-1 sm:grid-cols-2">
        <Field
          id={dateId}
          name="bookingDate"
          label={t.booking.date}
          type="date"
          value={date}
          min={tomorrowISO()}
          onChange={(v) => setDate(v)}
          required
          error={fieldErrors.bookingDate}
          help={
            allowedDays !== null && schedule
              ? `${t.excursion.schedule}: ${schedule}`
              : undefined
          }
          warning={
            dateInvalid
              ? lang === "es"
                ? "Fecha fuera de los días de operación."
                : lang === "en"
                  ? "Selected date is outside operating days."
                  : "Data fora dos dias de operacao."
              : undefined
          }
        />
        <Field
          id={peopleId}
          name="people"
          label={t.booking.people}
          type="number"
          value={String(people)}
          min="1"
          max="20"
          onChange={(v) => setPeople(Math.max(1, Number(v) || 1))}
          required
          error={fieldErrors.people}
          help={minAge ? `Mín. ${minAge}+ años` : undefined}
        />
      </div>

      <Field name="customerName" label={t.booking.name} required error={fieldErrors.customerName} />
      <Field name="customerEmail" label={t.booking.email} type="email" required error={fieldErrors.customerEmail} />
      <Field name="customerPhone" label={t.booking.phone} type="tel" required error={fieldErrors.customerPhone} placeholder="+54 9 294 ..." />

      <div className="border-t border-hairline">
        <label className="block px-5 py-3 eyebrow text-muted">
          {t.booking.message}
        </label>
        <textarea
          name="customerNotes"
          rows={3}
          maxLength={800}
          className="block w-full px-5 pb-4 bg-transparent border-0 outline-none focus:bg-fg/[0.02] text-sm resize-y"
          placeholder="..."
        />
      </div>

      <div className="border-t border-hairline px-5 py-4 flex items-baseline justify-between bg-bg">
        <span className="eyebrow">{t.excursion.from}</span>
        <span className="dp text-base font-semibold">
          {t.excursion.ars} {formatPrice(total)}{" "}
          <span className="text-muted text-xs ml-1">
            ({people} × {formatPrice(priceArs)})
          </span>
        </span>
      </div>

      {state.status === "error" ? (
        <div className="border-t border-hairline px-5 py-3 text-sm text-warning">
          {state.message}
        </div>
      ) : null}

      <div className="border-t border-hairline">
        <button
          type="submit"
          disabled={pending || dateInvalid}
          className="w-full bg-fg text-bg py-4 px-4 text-sm uppercase tracking-[0.16em] font-medium disabled:opacity-50 hover:bg-accent-strong transition-colors"
        >
          {pending ? t.booking.sending : t.booking.submit}
        </button>
      </div>
    </form>
  );
}

function Field({
  id,
  name,
  label,
  type = "text",
  value,
  min,
  max,
  onChange,
  required,
  error,
  help,
  warning,
  placeholder,
}: {
  id?: string;
  name: string;
  label: string;
  type?: string;
  value?: string;
  min?: string;
  max?: string;
  onChange?: (v: string) => void;
  required?: boolean;
  error?: string;
  help?: string;
  warning?: string;
  placeholder?: string;
}) {
  const showError = !!error;
  return (
    <div className="border-t border-hairline">
      <label htmlFor={id} className="block px-5 pt-3 eyebrow text-muted">
        {label}
        {required ? <span className="text-warning ml-1">*</span> : null}
      </label>
      <input
        id={id}
        name={name}
        type={type}
        defaultValue={onChange ? undefined : value}
        value={onChange ? value : undefined}
        min={min}
        max={max}
        required={required}
        placeholder={placeholder}
        onChange={onChange ? (e) => onChange(e.target.value) : undefined}
        className="block w-full px-5 pb-3 bg-transparent border-0 outline-none focus:bg-fg/[0.02] text-base"
      />
      {help && !showError ? (
        <p className="px-5 pb-2 text-xs text-muted">{help}</p>
      ) : null}
      {warning ? (
        <p className="px-5 pb-2 text-xs text-warning">{warning}</p>
      ) : null}
      {showError ? (
        <p className="px-5 pb-2 text-xs text-warning">{error}</p>
      ) : null}
    </div>
  );
}

function weekdayUTC(iso: string): number {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d)).getUTCDay();
}
