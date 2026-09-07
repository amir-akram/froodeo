import crypto from 'crypto';

export const razorpayInstance = {
  keyId: process.env.RAZORPAY_KEY_ID,
  keySecret: process.env.RAZORPAY_KEY_SECRET,
};

// Verify Razorpay signature
export function verifyRazorpaySignature(
  orderId: string,
  paymentId: string,
  signature: string
): boolean {
  const message = `${orderId}|${paymentId}`;
  const hmac = crypto
    .createHmac('sha256', razorpayInstance.keySecret || '')
    .update(message)
    .digest('hex');

  return hmac === signature;
}

// Create Razorpay order via API
export async function createRazorpayOrder(amount: number, receipt: string) {
  const options = {
    amount: amount * 100, // amount in paise
    currency: 'INR',
    receipt,
  };

  const response = await fetch('https://api.razorpay.com/v1/orders', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${Buffer.from(
        `${razorpayInstance.keyId}:${razorpayInstance.keySecret}`
      ).toString('base64')}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(options),
  });

  if (!response.ok) {
    throw new Error('Failed to create Razorpay order');
  }

  return response.json();
}

// Refund a captured payment. amountPaise omitted = full refund.
// idempotency_key lets a retried admin click reuse the same refund
// attempt instead of double-refunding if the first request's response
// was lost (network blip, admin double-click, etc).
export async function createRazorpayRefund(
  razorpayPaymentId: string,
  amountPaise?: number,
  idempotencyKey?: string
) {
  const body: { amount?: number; speed?: string } = {};
  if (amountPaise !== undefined) body.amount = amountPaise;

  const headers: Record<string, string> = {
    Authorization: `Basic ${Buffer.from(
      `${razorpayInstance.keyId}:${razorpayInstance.keySecret}`
    ).toString('base64')}`,
    'Content-Type': 'application/json',
  };
  if (idempotencyKey) headers['X-Razorpay-Idempotency'] = idempotencyKey;

  const response = await fetch(
    `https://api.razorpay.com/v1/payments/${razorpayPaymentId}/refund`,
    { method: 'POST', headers, body: JSON.stringify(body) }
  );

  if (!response.ok) {
    const errBody = await response.json().catch(() => null);
    throw new Error(errBody?.error?.description || 'Failed to create Razorpay refund');
  }

  return response.json();
}