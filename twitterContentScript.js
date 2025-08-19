console.log("X.com post observer loaded");

// ====== Create a proper stylesheet ======
const style = document.createElement("style");
style.textContent = `
  #postResultBox {
    margin: 8px 0 !important;
    padding: 16px !important;
    background-color: rgba(244, 33, 46, 0.1) !important;
    color: rgb(244, 33, 46) !important;
    font-family: "TwitterChirp", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif !important;
    font-size: 14px !important;
    border: 1px solid rgba(244, 33, 46, 0.2) !important;
    border-radius: 12px !important;
    line-height: 1.4 !important;
    box-sizing: border-box !important;
    display: none; /* NO !important here - we'll control this via JS */
  }
  
  #postResultMessage {
    margin-bottom: 16px !important;
    font-weight: 400 !important;
    line-height: 1.4 !important;
    color: rgb(244, 33, 46) !important;
    font-family: inherit !important;
  }
  
  #rewriteBtn, #postAnywayBtn {
    padding: 8px 16px !important;
    border-radius: 18px !important;
    cursor: pointer !important;
    font-size: 14px !important;
    font-weight: 700 !important;
    font-family: inherit !important;
    min-width: 80px !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    box-sizing: border-box !important;
  }
  
  #rewriteBtn {
    border: 1px solid rgb(207, 217, 222) !important;
    background: #fff !important;
    color: rgb(15, 20, 25) !important;
  }
  
  #postAnywayBtn {
    border: none !important;
    background: rgb(244, 33, 46) !important;
    color: #fff !important;
  }
`;
document.head.appendChild(style);

// ====== Create inline result box (hidden by default) ======
const postResultBox = document.createElement("div");
postResultBox.id = "postResultBox";
postResultBox.innerHTML = `
  <div id="postResultMessage"></div>
  <div style="display:flex; justify-content:flex-end; gap:12px; align-items:center;">
    <button id="rewriteBtn">Rewrite</button>
    <button id="postAnywayBtn">Post anyway</button>
  </div>
`;

let postResultMessage, rewriteBtn, postAnywayBtn;

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
        return result; 
    } catch (error) {
        console.error("ML Check Error:", error);
        return { label: "not_cyberbullying", probabilities: 1 };
    }
}

// ====== Observe DOM for post button ======
const observer = new MutationObserver(() => {
    const postButton = document.querySelector('button[data-testid="tweetButtonInline"]');
    const composer = document.querySelector('div[role="textbox"]')?.closest("div");

    if (postButton && composer && !postButton.dataset.listenerAdded) {
        postButton.dataset.listenerAdded = true;
        console.log("Post button found, adding click listener");

        if (!document.getElementById("postResultBox")) {
            composer.parentNode.insertBefore(postResultBox, composer.nextSibling);
            postResultMessage = document.getElementById("postResultMessage");
            rewriteBtn = document.getElementById("rewriteBtn");
            postAnywayBtn = document.getElementById("postAnywayBtn");
        }

        async function handleClick(e) {
            e.preventDefault();
            e.stopImmediatePropagation();

            const postBox = document.querySelector('div[role="textbox"]');
            const postText = postBox ? postBox.innerText : "";

            const result = await runMLCheck(postText);
            const flagged = result.label !== "not_cyberbullying";

            if (flagged) {
                const confidence = Math.max(...result.probabilities) * 100;
                const labelMap = {
                    age: "Age-based bullying",
                    ethnicity: "Ethnic discrimination",
                    gender: "Gender-based bullying",
                    other_cyberbullying: "Other cyberbullying",
                    religion: "Religious discrimination",
                };
                const formattedLabel = labelMap[result.label] || "Cyberbullying";

                postResultMessage.innerHTML = `
                    This post may contain cyberbullying.
                    Type: <strong>${formattedLabel}</strong>.<br>
                    Confidence: ${confidence.toFixed(1)}%
                    Please consider rewriting or choose to post anyway.
                `;
                postResultBox.style.display = "block";
                postResultBox.style.setProperty('display', 'block', 'important');

                rewriteBtn.onclick = () => {
                    postResultBox.style.display = "none";
                    postBox.focus();
                };

                postAnywayBtn.onclick = () => {
                    postResultBox.style.display = "none";
                    postButton.removeEventListener("click", handleClick);
                    postButton.click();
                };
            } else {
                postButton.removeEventListener("click", handleClick);
                postButton.click();
            }
        }

        postButton.addEventListener("click", handleClick);
    }
});

// Start observing the document body
observer.observe(document.body, { childList: true, subtree: true });
