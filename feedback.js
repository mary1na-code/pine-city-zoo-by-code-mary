// feedback.js — client-side handler for the feedback form
document.addEventListener('DOMContentLoaded', function () {
  const form = document.querySelector('.feedback-form');
  if (!form) return;

  const submitBtn = form.querySelector('button[type="submit"]');

  // status element (aria-live for screen readers)
  const status = document.createElement('div');
  status.className = 'form-status';
  status.setAttribute('role', 'status');
  status.setAttribute('aria-live', 'polite');
  status.style.marginTop = '0.6rem';
  form.appendChild(status);

  form.addEventListener('submit', async function (e) {
    e.preventDefault();

    // let the browser handle required validation first
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    const data = {
      rating: form.rating?.value || '0',
      message: form.message?.value.trim() || '',
      submittedAt: new Date().toISOString()
    };

    // disable submit while sending
    submitBtn.disabled = true;
    const originalLabel = submitBtn.textContent;
    submitBtn.textContent = 'Sending...';

    try {
      // If a form action is configured, try to POST JSON to it.
      if (form.action) {
        const resp = await fetch(form.action, {
          method: form.method || 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });
        if (!resp.ok) throw new Error('Network error');
        status.textContent = 'Thanks — feedback sent.';
        status.style.color = 'green';
      } else {
        // No backend configured: save to localStorage as a fallback demo
        const key = 'pine-feedback';
        const existing = JSON.parse(localStorage.getItem(key) || '[]');
        existing.push(data);
        localStorage.setItem(key, JSON.stringify(existing));
        // small simulated delay for UX
        await new Promise(r => setTimeout(r, 500));
        status.textContent = 'Thanks — feedback saved locally (no server configured).';
        status.style.color = 'green';
      }

      form.reset();
    } catch (err) {
      console.error(err);
      status.textContent = 'Error sending feedback. Please try again later.';
      status.style.color = 'crimson';
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = originalLabel;
    }
  });
});

/* Optional helper: expose a function to read saved feedback (for demo/debug)
   Usage in console: JSON.parse(localStorage.getItem('pine-feedback')) */
