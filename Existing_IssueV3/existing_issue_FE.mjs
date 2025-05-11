function init() {
    predict();
}

var span_check = 0;
const Baseurl = "https://bug-priority-plugin.onrender.com";
/*SEND ISSUE DATA TO NODE.JS BACK-END AND RECEIVE PREDICTION THEN REFORMAT AND DISPLAY*/
function predict() {
    const Baseurl = "https://bug-priority-plugin.onrender.com";

    AP.context.getContext(function (response) {
        const issue_key = response.jira.issue.key;

        AP.request("/rest/api/3/issue/" + issue_key)
            .then(res => res.body)
            .then(body => {
                const parsed = JSON.parse(body);
                const issue_type = parsed.fields.issuetype.name;
                const desc = parsed.fields.description.content[0].content[0].text;
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

                // Update result table
                const table = document.getElementById("result");
                table.innerHTML = `
                    <tr><th>Predicted Label</th><td>${label}</td></tr>
                    <tr><th>Confidence</th><td>${(confidence * 100).toFixed(2)}%</td></tr>
                `;

                Object.entries(priorities).forEach(([key, value]) => {
                    const percent = (parseFloat(value) * 100).toFixed(2);
                    table.innerHTML += `<tr><th>${key}</th><td>${percent}%</td></tr>`;
                });

                // Choose icon based on severity
                const iconURL = (label === "Blocker" || label === "Critical")
                    ? `${Baseurl}/warning`
                    : `${Baseurl}/correct`;

                // Update tooltip and icon
                const iconSpan = document.getElementById("icon-span");
                iconSpan.innerHTML = `
                    <img id="icon" src="${iconURL}" />
                    <span>
                        <b>${label}</b> priority<br>
                        Confidence: ${(confidence * 100).toFixed(2)}%
                    </span>
                `;
            })
            .catch(err => {
                console.error("PREDICT ERROR:", err);
                const table = document.getElementById("result");
                table.innerHTML = `<tr><td colspan="2">Prediction failed. Please try again later.</td></tr>`;
            });
    });
}

