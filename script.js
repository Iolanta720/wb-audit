function validateForm(fields) {
  const errors = {};
  if (!fields.name || !fields.name.trim()) {
    errors.name = 'Укажите имя';
  }
  if (!fields.contact || !fields.contact.trim()) {
    errors.contact = 'Укажите телефон или Telegram';
  }
  return { valid: Object.keys(errors).length === 0, errors };
}

const CONTACT_EMAIL = 'aminaexport1@gmail.com';

function buildEmailBody(fields) {
  return `Имя: ${fields.name}\nКонтакт: ${fields.contact}\nКомментарий: ${fields.comment || ''}`;
}

function buildMailtoEmail(fields) {
  const subject = encodeURIComponent(`Заявка на аудит от ${fields.name}`);
  const body = encodeURIComponent(buildEmailBody(fields));
  return `mailto:${CONTACT_EMAIL}?subject=${subject}&body=${body}`;
}

function buildFallbackMessage(fields) {
  return `Если почтовая программа не открылась, напишите на ${CONTACT_EMAIL} и приложите текст заявки:\n\n${buildEmailBody(fields)}`;
}

if (typeof module !== 'undefined') {
  module.exports = { validateForm, buildMailtoEmail, buildFallbackMessage };
}

if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('lead-form');
    if (!form) return;

    form.addEventListener('submit', (event) => {
      event.preventDefault();

      const fields = {
        name: form.elements.name.value,
        contact: form.elements.contact.value,
        comment: form.elements.comment.value
      };

      form.querySelectorAll('.field-error').forEach((el) => {
        el.textContent = '';
      });

      const result = validateForm(fields);

      if (!result.valid) {
        Object.keys(result.errors).forEach((field) => {
          const errorEl = form.querySelector(`.field-error[data-error-for="${field}"]`);
          if (errorEl) {
            errorEl.textContent = result.errors[field];
          }
        });
        return;
      }

      const status = document.getElementById('form-status');
      if (status) {
        status.textContent = buildFallbackMessage(fields);
        status.hidden = false;
      }

      window.location.href = buildMailtoEmail(fields);
    });
  });
}
