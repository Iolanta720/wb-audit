const test = require('node:test');
const assert = require('node:assert/strict');
const { validateForm, buildMailtoEmail, buildFallbackMessage, buildFormPayload, buildSuccessMessage, buildSendErrorMessage } = require('../script.js');

test('buildFormPayload: передаёт три поля, пустой комментарий не превращается в undefined', () => {
  assert.deepEqual(buildFormPayload({ name: 'Иоланта', contact: '@iolanta_wb' }), { name: 'Иоланта', contact: '@iolanta_wb', comment: '' });
});

test('buildSuccessMessage: сообщает, что заявка отправлена', () => {
  assert.match(buildSuccessMessage(), /отправлена/);
});

test('buildSendErrorMessage: при сбое показывает email и данные заявки, чтобы их не потерять', () => {
  const message = buildSendErrorMessage({ name: 'Иоланта', contact: '@iolanta_wb', comment: 'Ассортимент 40 SKU' });
  assert.match(message, /aminaexport1@gmail\.com/);
  assert.match(message, /@iolanta_wb/);
  assert.match(message, /Ассортимент 40 SKU/);
});

test('validateForm: пустые обязательные поля дают ошибки по каждому', () => {
  const result = validateForm({ name: '   ', contact: '', comment: '' });
  assert.equal(result.valid, false);
  assert.ok(result.errors.name);
  assert.ok(result.errors.contact);
});

test('validateForm: заполненные name и contact проходят без ошибок, comment необязателен', () => {
  const result = validateForm({ name: 'Иоланта', contact: '@iolanta_wb', comment: '' });
  assert.equal(result.valid, true);
  assert.deepEqual(result.errors, {});
});

test('buildMailtoEmail: спецсимволы и переносы строк в комментарии кодируются', () => {
  const link = buildMailtoEmail({ name: 'Иоланта', contact: 'test@example.com', comment: 'Строка1\nСтрока2 & "кавычки" 100%' });
  assert.match(link, /^mailto:/);
  assert.ok(!link.includes('\n'));
  assert.ok(link.includes(encodeURIComponent('Строка1\nСтрока2 & "кавычки" 100%')));
});

test('buildFallbackMessage: содержит email получателя и данные заявки читаемым текстом', () => {
  const message = buildFallbackMessage({ name: 'Иоланта', contact: '@iolanta_wb', comment: 'Ассортимент 40 SKU' });
  assert.match(message, /aminaexport1@gmail\.com/);
  assert.match(message, /Иоланта/);
  assert.match(message, /@iolanta_wb/);
  assert.match(message, /Ассортимент 40 SKU/);
});
