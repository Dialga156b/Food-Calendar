export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }
  console.log(req.body);
  const userMessage = req.body.message;
  const type = req.body.type;

  console.log("Received user message:", userMessage);
  const key = process.env.OPENAI_KEY;
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
  console.log("getAIInstructions full");
  switch (type) {
    case "ingredients":
      return {
        model: "gpt-4.1-mini",
        messages: [
          {
            role: "system",
            content: "generate a shopping list in structured JSON format",
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
                    'Generate a consolidated shopping list of RAW ingredients. Each ingredient must appear only once; if an ingredient is repeated, combine the quantities into a single entry. Treat similar items as the same (e.g., "olive oil" and "extra virgin olive oil" should be merged). Exclude insignificant ingredients such as small amounts of spices (like salt or pepper) or water. Use your judgment to determine what is essential.',
                  items: {
                    type: "object",
                    properties: {
                      item_name: {
                        type: "string",
                        description:
                          "Name of the ingredient. exclude non-alphabet characters such as hyphens or commas. this should be the RAW version of whatever ingredient it is. NOT COOKED!",
                      },
                      quantity: {
                        type: "string",
                        description:
                          "The amount of this item needed, that are STORE BUYABLE AND RAW. this should be bags, boxes, jars, etc. NO MEASUREMENTS! (ex: 2 bags of flour, or one bott of wine, or three stalks of celery) if the item it to taste or open-ended, respond with '-'.",
                      },
                      category: {
                        type: "string",
                        description:
                          "string describing the type of ingredient: dairy, produce, meat, spice, other",
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
