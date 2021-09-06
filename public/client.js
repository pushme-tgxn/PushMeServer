console.log("hello world :o");

// our default array of dreams
const tokens = [];

// define variables that reference elements on our page
const dreamsList = document.getElementById("requests");
const dreamsForm = document.forms[0];

const dreamInput = dreamsForm.elements;

const sendPush = async (secretKey, title, body, intent, data = {}) => {
  let div = document.createElement("div");
  div.className = "request pending";
  div.textContent = `POST /webhook/push/${secretKey}`;
  dreamsList.prepend(div);

  let ul = document.createElement("ul");
  div.append(ul);

  const pushPayload = { title, body, intent, data };

  let requestLi = document.createElement("li");
  requestLi.className = "list-request";
  requestLi.textContent = JSON.stringify(pushPayload);
  ul.append(requestLi);

  const rawResponse = await fetch(`/webhook/push/${secretKey}`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(pushPayload),
  });
  const content = await rawResponse.json();

  let responseLi = document.createElement("li");
  responseLi.className = "list-response";
  responseLi.textContent = JSON.stringify(content);
  ul.append(responseLi);

  div.className = "request";

  console.log(content);
};

// a helper function that creates a list item for a given dream
const appendNewDream = function (dream) {
  const newListItem = document.createElement("li");
  newListItem.innerHTML = dream;

  dreamsList.appendChild(newListItem);
};

// iterate through every dream and add it to our page
tokens.forEach(function (dream) {
  appendNewDream(dream);
});

dreamsForm.onsubmit = function (event) {
  event.preventDefault();

  const secretKey = dreamInput["secretKey"].value;
  const title = dreamInput["title"].value;
  const body = dreamInput["body"].value;
  const intent = dreamInput["intent"].value;
  const data = JSON.parse(dreamInput["data"].value);

  sendPush(secretKey, title, body, intent, data);

  // reset form
  dreamInput["title"].focus();
};
