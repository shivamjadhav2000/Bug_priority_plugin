function init() {
  predict();
}

const Baseurl = "https://bug-priority-plugin.onrender.com";

function getIconHTML(label) {
  switch (label) {
    case "Blocker":
      return `<i class="fa-solid fa-fire" style="color: #bf2600;"></i>`;
    case "Critical":
      return `<i class="fa-solid fa-triangle-exclamation" style="color: #de350b;"></i>`;
    case "Major":
      return `<i class="fa-solid fa-circle-exclamation" style="color: #ffab00;"></i>`;
    case "Minor":
      return `<i class="fa-solid fa-circle-info" style="color: #6554c0;"></i>`;
    case "Trivial":
    default:
      return `<i class="fa-solid fa-circle-question" style="color: #8993a4;"></i>`;
  }
}

function predict() {
  AP.context.getContext(function (response) {
    const issue_key = response.jira.issue.key;

    AP.request("/rest/api/3/issue/" + issue_key)
      .then(res => res.body)
      .then(body => {
        const parsed = JSON.parse(body);
        const issue_type = parsed.fields.issuetype.name;
        let desc = "";
        try {
          desc = parsed.fields.description?.content?.[0]?.content?.[0]?.text || "";
        } catch (e) {
          console.warn("No description found.");
        }
        const title = parsed.fields.summary;

        return fetch(`${Baseurl}/predict`, {
          method: "POST",
          body: JSON.stringify({ issue_type, desc, title }),
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          mode: "cors"
        });
      })
      .then(res => res.json())
      .then(data => {
        const { label, confidence } = data;
        const resultDiv = document.getElementById("result");
        resultDiv.innerHTML = "";

        const box = document.createElement("div");
        box.className = `priority-box ${label}`;
        box.innerHTML = `${getIconHTML(label)} Predicted Priority: ${label}`;
        resultDiv.appendChild(box);

        // Tooltip
        document.getElementById("icon-span").innerHTML = `Confidence: ${(confidence * 100).toFixed(1)}%`;
      })
      .catch(err => {
        console.error("PREDICT ERROR:", err);
        const resultDiv = document.getElementById("result");
        resultDiv.innerHTML = `<div class="priority-box Trivial"><i class="fa-solid fa-circle-question"></i> Prediction failed. Try again.</div>`;
        document.getElementById("icon-span").innerHTML = ``;
      });
  });
}
