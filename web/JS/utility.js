function getDaysInMonth(month) {
  const tempDate = new Date(); // <<< missing before
  tempDate.setMonth(month);
  const y = tempDate.getFullYear();
  const m = tempDate.getMonth();
  return new Date(y, m + 1, 0).getDate();
}

function getRecipeInfoFromID(id) {
  const recipes = JSON.parse(localStorage.getItem("recipes")) || {};
  return recipes[id];
}

async function sendMessageToChatGPT(userMessage, type) {
  try {
    const response = await fetch(
      "https://food-calendar-eight.vercel.app/api/chat",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: userMessage, type: type }),
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    return data.message;
  } catch (error) {
    console.error("Error communicating with serverless function:", error);
    throw error;
  }
}

export { getDaysInMonth, getRecipeInfoFromID, sendMessageToChatGPT };
