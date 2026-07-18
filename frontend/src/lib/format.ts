const rupeeFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

const numberFormatter = new Intl.NumberFormat("en-IN");

export function formatRupees(amount: number): string {
  return rupeeFormatter.format(amount);
}

export function formatQuantity(quantity: number): string {
  return numberFormatter.format(quantity);
}
