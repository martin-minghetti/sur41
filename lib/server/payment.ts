import { MercadoPagoConfig, Preference } from "mercadopago";

export type PaymentMode = "simulated" | "production";

export function getPaymentMode(): PaymentMode {
  const m = process.env.PAYMENT_MODE;
  return m === "production" ? "production" : "simulated";
}

export function getSiteUrl(): string {
  return (
    process.env.NEXT_PUBLIC_SITE_URL ??
    process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : "http://localhost:3000"
  );
}

export type PreferenceInput = {
  bookingId: string;
  excursionTitle: string;
  bookingDate: string;
  people: number;
  totalArs: number;
  customerEmail: string;
  lang: "es" | "en" | "pt-br";
  successUrl: string;
  failureUrl: string;
};

export async function createMpPreference(
  input: PreferenceInput,
): Promise<{ id: string; initPoint: string }> {
  const token = process.env.MP_ACCESS_TOKEN;
  if (!token) {
    throw new Error("MP_ACCESS_TOKEN is required for production payment mode");
  }
  const client = new MercadoPagoConfig({ accessToken: token });
  const preference = new Preference(client);
  const created = await preference.create({
    body: {
      external_reference: input.bookingId,
      payer: { email: input.customerEmail },
      items: [
        {
          id: input.bookingId,
          title: `${input.excursionTitle} · ${input.bookingDate}`,
          quantity: input.people,
          unit_price: Math.round(input.totalArs / input.people),
          currency_id: "ARS",
        },
      ],
      back_urls: {
        success: input.successUrl,
        failure: input.failureUrl,
        pending: input.successUrl,
      },
      auto_return: "approved",
      notification_url: `${getSiteUrl()}/api/mp/webhook`,
      statement_descriptor: "SUR41",
    },
  });
  if (!created.id || !created.init_point) {
    throw new Error("MP preference response incomplete");
  }
  return { id: created.id, initPoint: created.init_point };
}
