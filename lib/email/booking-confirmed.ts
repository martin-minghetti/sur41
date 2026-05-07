import { Resend } from "resend";
import type { Lang } from "@/lib/excursions";
import { formatPrice } from "@/lib/excursions";

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;");
}

export type ConfirmEmailInput = {
  bookingId: string;
  excursionTitle: string;
  bookingDate: string;
  people: number;
  totalArs: number;
  customerName: string;
  customerEmail: string;
  lang: Lang;
};

const COPY: Record<
  Lang,
  {
    subject: (title: string) => string;
    hi: (name: string) => string;
    intro: string;
    booking: string;
    excursion: string;
    date: string;
    people: string;
    total: string;
    ref: string;
    next: string;
    nextBody: string;
    cheers: string;
    sign: string;
  }
> = {
  es: {
    subject: (title) => `Reserva confirmada · ${title} · Sur41`,
    hi: (name) => `Hola ${name},`,
    intro: "Confirmamos tu reserva. El equipo te contacta antes de la salida con el horario exacto y el punto de encuentro.",
    booking: "Detalle",
    excursion: "Excursión",
    date: "Fecha",
    people: "Personas",
    total: "Total",
    ref: "Referencia",
    next: "Próximo paso",
    nextBody: "Recibís un mensaje 24-48 hs antes de la fecha con el horario y el punto de encuentro. Si necesitás cambiar algo, respondé a este mail.",
    cheers: "Nos vemos en Bariloche.",
    sign: "Equipo Sur41 · Mitre 100, San Carlos de Bariloche",
  },
  en: {
    subject: (title) => `Booking confirmed · ${title} · Sur41`,
    hi: (name) => `Hi ${name},`,
    intro: "Your booking is confirmed. We'll reach out before the trip with the exact time and meeting point.",
    booking: "Details",
    excursion: "Excursion",
    date: "Date",
    people: "People",
    total: "Total",
    ref: "Ref",
    next: "What's next",
    nextBody: "You'll receive a message 24-48 hours before the date with the exact time and meeting point. Reply to this email if you need to change anything.",
    cheers: "See you in Bariloche.",
    sign: "Sur41 team · Mitre 100, San Carlos de Bariloche",
  },
  "pt-br": {
    subject: (title) => `Reserva confirmada · ${title} · Sur41`,
    hi: (name) => `Ola ${name},`,
    intro: "Sua reserva esta confirmada. A gente entra em contato antes do passeio com o horario exato e o ponto de encontro.",
    booking: "Detalhes",
    excursion: "Excursao",
    date: "Data",
    people: "Pessoas",
    total: "Total",
    ref: "Referencia",
    next: "Proximo passo",
    nextBody: "Voce recebe uma mensagem 24-48 horas antes da data com o horario e o ponto de encontro. Responde este e-mail se precisar mudar alguma coisa.",
    cheers: "A gente se ve em Bariloche.",
    sign: "Equipe Sur41 · Mitre 100, San Carlos de Bariloche",
  },
};

function renderHtml(input: ConfirmEmailInput): { html: string; subject: string } {
  const c = COPY[input.lang];
  const title = escapeHtml(input.excursionTitle);
  const name = escapeHtml(input.customerName);
  const date = escapeHtml(input.bookingDate);
  const ref = escapeHtml(input.bookingId.slice(0, 8).toUpperCase());

  const html = `<!DOCTYPE html>
<html>
<head><meta charset="utf-8" /><meta name="viewport" content="width=device-width" /></head>
<body style="margin:0;padding:0;background:#f4f4f2;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Inter,Helvetica,Arial,sans-serif;color:#1b1f23;">
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background:#f4f4f2;padding:32px 16px;">
    <tr><td align="center">
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="560" style="max-width:560px;background:#ffffff;border:1px solid #d8d8d5;">
        <tr><td style="padding:24px 28px;border-bottom:1px solid #d8d8d5;">
          <span style="font-family:'JetBrains Mono',ui-monospace,monospace;font-size:12px;letter-spacing:0.18em;color:#1b1f23;font-weight:600;">SUR <span style="color:#6c8a9b;">41</span></span>
          <span style="font-family:'JetBrains Mono',ui-monospace,monospace;font-size:10px;letter-spacing:0.18em;color:#6b7177;margin-left:14px;">41°08′32″S · 71°18′37″O</span>
        </td></tr>
        <tr><td style="padding:32px 28px;">
          <h1 style="margin:0 0 8px 0;font-size:24px;font-weight:500;letter-spacing:-0.01em;">${c.hi(name)}</h1>
          <p style="margin:0 0 20px 0;color:#1b1f23;line-height:1.6;font-size:15px;">${c.intro}</p>

          <p style="font-family:'JetBrains Mono',ui-monospace,monospace;font-size:10px;letter-spacing:0.18em;text-transform:uppercase;color:#6b7177;margin:24px 0 8px 0;">${c.booking}</p>
          <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="border:1px solid #d8d8d5;font-size:14px;">
            ${row(c.excursion, title)}
            ${row(c.date, date)}
            ${row(c.people, String(input.people))}
            ${row(c.total, `AR$ ${formatPrice(input.totalArs)}`, true)}
            ${row(c.ref, ref)}
          </table>

          <p style="font-family:'JetBrains Mono',ui-monospace,monospace;font-size:10px;letter-spacing:0.18em;text-transform:uppercase;color:#6b7177;margin:28px 0 8px 0;">${c.next}</p>
          <p style="margin:0 0 24px 0;color:#1b1f23;line-height:1.6;font-size:14px;">${c.nextBody}</p>

          <p style="margin:32px 0 0 0;color:#1b1f23;font-size:14px;">${c.cheers}</p>
          <p style="margin:8px 0 0 0;color:#6b7177;font-size:12px;">${c.sign}</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;

  return { html, subject: c.subject(input.excursionTitle) };
}

function row(label: string, value: string, mono = false): string {
  return `<tr>
    <td style="padding:10px 14px;border-bottom:1px solid #d8d8d5;width:130px;font-family:'JetBrains Mono',ui-monospace,monospace;font-size:10px;letter-spacing:0.18em;text-transform:uppercase;color:#6b7177;">${label}</td>
    <td style="padding:10px 14px;border-bottom:1px solid #d8d8d5;color:#1b1f23;${mono ? "font-family:'JetBrains Mono',ui-monospace,monospace;font-weight:600;" : ""}">${value}</td>
  </tr>`;
}

export async function sendBookingConfirmedEmail(
  input: ConfirmEmailInput,
): Promise<{ ok: boolean; reason?: string }> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM ?? "Sur41 <onboarding@resend.dev>";
  if (!apiKey) {
    return { ok: false, reason: "RESEND_API_KEY not set" };
  }
  try {
    const resend = new Resend(apiKey);
    const { html, subject } = renderHtml(input);
    const { error } = await resend.emails.send({
      from,
      to: input.customerEmail,
      subject,
      html,
    });
    if (error) return { ok: false, reason: error.message };
    return { ok: true };
  } catch (err) {
    return {
      ok: false,
      reason: err instanceof Error ? err.message : "unknown",
    };
  }
}
