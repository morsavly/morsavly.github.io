document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('btn-calc-mortgage')
    .addEventListener('click', calculateMortgage);

  document.getElementById('btn-calc-savings')
    .addEventListener('click', calculateSavings);

  calculateMortgage();
  calculateSavings();
  applyLang('it');
});

document.getElementById('btn-reset-mortgage').addEventListener('click', () => {
  ['m-amount', 'm-rate', 'm-term'].forEach(id => {
    document.getElementById(id).value = '';
  });
  document.getElementById('mortgage-results').classList.add('results-hidden');
  document.getElementById('mortgage-results').style.display = '';
});

document.getElementById('btn-reset-savings').addEventListener('click', () => {
  ['s-monthly', 's-initial', 's-return', 's-term', 's-inflation'].forEach(id => {
    document.getElementById(id).value = '';
  });
  document.getElementById('savings-results').classList.add('results-hidden');
  document.getElementById('savings-results').style.display = '';
});

document.addEventListener('click', (e) => {
  const btn = e.target.closest('.step-btn');
  if (!btn) return;

  const input = document.getElementById(btn.dataset.target);
  if (!input) return;

  const step = parseFloat(input.step || 1);
  const min = input.min !== '' ? parseFloat(input.min) : -Infinity;
  const max = input.max !== '' ? parseFloat(input.max) : Infinity;
  const value = parseFloat(input.value || 0);

  const next = btn.classList.contains('step-up') ? value + step : value - step;
  input.value = Math.min(max, Math.max(min, next));
  input.dispatchEvent(new Event('input', { bubbles: true }));
  input.dispatchEvent(new Event('change', { bubbles: true }));
});
