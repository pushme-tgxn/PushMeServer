// client-side js
// run by the browser each time your view template is loaded

console.log("hello world :o");

// our default array of dreams
const tokens = [];

// define variables that reference elements on our page
const dreamsList = document.getElementById("tokens");
const dreamsForm = document.forms[0];

const dreamInput = dreamsForm.elements;

const sendPush = async (title, desc, cat, data = {}) => {
  const rawResponse = await fetch('/push/all', {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ title, desc, cat, data  })
  });
  const content = await rawResponse.json();

  console.log(content);
};


// a helper function that creates a list item for a given dream
const appendNewDream = function(dream) {
  const newListItem = document.createElement("li");
  newListItem.innerHTML = dream;
  
  
  dreamsList.appendChild(newListItem);
};

// iterate through every dream and add it to our page
tokens.forEach(function(dream) {
  appendNewDream(dream);
});

dreamsForm.onsubmit = function(event) {
  event.preventDefault();
  
  const title = dreamInput["title"].value;
  const desc = dreamInput["desc"].value;
  const category = dreamInput["category"].value;
  const data = JSON.parse(dreamInput["data"].value);
  
  
  console.log();
  
  sendPush(title, desc, category, data);
  
  // reset form
  dreamInput["title"].focus();
};
