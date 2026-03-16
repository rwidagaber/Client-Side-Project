var loginForm = document.getElementById('login-form');
var message = document.getElementById('form-message');

if (loginForm) {
    loginForm.addEventListener('submit', function (event) {
        event.preventDefault();

        var email = loginForm.email.value.trim();
        var password = loginForm.password.value.trim();

        message.className = 'message';

        if (!email || !password) {
            message.classList.add('error');
            message.textContent = 'Please enter both email and password.';
            return;
        }

        if (!email.includes('@')) {
            message.classList.add('error');
            message.textContent = 'Please enter a valid email address.';
            return;
        }

        message.classList.add('success');
        message.textContent = 'Login successful. Redirecting to home page...';

        setTimeout(function () {
            window.location.href = '/HTMLs/index.html';
        }, 800);
    });
}
