import crypto from "crypto";

const PHONEPE_API_URL = "https://api.phonepe.com/apis/hermes";

function sha256(data: string): string {
  return crypto.createHash("sha256").update(data).digest("hex");
}

export async function initiatePayment({
  merchantTransactionId,
  amount,
  callbackUrl,
  redirectUrl,
}: {
  merchantTransactionId: string;
  amount: number;
  callbackUrl: string;
  redirectUrl: string;
}) {
  const merchantId = process.env.PHONEPE_MERCHANT_ID!;
  const saltKey = process.env.PHONEPE_SECRET_KEY!;
  const saltIndex = process.env.PHONEPE_SALT_INDEX || "1";

  const payload = {
    merchantId,
    merchantTransactionId,
    merchantUserId: merchantId,
    amount: Math.round(amount * 100), // Convert to paise
    redirectUrl,
    redirectMode: "REDIRECT",
    callbackUrl,
    paymentInstrument: {
      type: "PAY_PAGE",
    },
  };

  const base64Payload = Buffer.from(JSON.stringify(payload)).toString("base64");
  const checksum = sha256(base64Payload + "/pg/v1/pay" + saltKey) + "###" + saltIndex;

  const response = await fetch(`${PHONEPE_API_URL}/pg/v1/pay`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-VERIFY": checksum,
    },
    body: JSON.stringify({ request: base64Payload }),
  });

  const data = await response.json();
  return data;
}

export async function checkPaymentStatus(merchantTransactionId: string) {
  const merchantId = process.env.PHONEPE_MERCHANT_ID!;
  const saltKey = process.env.PHONEPE_SECRET_KEY!;
  const saltIndex = process.env.PHONEPE_SALT_INDEX || "1";

  const path = `/pg/v1/status/${merchantId}/${merchantTransactionId}`;
  const checksum = sha256(path + saltKey) + "###" + saltIndex;

  const response = await fetch(`${PHONEPE_API_URL}${path}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "X-VERIFY": checksum,
      "X-MERCHANT-ID": merchantId,
    },
  });

  const data = await response.json();
  return data;
}
