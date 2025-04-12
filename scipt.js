// JavaScript: script.js (for code submission)
// ========================
function submitCode() {
    const code = document.getElementById('codeInput').value;
    fetch('http://localhost:5000/review', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({ code })
    })
    .then(response => response.json())
    .then(data => {
      document.getElementById('result').innerText = `Verdict: ${data.verdict}\n\nFeedback:\n${data.feedback}`;
    })
    .catch(error => console.error('Error:', error));
  }
  
  // ========================
  // JavaScript: auth.js (for login & signup)
  // ========================
  function signup() {
    const email = document.getElementById('signupEmail').value;
    const password = document.getElementById('signupPassword').value;
    fetch('http://localhost:5000/signup', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({ email, password })
    })
    .then(res => res.json())
    .then(data => alert(data.message))
    .catch(error => console.error('Error:', error));
  }
  
  function login() {
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    fetch('http://localhost:5000/login', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({ email, password })
    })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        window.location.href = 'index.html';
      } else {
        alert(data.message);
      }
    })
    .catch(error => console.error('Error:', error));
  }
  