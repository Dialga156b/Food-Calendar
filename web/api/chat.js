export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }
  console.log(req.body);
  const userMessage = req.body.message; // <-- FIXED HERE
  const type = req.body.type;

  console.log("Received user message:", userMessage);
  const key = process.env.OPENAI_KEY;
  console.log(key);
  if (!key) {
    return res
      .status(500)
      .json({ error: "OPENAI_KEY not set in environment." });
  }

  try {
    const instructions = getAIInstructions(type, userMessage); // now it's an object
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(instructions), // properly stringified
    });

    const data = await response.json();
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
  console.log("getAIInstructions full");
  switch (type) {
    case "ingredients":
      return {
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "generate a shopping list in structured JSON format",
          },
          {
            role: "user",
            content: userMessage, // <-- using the real user message
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
                  description: "List of ingredients required for the shopping.",
                  items: {
                    type: "object",
                    properties: {
                      item_name: {
                        type: "string",
                        description: "Name of the ingredient.",
                      },
                      quantity: {
                        type: "string",
                        description:
                          "The number of store-buyable units (bags,boxes,etc) needed. (ex: 3 whole white onions, or 2 bags of flour)",
                      },
                      minimum_amount: {
                        type: "string",
                        description:
                          "A string stating the minimum amount of this item needed.",
                      },
                      category: {
                        type: "string",
                        description:
                          "string describing the type of ingredient (produce, meat, vegetable, spices)",
                      },
                    },
                    required: ["item_name", "quantity", "minimum_amount"],
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
      break;
    default:
      return {
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "generate a recipe in structured JSON format",
          },
          {
            role: "user",
            content: userMessage, // <-- using the real user message
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
      break;
  }
}
