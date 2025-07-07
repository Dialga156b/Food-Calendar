export default async function handler(req, res) {
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }
  console.log(req.body);
  const userMessage = req.body.message;
  const type = req.body.type;

  console.log("Received user message:", userMessage); //debug
  const key = process.env.OPENAI_KEY; // get openai key from secure vercel servers
  console.log(key);
  if (!key) {
    return res
      .status(500)
      .json({ error: "OPENAI_KEY not set in environment." });
  }
  //OLD api key was exposed in github history. this comment is for a new redeployment
  try {
    const instructions = getAIInstructions(type, userMessage); // now it's an object
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(instructions),
    });
    const data = await response.json();
    console.log(data);

    let args;
    try {
      const raw =
        data.choices?.[0]?.message?.function_call?.arguments ??
        data.choices?.[0]?.message?.content ??
        "{}";
      args = JSON.parse(raw);
    } catch (err) {
      console.error("Failed to parse response:", err);
      return res.status(500).json({
        error: "AI response was not valid JSON.",
        detail: err.message,
        raw: data.choices?.[0]?.message,
      });
    }

    console.log(data.choices?.[0]?.message);
    console.log(args);
    return res.status(200).json({ message: args });
  } catch (error) {
    console.error("Error calling OpenAI:", error);
    return res
      .status(500)
      .json({ error: "Server error", detail: error.message });
  }
}

function getAIInstructions(type, userMessage) {
  switch (type) {
    case "ingredients":
      return {
        model: "gpt-4.1-mini",
        temperature: 0.2,
        messages: [
          {
            role: "system",
            content: `You are an assistant generating structured shopping lists. Follow these strict rules:
            - Output only structured JSON using the required schema.
            - Each item must be RAW and store-buyable. No cooked or processed foods.
            - Quantities must be formatted as full descriptive units like: '2 bags', '1 bottle', '3 stalks'.
            - Do NOT include the ingredient name in the quantity.
            - NEVER return a plain number like '1' or '8' — it must include the unit.
            - Do NOT use units like grams, ml, cups, tbsp, teaspoons, etc.
            - Exclude minor items like salt, pepper, or water.
            - Categorize each item using one of: 'produce', 'meat', 'dairy', 'spice', or 'other'.
            - All required fields must be provided. No empty values.`,
          },
          {
            role: "user",
            content: userMessage,
          },
        ],
        functions: [
          {
            name: "shopping_list",
            parameters: {
              type: "object",
              properties: {
                ingredients: {
                  type: "array",
                  description:
                    "A list of unique raw ingredients for a shopping list with descriptive quantities and category info.",
                  items: {
                    type: "object",
                    properties: {
                      item_name: {
                        type: "string",
                        description:
                          "The raw name of the ingredient (e.g., 'onion', 'flour'). No symbols, commas, or cooked/prepared variants.",
                      },
                      quantity: {
                        type: "string",
                        description:
                          "A descriptive string with only whole, store-buyable units. Do not include the item name. Do not use measurements like grams, cups, or ml. Valid examples: '2 bags', '1 bottle', '3 stalks'. NEVER return a plain number like '1' or '8'.",
                      },
                      category: {
                        type: "string",
                        enum: ["produce", "meat", "dairy", "spice", "other"],
                        description:
                          "Ingredient category. Must be one of: produce, meat, dairy, spice, other.",
                      },
                    },
                    required: [
                      "item_name",
                      "quantity",
                      "minimum_amount",
                      "category",
                    ],
                    additionalProperties: false,
                  },
                },
              },
              required: ["ingredients"],
              additionalProperties: false,
            },
          },
        ],
        function_call: { name: "shopping_list" },
      };

    default:
      return {
        model: "gpt-4o-mini-search-preview",
        messages: [
          {
            role: "system",
            content: `You are a helpful assistant that returns only valid JSON using the following schema:
{
  "recipe_name": string,
  "ingredients": [{ "name": string, "amount": string }],
  "cook_time_minutes": number,
  "prep_time_minutes": number,
  "instructions": [{ "description": string }],
  "calories": number (per serving),
  "servings": number,
  "desc": string
}

Strict rules:
- Only respond with valid, parsable JSON.
- Do not include any explanation, markdown, or extra text.
- Use double quotes around all keys and values.
- Do not include trailing commas.`,
          },
          {
            role: "user",
            content: userMessage,
          },
        ],
      };
  }
}
