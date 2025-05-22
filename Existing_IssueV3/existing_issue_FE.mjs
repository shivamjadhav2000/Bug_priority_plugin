function init() {
    predict();
}

const Baseurl = "https://bug-priority-plugin.onrender.com";

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
                    console.warn("No description found or invalid structure.");
                }
                const title = parsed.fields.summary;

                const issueData = JSON.stringify({
                    issue_type,
                    desc,
                    title
                });

                return fetch(`${Baseurl}/predict`, {
                    method: "POST",
                    body: issueData,
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    mode: "cors"
                });
            })
            .then(res => res.json())
            .then(data => {
                const { label, confidence, priorities } = data;
                const resultDiv = document.getElementById("result");

                // Clear previous
                resultDiv.innerHTML = "";

                // Create priority card
                const priorityBox = document.createElement("div");
                priorityBox.className = `priority-box ${label}`;
                priorityBox.textContent = `Bug Priority: ${label}`;
                resultDiv.appendChild(priorityBox);

                // Update icon + tooltip
                const iconURL = (label === "Blocker" || label === "Critical")
                    ? `${Baseurl}/warning`
                    : `${Baseurl}/correct`;

                const iconImg = document.getElementById("icon");
                const tooltipText = document.querySelector("#icon-span span");

                iconImg.src = iconURL;
                tooltipText.innerHTML = `<strong>${label}</strong> priority detected`;
            })
            .catch(err => {
                console.error("PREDICT ERROR:", err);
                const resultDiv = document.getElementById("result");
                resultDiv.innerHTML = `<div class="priority-box Minor">Prediction failed. Please try again later.</div>`;
            });
    });
}
