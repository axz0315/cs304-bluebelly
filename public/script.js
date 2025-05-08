
// functions handling nav bar
function openNav() {
    document.getElementById("nav").style.width = "250px"; /* Adjust width as needed */
    document.querySelector("main").style.marginLeft = "250px"; /* Adjust margin to match navbar width */
  }

  function closeNav() {
    document.getElementById("nav").style.width = "0";
    document.querySelector("main").style.marginLeft= "0";
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
