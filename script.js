// اسکرول صاف برای ناوبری
document.querySelectorAll('a').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
      e.preventDefault();
      document.querySelector(this.getAttribute('href')).scrollIntoView({
          behavior: 'smooth'
      });
  });
});

// فرم تماس
document.getElementById('contact-form').addEventListener('submit', function(event) {
  event.preventDefault();
  document.getElementById('form-response').textContent = 'Vielen Dank für Ihre Nachricht!';
});
