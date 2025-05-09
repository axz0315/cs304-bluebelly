"use strict";
// functions handling nav bar
function openNav() {
  const nav = document.getElementById("nav");
  const openButton = document.querySelector(".openNav");

  nav.style.width = "250px"; // Open the navbar
  openButton.style.display = "none"; // Hide the button
}

function closeNav() {
  const nav = document.getElementById("nav");
  const openButton = document.querySelector(".openNav");

  nav.style.width = "0"; // Close the navbar
  openButton.style.display = "block"; // Show the button
}

  // signup + login button event listener

  document.addEventListener("DOMContentLoaded", () => {
    const loginButton = document.querySelector(".login");
    if (loginButton) {
        loginButton.addEventListener("click", () => {
            // Redirect to the login page
            window.location.href = "/login";
        });
    }
});

// sign up page + modal
document.addEventListener("DOMContentLoaded", () => {
  var modal = document.getElementById("signup-modal"); // The modal element
  var signupButton = document.getElementById("signup-btn"); // The "Sign Up" button
  var span = document.querySelectorAll(".close")[0]; // The close button inside the modal

  // When the user clicks on the button, open the modal
signupButton.onclick = function() {
    modal.style.display = "block";
}

span.onclick = function() {
    modal.style.display = "none";
}

  // Close the modal when clicking outside of it
  window.onclick = function(event) {
    if (event.target == modal) {
      modal.style.display = "none";
    }
  }
});

// edit review button
document.addEventListener("DOMContentLoaded", () => {
    const editButtons = document.querySelectorAll(".edit-button");
    const modal = document.getElementById("edit-modal");
    const closeModal = document.querySelector(".close");
    const editForm = document.getElementById("edit-review-form");

    // Form fields
    const restaurantField = document.getElementById("edit-restaurant");
    const addressField = document.getElementById("edit-address");
    const ratingField = document.getElementById("edit-rating");
    const textField = document.getElementById("edit-text");

    // Open the modal when an edit button is clicked
    editButtons.forEach(button => {
        button.addEventListener("click", () => {
            // Populate the form with the review data
            restaurantField.value = button.dataset.restaurant;
            addressField.value = button.dataset.address;
            ratingField.value = button.dataset.rating;
            textField.value = button.dataset.text;

            // Set the form's action to the correct route
            editForm.action = `/review/edit/${button.dataset.reviewId}`;

            // Show the modal
            modal.style.display = "block";
        });
    });

    // Close the modal when the close button is clicked
    closeModal.addEventListener("click", () => {
        modal.style.display = "none";
    });

    // Close the modal when clicking outside the modal content
    window.addEventListener("click", (event) => {
        if (event.target === modal) {
            modal.style.display = "none";
        }
    });
});
