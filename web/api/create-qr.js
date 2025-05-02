function setCORSHeaders(res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
}

export default async function handler(req, res) {
  setCORSHeaders(res);

  if (req.method === "OPTIONS") {
    return res.status(200).end(); // Preflight response
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Use POST" });
  }

  const BITLY_TOKEN = process.env.BITLY_TOKEN;
  const { long_url } = req.body;

  if (!BITLY_TOKEN) {
    return res.status(500).json({ error: "BITLY_TOKEN is missing" });
  }
  if (!long_url) {
    return res.status(400).json({ error: "Missing long_url" });
  }

  try {
    const bitlink_id = await shorten(long_url, BITLY_TOKEN);
    const qr_code_url = await createQRCode(bitlink_id, BITLY_TOKEN);
    return res.status(200).json({
      bitlink_id,
      bitlink_url: `https://${bitlink_id}`,
      qr_code_url,
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
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
    const text = await res.text();
    console.error("Response Error:", text);
    throw new Error(text);
  }

  const data = await res.json();
  return data.id; // bitlink_id
}

async function createQRCode(bitlink_id, token) {
  const res = await fetch("https://api-ssl.bitly.com/v4/qr-codes", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      bitlink_id,
      // Optionally add: title, download, etc.
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    console.error("Response Error:", text);
    throw new Error(text);
  }

  const data = await res.json();
  return data.qr_code?.link;
}
