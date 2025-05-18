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
    const args = JSON.parse(
      data.choices?.[0]?.message?.function_call?.arguments || false
    );
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
  //... modify instructions based on method
  console.log("getAIInstructions full");
  switch (type) {
    case "ingredients":
      return {
        model: "gpt-4.1-mini",
        messages: [
          {
            role: "system",
            content: `You are an expert assistant helping users generate shopping lists from recipes. Respond only in JSON using the required schema. 
Every ingredient must:
- Be raw (not cooked or processed)
- Use whole, store-buyable units (e.g., '1 bag', '2 jars', '3 stalks')
- NOT include the item name in the quantity
- NOT use measurements like grams, cups, tbsp, or ml
- Include a valid 'category': one of 'produce', 'meat', 'dairy', 'spice', or 'other'
- Exclude minor items like salt, pepper, or water
All fields must be filled; no empty or partial responses.`,
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
                    "A list of unique, raw ingredients for a shopping list with required metadata.",
                  items: {
                    type: "object",
                    properties: {
                      item_name: {
                        type: "string",
                        description:
                          "The raw ingredient name. No symbols, commas, or cooked forms.",
                      },
                      quantity: {
                        type: "string",
                        description:
                          "Only whole, store-buyable, raw units. Do not include the item name. Formats like '2 bags', '1 bottle', '3 stalks'. No fractions or measurements like grams or cups.",
                      },
                      minimum_amount: {
                        type: "string",
                        description:
                          "A precise string value representing the absolute minimum raw amount needed, e.g., '400g', '2 liters'. This may differ from store-buyable quantity.",
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
        model: "gpt-4.1-mini",
        messages: [
          {
            role: "system",
            content: "generate a recipe in structured JSON format",
          },
          {
            role: "user",
            content: userMessage,
          },
        ],
        functions: [
          {
            name: "recipe",
            description: "Structured recipe generator",
            parameters: {
              type: "object",
              properties: {
                recipe_name: {
                  type: "string",
                  description:
                    "The most basic, commonly known name of the recipe.",
                },
                ingredients: {
                  type: "array",
                  description: "List of ingredients.",
                  items: {
                    type: "object",
                    properties: {
                      name: { type: "string", description: "Ingredient name" },
                      amount: {
                        type: "string",
                        description: "Amount required",
                      },
                    },
                    required: ["name", "amount"],
                    additionalProperties: false,
                  },
                },
                cook_time_minutes: {
                  type: "number",
                  description: "Cooking time in minutes, as a number only",
                },
                prep_time_minutes: {
                  type: "number",
                  description: "Prep time in minutes, as a number only",
                },
                instructions: {
                  type: "array",
                  description: "Step-by-step instructions",
                  items: {
                    type: "object",
                    properties: {
                      description: {
                        type: "string",
                        description: "Step description",
                      },
                    },
                    required: ["description"],
                    additionalProperties: false,
                  },
                },
                calories: {
                  type: "string",
                  description: "Calories per serving, as a number only",
                },
                servings: {
                  type: "string",
                  description: "Number of servings, as a number only",
                },
                desc: {
                  type: "string",
                  description:
                    "Short description (under 10 words OR 72 characters)",
                },
              },
              required: [
                "recipe_name",
                "ingredients",
                "cook_time_minutes",
                "prep_time_minutes",
                "instructions",
                "calories",
                "servings",
                "desc",
              ],
              additionalProperties: false,
            },
          },
        ],
        function_call: { name: "recipe" },
      };
  }
}
