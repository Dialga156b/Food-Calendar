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
  //gpt 4.1 mini isn't a rule follower. very rebellious! need LOTS of instructions to make it work properly.
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
        model: "GPT-4o",
        temperature: 0.2,
        messages: [
          {
            role: "system",
            content: "Generate a recipe in structured JSON format.",
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
                  description: "Basic name of the recipe.",
                },
                ingredients: {
                  type: "array",
                  description: "List of ingredients.",
                  items: {
                    type: "object",
                    properties: {
                      name: {
                        type: "string",
                        description: "Ingredient name",
                      },
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
                  description: "Cooking time in minutes",
                },
                prep_time_minutes: {
                  type: "number",
                  description: "Prep time in minutes",
                },
                instructions: {
                  type: "array",
                  description: "Step-by-step instructions",
                  items: {
                    type: "object",
                    properties: {
                      description: {
                        type: "string",
                        description: "Instruction step",
                      },
                    },
                    required: ["description"],
                    additionalProperties: false,
                  },
                },
                calories: {
                  type: "string",
                  description: "Calories per serving",
                },
                servings: {
                  type: "string",
                  description: "Number of servings",
                },
                desc: {
                  type: "string",
                  description:
                    "Short description (under 10 words or 72 characters)",
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
