document.addEventListener("DOMContentLoaded", () => {
  const analyzeBtn = document.getElementById("analyzeBtn");
  const inputText = document.getElementById("inputText");
  const resultBox = document.getElementById("resultBox");
  const resultText = document.getElementById("resultText");
  const closeBtn = document.getElementById("closeResult");

  function showResult(message) {
    resultText.textContent = message;
    resultBox.style.display = "block";
  }

async function analyzeText(text) {
    try {
        const response = await fetch('http://localhost:5001/product', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ text })
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`HTTP ${response.status}: ${errorText}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Analysis error:', error);
        throw error;
    }
}

// Update your click handler
analyzeBtn.addEventListener("click", async () => {
    const text = inputText.value.trim();
    if (!text) {
        showResult("Please enter text to analyze");
        return;
    }

    try {
        const result = await analyzeText(text);
        if (result.error) {
            showResult(`Error: ${result.error}`);
        } else {
            const confidence = Math.max(...result.probabilities) * 100;
            const message = result.label.includes('cyberbullying') 
                ? `⚠️ ${result.label} (${confidence.toFixed(1)}% confidence)`
                : `✅ Safe (${confidence.toFixed(1)}% confidence)`;
            showResult(message);
        }
    } catch (error) {
        showResult("Failed to analyze. Is the server running?");
        console.error("Full error:", error);
    }
});

  closeBtn.addEventListener("click", () => {
    resultBox.style.display = "none";
  });
});