import type { StarsPaymentResult } from './starsPayment.web';

export type { StarsPaymentResult };

export async function openTelegramStarsInvoice(_invoiceUrl: string): Promise<StarsPaymentResult> {
  return 'failed';
}
