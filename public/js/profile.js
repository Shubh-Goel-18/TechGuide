document.getElementById('profile-update-form').addEventListener('submit', function(event) {
    event.preventDefault();
    const username = document.getElementById('username').value;

    fetch('/update-profile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username })
    })
    .then(response => response.json())
    .then(data => alert(data.message + ", Refresh page to see changes"))
    .catch(error => console.error('Error:', error));
  });

  document.getElementById('profile-icon-form').addEventListener('submit', function(event) {
    event.preventDefault();
    const selectedIcon = document.querySelector('.icon-selector img.selected').dataset.icon;

    fetch('/update-icon', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ icon: selectedIcon })
    })
    .then(response => response.json())
    .then(data => alert(data.message + ", Refresh the page to see changes"))
    .catch(error => console.error('Error:', error));
  });

  document.querySelectorAll('.icon-selector img').forEach(img => {
    img.addEventListener('click', function() {
      document.querySelectorAll('.icon-selector img').forEach(i => i.classList.remove('selected'));
      this.classList.add('selected');
    });
  });