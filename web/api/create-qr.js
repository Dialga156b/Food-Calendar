function setCORSHeaders(res) {
  //not used. just for debugging on local port (vscode live servers)
  res.setHeader("Access-Control-Allow-Origin", "*");
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
  return data.id;
}

async function createQRCode(bitlink_id, token) {
  const group_guid = process.env.BITLY_GUID; // get ID from secure Vercel servers
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
      render_customizations: { dot_pattern_type: "horizontal" }, // stylize the code!
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
  //setCORSHeaders(res);

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
    //if both requests are OK, give the go-ahead and generate the QR code image
    const imageRes = await fetch(
      `https://api-ssl.bitly.com/v4/qr-codes/${qr_code_id}/image?format=png`,
      {
        headers: {
          Authorization: `Bearer ${BITLY_TOKEN}`,
          Accept: "image/png",
        },
      }
    );

    if (!imageRes.ok) {
      const text = await imageRes.text();
      console.error("QR-IMG error:", text);
      throw new Error(text);
    }
    //the qr code image actually returns a blob so we have to a bunch of extra crap
    //blobs also son't save between sessions, so a new img has to be generated
    const imageBuffer = Buffer.from(await imageRes.arrayBuffer());

    res.setHeader("Content-Type", "image/png");
    res.setHeader(
      "Content-Disposition",
      `inline; filename="${qr_code_id}.png"`
    );
    res.status(200).end(imageBuffer);
  } catch (err) {
    console.error("Handler error:", err.message);
    return res.status(500).json({ error: err.message });
  }
}
