import WebApp from '@twa-dev/sdk';

export type StarsPaymentResult = 'paid' | 'cancelled' | 'failed' | 'pending';

export function openTelegramStarsInvoice(invoiceUrl: string): Promise<StarsPaymentResult> {
  return new Promise((resolve) => {
    if (!WebApp.openInvoice) {
      resolve('failed');
      return;
    }

    WebApp.openInvoice(invoiceUrl, (status) => {
      if (status === 'paid') {
        resolve('paid');
        return;
      }
      if (status === 'cancelled') {
        resolve('cancelled');
        return;
      }
      if (status === 'failed') {
        resolve('failed');
        return;
      }
      resolve('pending');
    });
  });
}
