console.log("X.com post observer loaded");

// ====== Create a floating result box ======
const postResultBox = document.createElement("div");
postResultBox.id = "postResultBox";
postResultBox.style.cssText = `
  position: fixed !important;
  bottom: 20px !important;
  right: 20px !important;
  max-width: 320px !important;
  padding: 16px !important;
  background-color: #ffffff !important;
  color: #000000 !important;
  font-family: Arial, sans-serif !important;
  font-size: 14px !important;
  border: 1px solid #ccc !important;
  border-radius: 8px !important;
  box-shadow: 0 4px 8px rgba(0,0,0,0.2) !important;
  z-index: 999999 !important;
  display: none;
`;
postResultBox.innerHTML = `
  <div id="postResultMessage"></div>
  <div style="margin-top:10px; text-align:right;">
    <button id="rewriteBtn" style="margin-right:8px; padding:4px 8px;">Rewrite</button>
    <button id="postAnywayBtn" style="padding:4px 8px;">Post Anyway</button>
  </div>
`;
document.body.appendChild(postResultBox);

const postResultMessage = document.getElementById("postResultMessage");
const rewriteBtn = document.getElementById("rewriteBtn");
const postAnywayBtn = document.getElementById("postAnywayBtn");

// ====== Run ML check ======
async function runMLCheck(postText) {
    try {
        const response = await fetch("http://localhost:5001/predict", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text: postText })
        });

        const result = await response.json();
        console.log("ML Check Result:", result);
        return result; // { label: "...", confidence: 0.92 }
    } catch (error) {
        console.error("ML Check Error:", error);
        return { label: "not_cyberbullying", confidence: 1 };
    }
}

// ====== Observe DOM for post button ======
const observer = new MutationObserver(() => {
    const postButton = document.querySelector('button[data-testid="tweetButtonInline"]');
    if (postButton && !postButton.dataset.listenerAdded) {
        postButton.dataset.listenerAdded = true;
        console.log("Post button found, adding click listener");

        async function handleClick(e) {
            e.preventDefault(); // always stop posting first
            e.stopImmediatePropagation();

            const postBox = document.querySelector('div[role="textbox"]');
            const postText = postBox ? postBox.innerText : "";

            const result = await runMLCheck(postText);
            const flagged = result.label !== "not_cyberbullying";

            if (flagged) {
                const confidence = (result.confidence || 0) * 100;
                const labelMap = {
                    age: "Age-based bullying",
                    ethnicity: "Ethnic discrimination",
                    gender: "Gender-based bullying",
                    other_cyberbullying: "Other cyberbullying",
                    religion: "Religious discrimination",
                };
                const formattedLabel = labelMap[result.label] || "Cyberbullying";

                postResultMessage.innerHTML = `
                    ⚠️ <strong>This post may contain cyberbullying.</strong><br><br>
                    <strong>Type:</strong> ${formattedLabel}<br>
                    <strong>Confidence:</strong> ${confidence.toFixed(1)}%<br><br>
                    Please consider rewording or choose to post anyway.
                `;
                postResultBox.style.display = "block";

                // Rewrite button → just close warning and do nothing
                rewriteBtn.onclick = () => {
                    postResultBox.style.display = "none";
                    postBox.focus();
                };

                // Post Anyway button → re-fire real click but skip ML listener
                postAnywayBtn.onclick = () => {
                    postResultBox.style.display = "none";
                    postButton.removeEventListener("click", handleClick);
                    postButton.click(); // this time it goes directly to Twitter's native handler
                };
            } else {
                // If safe, let post go through
                postButton.removeEventListener("click", handleClick);
                postButton.click();
            }
        }

        postButton.addEventListener("click", handleClick);
    }
});

// Start observing the document body
observer.observe(document.body, { childList: true, subtree: true });
