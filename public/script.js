
// functions handling nav bar
function openNav() {
    document.getElementById("nav").style.width = "250px"; /* Adjust width as needed */
    document.querySelector("main").style.marginLeft = "250px"; /* Adjust margin to match navbar width */
  }

  function closeNav() {
    document.getElementById("nav").style.width = "0";
    document.querySelector("main").style.marginLeft= "0";
  }

  // login button event listener

  document.addEventListener("DOMContentLoaded", () => {
    const loginButton = document.querySelector(".login");
    if (loginButton) {
        loginButton.addEventListener("click", () => {
            // Redirect to the login page
            window.location.href = "/login.html";
        });
    }
});
