function validateForm(fields) {
  const errors = {};
  if (!fields.name || !fields.name.trim()) {
    errors.name = 'Укажите имя';
  }
  if (!fields.contact || !fields.contact.trim()) {
    errors.contact = 'Укажите телефон или Telegram';
  }
  if (fields.consent === false) {
    errors.consent = 'Нужно согласие на обработку данных';
  }
  return { valid: Object.keys(errors).length === 0, errors };
}

const CONTACT_EMAIL = 'aminaexport1@gmail.com';

// Адрес формы из личного кабинета Formspree. Если очистить его, заявка
// будет уходить через почтовую программу посетителя (mailto).
const FORM_ENDPOINT = 'https://formspree.io/f/xqpajvza';

function buildEmailBody(fields) {
  return `Имя: ${fields.name}\nКонтакт: ${fields.contact}\nКомментарий: ${fields.comment || ''}`;
}

function buildMailtoEmail(fields) {
  const subject = encodeURIComponent(`Заявка на аудит от ${fields.name}`);
  const body = encodeURIComponent(buildEmailBody(fields));
  return `mailto:${CONTACT_EMAIL}?subject=${subject}&body=${body}`;
}

function buildFormPayload(fields) {
  return { name: fields.name, contact: fields.contact, comment: fields.comment || '' };
}

function buildSuccessMessage() {
  return 'Спасибо! Заявка отправлена. Я свяжусь с вами по указанному контакту.';
}

function buildSendErrorMessage(fields) {
  return `Не удалось отправить заявку. Напишите на ${CONTACT_EMAIL} и приложите текст заявки:\n\n${buildEmailBody(fields)}`;
}

function buildFallbackMessage(fields) {
  return `Сейчас откроется почтовая программа с готовым письмом. Если этого не произошло, отправьте текст ниже на ${CONTACT_EMAIL}:\n\n${buildEmailBody(fields)}`;
}

if (typeof module !== 'undefined') {
  module.exports = { validateForm, buildMailtoEmail, buildFallbackMessage, buildFormPayload, buildSuccessMessage, buildSendErrorMessage };
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
        comment: form.elements.comment.value,
        consent: form.elements.consent.checked
      };

      form.querySelectorAll('.field-error').forEach((el) => {
        el.textContent = '';
      });
      form.querySelectorAll('input').forEach((el) => el.removeAttribute('aria-invalid'));

      const result = validateForm(fields);

      if (!result.valid) {
        Object.keys(result.errors).forEach((field) => {
          const errorEl = form.querySelector(`.field-error[data-error-for="${field}"]`);
          if (errorEl) {
            errorEl.textContent = result.errors[field];
          }
          form.elements[field].setAttribute('aria-invalid', 'true');
        });
        return;
      }

      const status = document.getElementById('form-status');
      const showStatus = (text) => {
        if (status) {
          status.textContent = text;
          status.hidden = false;
        }
      };

      if (!FORM_ENDPOINT) {
        showStatus(buildFallbackMessage(fields));
        window.location.href = buildMailtoEmail(fields);
        return;
      }

      const button = form.querySelector('button[type="submit"]');
      button.disabled = true;
      fetch(FORM_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(buildFormPayload(fields))
      })
        .then((response) => {
          if (!response.ok) throw new Error('HTTP ' + response.status);
          form.reset();
          showStatus(buildSuccessMessage());
        })
        .catch(() => {
          showStatus(buildSendErrorMessage(fields));
        })
        .finally(() => {
          button.disabled = false;
        });
    });
  });
}
