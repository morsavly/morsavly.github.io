document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('btn-calc-mortgage')
    .addEventListener('click', calculateMortgage);

  document.getElementById('btn-calc-savings')
    .addEventListener('click', calculateSavings);

  calculateMortgage();
  calculateSavings();
  applyLang('it');
});

document.getElementById('btn-reset-mortgage')
  .addEventListener('click', () => {
    document.getElementById('m-amount').value = '1000';
    document.getElementById('m-rate').value = '0.1';
    document.getElementById('m-term').value = '1';
    document.getElementById('mortgage-results').classList.add('results-hidden');
    document.getElementById('mortgage-results').style.display = '';

    calculateMortgage();
  }
);

document.getElementById('btn-reset-savings')
  .addEventListener('click', () => {
    document.getElementById('s-monthly').value = '5';
    document.getElementById('s-initial').value = '1';
    document.getElementById('s-return').value = '1';
    document.getElementById('s-term').value = '1';
    document.getElementById('s-inflation').value = '0';
    document.getElementById('savings-results').classList.add('results-hidden');
    document.getElementById('savings-results').style.display = '';

    calculateSavings();
  }
);

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
