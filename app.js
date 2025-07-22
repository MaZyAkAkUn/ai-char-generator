
async function generatePersona() {
  const apiKey = document.getElementById("apiKeyInput").value;
  const model = document.getElementById("modelInput").value || "gpt-4";
  const name = document.getElementById("personaName").value;
  const role = document.getElementById("personaRole").value;
  const style = document.getElementById("personaStyle").value;
  const desc = document.getElementById("customDescription").value;
  const basePrompt = document.getElementById("basePrompt").value;

  const prompt = basePrompt
    .replace("{{name}}", name)
    .replace("{{role}}", role)
    .replace("{{style}}", style)
    .replace("{{desc}}", desc);

  const resultArea = document.getElementById("generatedOutput");
  resultArea.value = "⏳ Генерація персонажа...";

  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: model,
        messages: [
          { role: "system", content: "You are a character generator AI." },
          { role: "user", content: prompt }
        ],
        temperature: 0.9
      })
    });

    const data = await res.json();
    if (data.choices && data.choices.length > 0) {
      resultArea.value = data.choices[0].message.content.trim();
    } else {
      resultArea.value = "❌ Помилка: не отримано відповідь від моделі.";
    }

  } catch (err) {
    resultArea.value = `❌ Помилка запиту: ${err.message}`;
  }
}

async function generateAvatar() {
  const apiKey = document.getElementById("apiKeyInput").value;
  const personaYaml = document.getElementById("generatedOutput").value;

  if (!personaYaml || !apiKey) {
    alert("Спочатку згенеруй персонажа та введи API ключ.");
    return;
  }

  const descriptionPrompt = `
Ти — AI, що створює художні промпти для генерації аватарів персонажів.
На основі профілю нижче, створи один-єдиний англомовний опис аватару в стилі фотореалізму або digital-art:

Профіль:
${personaYaml}

Вивід:
Опис аватару англійською. Без YAML чи форматування.
`.trim();

  const avatarStatus = document.getElementById("avatarStatus");
  avatarStatus.textContent = "⏳ Генерація промпту для аватару...";

  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "gpt-4",
        messages: [
          { role: "system", content: "You generate prompts for DALL·E avatar generation." },
          { role: "user", content: descriptionPrompt }
        ],
        temperature: 0.8
      })
    });

    const data = await res.json();
    const avatarPrompt = data.choices[0].message.content.trim();
    avatarStatus.textContent = "🧠 Промпт готовий, надсилаємо на DALL·E...";

    const imgRes = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "dall-e-3",
        prompt: avatarPrompt,
        n: 1,
        size: "1024x1024"
      })
    });

    const imgData = await imgRes.json();
    if (imgData && imgData.data && imgData.data.length > 0) {
      const imgUrl = imgData.data[0].url;
      document.getElementById("avatarImage").src = imgUrl;
      avatarStatus.textContent = "✅ Аватар згенеровано";
    } else {
      avatarStatus.textContent = "❌ Не вдалося згенерувати аватар.";
    }

  } catch (err) {
    avatarStatus.textContent = "❌ Помилка при генерації аватару: " + err.message;
  }
}
