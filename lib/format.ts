export function formatPrice(ars: number): string {
  return new Intl.NumberFormat("es-AR").format(ars);
}
