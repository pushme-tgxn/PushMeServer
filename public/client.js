// client-side js
// run by the browser each time your view template is loaded

console.log("hello world :o");

// our default array of dreams
const tokens = [];

// define variables that reference elements on our page
const dreamsList = document.getElementById("tokens");
const dreamsForm = document.forms[0];

const dreamInput = dreamsForm.elements;

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

// listen for the form to be submitted and add a new dream when it is
dreamsForm.onsubmit = function(event) {
  // stop our form submission from refreshing the page
  event.preventDefault();

  // get dream value and add it to the list
  tokens.push(dreamInput.value);
  appendNewDream(dreamInput.value);

  // reset form
  dreamInput.value = "";
  dreamInput.focus();
};
