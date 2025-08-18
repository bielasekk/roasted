console.log("X.com post observer loaded");

// ====== Create inline result box (hidden by default) ======
const postResultBox = document.createElement("div");
postResultBox.id = "postResultBox";
postResultBox.style.cssText = `
  margin: 8px 0;
  padding: 12px;
  background-color: rgba(244, 33, 46, 0.1);
  color: rgb(244, 33, 46);
  font-family: "TwitterChirp", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  font-size: 14px;
  border: 1px solid rgba(244, 33, 46, 0.2);
  border-radius: 12px;
  display: none;
  line-height: 1.3;
`;
postResultBox.innerHTML = `
  <div id="postResultMessage" style="margin-bottom:12px; font-weight:400;"></div>
  <div style="display:flex; justify-content:flex-end; gap:8px; align-items:center;">
    <button id="rewriteBtn" style="padding:6px 6px; border:1px solid rgb(207, 217, 222); border-radius:18px; background:#fff; cursor:pointer; font-size:14px; font-weight:700; color:rgb(15, 20, 25); display:flex; align-items:center; justify-content:center;">
      Rewrite
    </button>
    <button id="postAnywayBtn" style="padding:6px 6px; border:none; border-radius:18px; background:rgb(244, 33, 46); color:#fff; cursor:pointer; font-size:14px; font-weight:700; display:flex; align-items:center; justify-content:center;">
      Post anyway
    </button>
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
