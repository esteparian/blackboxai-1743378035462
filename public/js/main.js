document.addEventListener('DOMContentLoaded', () => {
  // Social login buttons
  document.getElementById('google-login').addEventListener('click', () => {
    window.location.href = '/auth/google';
  });

  document.getElementById('facebook-login').addEventListener('click', () => {
    window.location.href = '/auth/facebook';
  });

  // Geolocation handling
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      position => {
        document.getElementById('latitude').value = position.coords.latitude;
        document.getElementById('longitude').value = position.coords.longitude;
      },
      error => {
        console.error('Error getting location:', error);
      }
    );
  }

  // Report form submission
  const reportForm = document.getElementById('reportForm');
  if (reportForm) {
    reportForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const formData = new FormData(reportForm);
      
      try {
        const response = await fetch('/api/reports', {
          method: 'POST',
          body: formData
        });
        
        if (response.ok) {
          window.location.href = '/report-success.html';
        } else {
          alert('Error submitting report');
        }
      } catch (error) {
        console.error('Error:', error);
        alert('Error submitting report');
      }
    });
  }
});