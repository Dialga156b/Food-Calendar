export default async function handler(req, res) {
  const userMessage = req.body.message; // <-- FIXED HERE
  console.log("Received user message:", userMessage);
  const key = process.env.OPENAI_KEY;
  console.log(key);
  if (!key) {
    return res
      .status(500)
      .json({ error: "OPENAI_KEY not set in environment." });
  }

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
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
                        description: "Step description",
                      },
                    },
                    required: ["description"],
                    additionalProperties: false,
                  },
                },
                calories: { type: "string", description: "Total calories" },
                servings: { type: "string", description: "Number of servings" },
                desc: {
                  type: "string",
                  description: "Short description (under 10 words)",
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
      }),
    });

    const data = await response.json().choices[0].message;
    console.log(data);
    return res.status(200).json(data);
  } catch (error) {
    console.error("Error calling OpenAI:", error);
    return res
      .status(500)
      .json({ error: "Server error", detail: error.message });
  }
}
