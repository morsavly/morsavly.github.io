let savingsChart = null;
let lastSavingsData = null;

const SAVINGS_RULES = {
  's-monthly': { min: 5, max: Infinity, unit: '€' },
  's-initial': { min: 0, max: Infinity, unit: '€' },
  's-return': { min: 1, max: 25, unit: '%' },
  's-term': { min: 1, max: 30, unit: ' yrs' },
  's-inflation': { min: 0, max: 20, unit: '%' },
};

function readField(id, isInt = false) {
  const raw = document.getElementById(id).value.trim();
  if (raw === '') return NaN;
  return isInt ? parseInt(raw, 10) : parseFloat(raw);
}

function showFieldError(inputId, msg) {
  const input = document.getElementById(inputId);
  const field = input.closest('.form-field');
  input.classList.add('input-error');
  let errEl = field.querySelector('.field-error');
  if (!errEl) {
    errEl = document.createElement('span');
    errEl.className = 'field-error';
    field.appendChild(errEl);
  }
  errEl.textContent = msg;
}

function clearFieldError(inputId) {
  const input = document.getElementById(inputId);
  const field = input.closest('.form-field');
  input.classList.remove('input-error');
  field.querySelector('.field-error')?.remove();
}

function validateSavings(values) {
  let valid = true;
  const fields = [
    { id: 's-monthly', value: values.monthly },
    { id: 's-initial', value: values.initial },
    { id: 's-return', value: values.annReturn },
    { id: 's-term', value: values.years },
    { id: 's-inflation', value: values.inflation },
  ];
  fields.forEach(({ id, value }) => {
    const { min, max, unit } = SAVINGS_RULES[id];
    const msg = isFinite(max)
      ? `${min}${unit} – ${max}${unit}`
      : `Min ${min}${unit}`;
    if (isNaN(value) || value < min || value > max) {
      showFieldError(id, msg);
      valid = false;
    } else {
      clearFieldError(id);
    }
  });
  return valid;
}

function buildSavingsSchedule(monthly, initial, annualReturn, years) {
  const rMonthly = annualReturn / 12 / 100;
  let capital = initial;
  let cumContrib = initial;
  const rows = [];

  for (let year = 1; year <= years; year++) {
    for (let m = 0; m < 12; m++) {
      capital = capital * (1 + rMonthly) + monthly;
      cumContrib += monthly;
    }
    rows.push({
      year,
      contributed: Math.round(cumContrib),
      interest: Math.round(capital - cumContrib),
      capital: Math.round(capital),
    });
  }
  return rows;
}

function renderSavingsKPIs(rows, years, inflation) {
  const last = rows[rows.length - 1];
  const realCap = Math.round(last.capital / Math.pow(1 + inflation / 100, years));
  const pct = Math.round(last.interest / last.capital * 100);

  document.getElementById('savings-kpis').innerHTML = `
    <div class="kpi accent">
      <div class="kpi-label">${t('savings.kpi.capital')}</div>
      <div class="kpi-value">${fmt(last.capital)}</div>
      <div class="kpi-sub">${t('kpi.sub.years')(years)}</div>
    </div>
    <div class="kpi">
      <div class="kpi-label">${t('savings.kpi.contributed')}</div>
      <div class="kpi-value">${fmt(last.contributed)}</div>
    </div>
    <div class="kpi success">
      <div class="kpi-label">${t('savings.kpi.interest')}</div>
      <div class="kpi-value">${fmt(last.interest)}</div>
      <div class="kpi-sub">${t('kpi.sub.pct')(pct)}</div>
    </div>
    <div class="kpi warn">
      <div class="kpi-label">${t('savings.kpi.real')} (${fmtN(inflation)}%)</div>
      <div class="kpi-value">${fmt(realCap)}</div>
    </div>
  `;
}

function renderSavingsTable(rows) {
  document.getElementById('savings-body').innerHTML = rows.map(row => `
    <tr${row.year === rows.length ? ' style="font-weight:600"' : ''}>
      <td>${row.year}</td>
      <td>${fmt(row.contributed)}</td>
      <td style="color:var(--color-success)">${fmt(row.interest)}</td>
      <td>${fmt(row.capital)}</td>
    </tr>
  `).join('');
}

function isDarkTheme() {
  return document.documentElement.getAttribute('data-theme') === 'dark';
}
function getGridColor() {
  return isDarkTheme() ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)';
}
function getAxisColor() {
  return isDarkTheme() ? 'rgba(200,200,200,0.75)' : 'rgba(120,120,120,0.9)';
}

function renderSavingsChart(rows) {
  lastSavingsData = rows;
  const ctx = document.getElementById('savings-chart').getContext('2d');
  if (savingsChart) savingsChart.destroy();

  savingsChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: rows.map(r => r.year),
      datasets: [
        {
          label: t('savings.kpi.contributed'),
          data: rows.map(r => r.contributed),
          backgroundColor: 'rgba(1,105,111,0.35)',
          stack: 's',
        },
        {
          label: t('savings.kpi.interest'),
          data: rows.map(r => r.interest),
          backgroundColor: 'rgba(1,105,111,0.80)',
          stack: 's',
        },
      ],
    },
    options: {
      responsive: true,
      plugins: { legend: { position: 'bottom' } },
      scales: {
        y: {
          beginAtZero: true,
          grid: { color: getGridColor() },
          title: { display: true, text: t('chart.axis.eur'), color: getAxisColor(), font: { size: 11 } },
          ticks: { callback: v => fmt(v), color: getAxisColor() },
        },
        x: {
          grid: { color: getGridColor() },
          title: { display: true, text: t('chart.axis.year'), color: getAxisColor(), font: { size: 11 } },
          ticks: { maxTicksLimit: 10, color: getAxisColor() },
        },
      },
    },
  });
}

function calculateSavings() {
  const monthly = readField('s-monthly');
  const initial = readField('s-initial');
  const annReturn = readField('s-return');
  const years = readField('s-term', true);
  const inflation = readField('s-inflation');

  if (!validateSavings({ monthly, initial, annReturn, years, inflation })) return;

  const rows = buildSavingsSchedule(monthly, initial, annReturn, years);

  renderSavingsKPIs(rows, years, inflation);
  renderSavingsTable(rows);
  renderSavingsChart(rows);

  document.getElementById('savings-results').classList.remove('results-hidden');
}

window.addEventListener('themechange', () => {
  if (!lastSavingsData) return;
  if (savingsChart) { savingsChart.destroy(); savingsChart = null; }
  renderSavingsChart(lastSavingsData);
});