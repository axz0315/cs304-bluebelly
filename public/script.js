
// functions handling nav bar
function openNav() {
    document.getElementById("nav").style.width = "250px"; /* Adjust width as needed */
    document.querySelector("main").style.marginLeft = "250px"; /* Adjust margin to match navbar width */
  }

  function closeNav() {
    document.getElementById("nav").style.width = "0";
    document.querySelector("main").style.marginLeft= "0";
  }
