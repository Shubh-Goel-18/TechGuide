document.getElementById('user-icon').addEventListener('click', function() {
    const dropdownMenu = document.getElementById('dropdown-menu');
    dropdownMenu.classList.toggle('show');
});

window.addEventListener('click', function(e) {
    const dropdownMenu = document.getElementById('dropdown-menu');
    if (!e.target.matches('#user-icon') && !e.target.matches('.user-profile-icon')) {
        if (dropdownMenu.classList.contains('show')) {
            dropdownMenu.classList.remove('show');
        }
    }
});

document.addEventListener('DOMContentLoaded', () => {
    document.body.classList.add('show');

    // Check if the user is a guest and disable logout link if so
    const username = document.querySelector('.username').textContent;
    const logoutLink = document.getElementById('logout-link');

    if (username === 'Guest') {
        logoutLink.addEventListener('click', (event) => {
            event.preventDefault();
            alert('You need to log in first to use this feature.');
        });
    }

    document.querySelectorAll('.alert-login').forEach(element => {
        element.addEventListener('click', (event) => {
            if (username === 'Guest') {
                event.preventDefault();
                alert('Please log in to access this feature.');
            }
        });
    });
});
// Back-to-Top Button Functionality
const backToTopButton = document.getElementById('back-to-top');

window.addEventListener('scroll', () => {
if (window.scrollY > 300) {
backToTopButton.classList.add('show');
} else {
backToTopButton.classList.remove('show');
}
});

backToTopButton.addEventListener('click', () => {
window.scrollTo({
top: 0,
behavior: 'smooth'
});
});
