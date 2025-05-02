function setCORSHeaders(res) {
  res.setHeader("Access-Control-Allow-Origin", "*"); // Adjust for production
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
}

async function shorten(long_url, token) {
  const res = await fetch("https://api-ssl.bitly.com/v4/shorten", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      long_url,
      domain: "bit.ly",
    }),
  });

  if (!res.ok) {
    const error = await res.text();
    console.error("Shorten error:", error);
    throw new Error(error);
  }

  const data = await res.json();
  return data.id; // e.g., "bit.ly/abc123"
}

async function createQRCode(bitlink_id, token) {
  const group_guid = process.env.BITLY_GUID;
  const res = await fetch("https://api-ssl.bitly.com/v4/qr-codes", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      title: "Default QR Code",
      group_guid: group_guid,
      destination: { bitlink_id: bitlink_id },
    }),
  });

  if (!res.ok) {
    const error = await res.text();
    console.error("QR Code error:", error);
    throw new Error(error);
  }

  const data = await res.json();
  console.log(data);
  return data.qrcode_id;
}

export default async function handler(req, res) {
  setCORSHeaders(res);

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { long_url } = req.body;
  const BITLY_TOKEN = process.env.BITLY_TOKEN;

  if (!long_url) {
    return res.status(400).json({ error: "Missing long_url" });
  }
  if (!BITLY_TOKEN) {
    return res
      .status(500)
      .json({ error: "BITLY_TOKEN not set in environment" });
  }

  try {
    const bitlink_id = await shorten(long_url, BITLY_TOKEN);
    const qr_code_id = await createQRCode(bitlink_id, BITLY_TOKEN);
    const res = await fetch(
      `https://api-ssl.bitly.com/v4/qr-codes/${qr_code_id}/image?format=`,
      {
        headers: {
          Authorization: `Bearer ${BITLY_TOKEN}`,
          Accept: "image/png+xml",
        },
      }
    );
    console.log(res);
    return res.status(500);
  } catch (err) {
    console.error("Handler error:", err.message);
    return res.status(500).json({ error: err.message });
  }
}
