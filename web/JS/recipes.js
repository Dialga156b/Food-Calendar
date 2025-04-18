async function genRecipe() {
  const input = document.getElementById("rdesc").value;
  const apiKey = "sk-proj-CcIx3pVjLwo6LLJDMbXPT3BlbkFJ5rxPVXzScwmHOZw43TOC";
  /* 
    If i were to make this project public i would change this file to
    be in the backend rather than frontend. Chatgpt API keys are expensive!
  */
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
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
          content: input,
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
                description: "The most basic, commonly known name of the recipe.",
              },
              ingredients: {
                type: "array",
                description: "List of ingredients.",
                items: {
                  type: "object",
                  properties: {
                    name: { type: "string", description: "Ingredient name" },
                    amount: { type: "string", description: "Amount required" },
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
              notes: { type: "string", description: "Simple description of the food in less than 10 words." },
            },
            required: [
              "recipe_name",
              "ingredients",
              "cook_time_minutes",
              "prep_time_minutes",
              "instructions",
              "calories",
              "servings",
              "notes",
            ],
            additionalProperties: false,
          },
        },
      ],
      function_call: { name: "recipe" },
    }),
  });

  const data = await response.json();

  const args = JSON.parse(
    //return recipe if response is good
    data.choices?.[0]?.message?.function_call?.arguments || "{}"
  );

  console.log("Recipe JSON:", args);
}
