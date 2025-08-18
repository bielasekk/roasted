if (window._popupJsLoaded) {
  console.log("popup.js already loaded");
} else {
  window._popupJsLoaded = true;
  console.log("popup.js loaded first time");

  document.addEventListener("DOMContentLoaded", () => {
    const analyzeBtn = document.getElementById("analyzeBtn");
    const inputText = document.getElementById("inputText");
    const closeBtn = document.getElementById("closeResult");
    const resultText = document.getElementById("resultText");
    const resultIcon = document.getElementById("resultIcon");
    const resultBox = document.getElementById("resultBox");
    const reportText = document.getElementById("reportText");
    const submitReportBtn = document.getElementById("submitReportBtn");

    function showResult(message, isSafe) {

    resultText.innerHTML = message;

    if (isSafe) {
      resultIcon.innerHTML = `
        <svg class="safe-icon" xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="green" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <path d="M8 14s1.5 2 4 2 4-2 4-2"></path>
          <line x1="9" y1="9" x2="9.01" y2="9"></line>
          <line x1="15" y1="9" x2="15.01" y2="9"></line>
      </svg>`;
    } else {
      resultIcon.innerHTML = `
        <svg class="flagged-icon" xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="red" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <path d="M16 16s-1.5-2-4-2-4 2-4 2"></path>
          <line x1="9" y1="9" x2="9.01" y2="9"></line>
          <line x1="15" y1="9" x2="15.01" y2="9"></line>
        </svg>`;
    }

    resultBox.style.display = "block";
  }
  function formatLabel(label) {
      const labelMap = {
          age: "Age-based bullying",
          ethnicity: "Ethnic discrimination",
          gender: "Gender-based bullying",
          other_cyberbullying: "Other cyberbullying",
          religion: "Religious discrimination",
          not_cyberbullying: null  // handled separately
      };

      return labelMap[label] || "Cyberbullying";
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

  // Event listeners
  analyzeBtn.addEventListener("click", async () => {
      const text = inputText.value.trim();
      if (!text) {
          showResult("Please enter text to analyze", false);
          return;
      }

      try {
          const result = await analyzeText(text);
          if (result.error) {
              showResult(`Error: ${result.error}`, false);
          } else {
              const confidence = Math.max(...result.probabilities) * 100;
              const label = result.label.toLowerCase();

              if (label !== "not_cyberbullying") {
                  const formattedLabel = formatLabel(label);
                  const message = `This message may contain cyberbullying.<br>
                                  Consider rewording the message.<br>
                                  <strong>Type:</strong> ${formattedLabel}<br>
                                  <strong>Confidence:</strong> ${confidence.toFixed(1)}%<br>
                              `;
                  showResult(message, false);
              } else {
                  showResult(`This message appears safe.<br>
                              <strong>Confidence:</strong> ${confidence.toFixed(1)}%`, true);
              }
          }
      } catch (error) {
          showResult("Failed to analyze. Please try again later.", false);
          console.error("Full error:", error);
      }
  });

    closeBtn.addEventListener("click", () => {
      resultBox.style.display = "none";
    });

    function showNotification(message, isSuccess = true) {
    const box = document.getElementById("notificationBox");
    box.textContent = message;
    box.style.backgroundColor = isSuccess ? "#c8e6c9" : "#ffcdd2"; // light green or red
    box.style.color = isSuccess ? "#256029" : "#b71c1c";
    box.style.display = "block";

    setTimeout(() => {
      box.style.display = "none";
    }, 4000);
  }

    // Function to submit the report
    async function submitReport(reportTextValue, reporter, abusiveAuthor, url) {
      try {
        const res = await fetch("http://localhost:5001/report", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            reportTextValue,
            reporter,
            abusiveAuthor,
            url: url
          })
        });
        const data = await res.json();
        showNotification("Report submitted. Thank you!", true);
        document.getElementById("reportText").value = "";
        document.getElementById("abusiveAuthor").value = "";
        document.getElementById("username").value = "";
      } catch (err) {
        console.error(err);
        showNotification("Error submitting report.", false);
      }
    }

    submitReportBtn.addEventListener("click", async (event) => {
      event.preventDefault();
      const reportTextValue = reportText.value.trim();
      if (!reportTextValue) {
        showNotification("Please enter text to report.", false);
        return;
      }

      const usernameInput = document.getElementById("username").value.trim();
      const abusiveAuthor = document.getElementById("abusiveAuthor").value.trim();
      const reporter = usernameInput ? usernameInput : "Anonymous";

      chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        if (!tabs[0] || !tabs[0].url) {
          showNotification("Unable to determine platform.", false);
          return;
        }

        const url = tabs[0].url || "Unknown URL";
        submitReport(reportTextValue, reporter, abusiveAuthor, url);
      });
    });


    const learnMoreBtn = document.getElementById('learnMoreBtn');
    learnMoreBtn.addEventListener('click', function () {
      window.open('https://www.nationalchildrensalliance.org/cyberbullying/', '_blank');
    });
  });
}