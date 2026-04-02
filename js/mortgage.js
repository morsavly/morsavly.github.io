let mortgageLineChart = null;
let mortgageBarChart = null;
let lastMortgageInput = null;

function renderMortgageKPIs(principal, annualRate, years) {
  const payment = calcMonthlyPayment(principal, annualRate, years);
  const total = payment * years * 12;
  const interest = total - principal;

  document.getElementById('mortgage-kpis').innerHTML = `
    <div class="kpi accent">
      <div class="kpi-label">${t('mortgage.kpi.payment')}</div>
      <div class="kpi-value">${fmt(payment)}</div>
      <div class="kpi-sub">${t('kpi.sub.apr')(years, fmtN(annualRate))}</div>
    </div>
    <div class="kpi">
      <div class="kpi-label">${t('mortgage.kpi.loan')}</div>
      <div class="kpi-value">${fmt(principal)}</div>
    </div>
    <div class="kpi warn">
      <div class="kpi-label">${t('mortgage.kpi.interest')}</div>
      <div class="kpi-value">${fmt(interest)}</div>
    </div>
    <div class="kpi">
      <div class="kpi-label">${t('mortgage.kpi.total')}</div>
      <div class="kpi-value">${fmt(total)}</div>
    </div>
  `;
}

function renderComparisonTable(principal, annualRate, selectedYears) {
  const TERMS = [...new Set([10, 15, 20, 25, 30, selectedYears])].sort((a, b) => a - b);
  const base30 = calcMonthlyPayment(principal, annualRate, 30) * 30 * 12;
  const tbody = document.getElementById('comparison-body');

  tbody.innerHTML = TERMS.map(years => {
    const payment = calcMonthlyPayment(principal, annualRate, years);
    const total = payment * years * 12;
    const interest = total - principal;
    const saving = base30 - total;
    const isActive = years === selectedYears;
    const badge = isActive
      ? `<span class="badge badge-primary">${t('mortgage.badge')}</span>`
      : '';

    const savingHtml = years < 30
      ? `<span style="color:var(--color-success)">+${fmt(saving)}</span>`
      : '<span style="color:var(--color-text-muted)">—</span>';

    return `
      <tr class="${isActive ? 'highlight' : ''}">
        <td>${years} ${t('suffix.yrs')} ${badge}</td>
        <td>${fmt(payment)}</td>
        <td>${fmt(interest)}</td>
        <td>${fmt(total)}</td>
        <td>${savingHtml}</td>
      </tr>`;
  }).join('');

  const sel = calcMonthlyPayment(principal, annualRate, selectedYears);
  const shorter = Math.max(selectedYears - 5, 5);
  const selTotal = sel * selectedYears * 12;
  const shortTotal = calcMonthlyPayment(principal, annualRate, shorter) * shorter * 12;
  const avgSaving = (selTotal - shortTotal) / 5;

  document.getElementById('mortgage-tip').textContent =
    t('mortgage.tip')(selectedYears, fmtN(annualRate), fmt(selTotal - principal), fmt(avgSaving));
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

function renderMortgageLineChart(principal, annualRate) {
  const TERM_MONTHS = 30 * 12;
  const r = annualRate / 12 / 100;
  const pmt = calcMonthlyPayment(principal, annualRate, 30);
  const labels = [], debt = [], cumInterest = [];
  let balance = principal, cumInt = 0;

  for (let m = 0; m <= TERM_MONTHS; m++) {
    if (m % 12 === 0) {
      labels.push(m / 12);
      debt.push(Math.max(0, Math.round(balance)));
      cumInterest.push(Math.round(cumInt));
    }
    if (m < TERM_MONTHS) {
      const intPart = balance * r;
      const capPart = pmt - intPart;
      cumInt += intPart;
      balance -= capPart;
    }
  }

  const ctx = document.getElementById('mortgage-line-chart').getContext('2d');
  if (mortgageLineChart) mortgageLineChart.destroy();

  mortgageLineChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [
        {
          label: t('mortgage.kpi.loan'),
          data: debt,
          borderColor: '#01696f',
          backgroundColor: 'rgba(1,105,111,0.10)',
          fill: true, tension: 0.3, pointRadius: 4, pointHoverRadius: 8,
        },
        {
          label: t('mortgage.kpi.interest'),
          data: cumInterest,
          borderColor: '#da7101',
          backgroundColor: 'rgba(218,113,1,0.08)',
          fill: true, tension: 0.3, pointRadius: 4, pointHoverRadius: 8,
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
          ticks: {
            callback: (_, index) => index % 5 === 0 ? index : null,
            maxRotation: 0,
            color: getAxisColor(),
          },
        },
      },
    },
  });
}

function renderMortgageBarChart(principal, annualRate) {
  const TERMS = [10, 15, 20, 25, 30];
  const labels = TERMS.map(y => `${y} ${t('suffix.yrs')}`);

  const payments = TERMS.map(y => Math.round(calcMonthlyPayment(principal, annualRate, y)));
  const interests = TERMS.map(y => {
    const pmt = calcMonthlyPayment(principal, annualRate, y);
    return Math.round(pmt * y * 12 - principal);
  });

  const ctx = document.getElementById('mortgage-bar-chart').getContext('2d');
  if (mortgageBarChart) mortgageBarChart.destroy();

  mortgageBarChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [
        {
          label: t('mortgage.kpi.payment'),
          data: payments,
          backgroundColor: 'rgba(220,175,30,0.80)',
          borderRadius: 3,
          yAxisID: 'yPayment',
        },
        {
          label: t('mortgage.kpi.interest'),
          data: interests,
          backgroundColor: 'rgba(218,100,20,0.85)',
          borderRadius: 3,
          yAxisID: 'yInterest',
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        legend: { position: 'top' },
        tooltip: { callbacks: { label: ctx => ` ${ctx.dataset.label}: ${fmt(ctx.parsed.y)}` } },
      },
      scales: {
        yPayment: {
          type: 'linear', position: 'left', beginAtZero: true,
          title: { display: true, text: t('chart.axis.eur'), color: 'rgba(218,100,20,0.85)', font: { size: 11 } },
          ticks: { callback: v => fmt(v), color: 'rgba(218,100,20,0.85)' },
          grid: { color: getGridColor() },
        },
        yInterest: {
          type: 'linear', position: 'right', beginAtZero: true,
          title: { display: true, text: t('chart.axis.eur'), color: 'rgba(180,140,20,0.9)', font: { size: 11 } },
          ticks: { callback: v => fmt(v), color: 'rgba(180,140,20,0.9)' },
          grid: { drawOnChartArea: false },
        },
        x: { grid: { color: getGridColor() } },
      },
    },
  });
}

function calculateMortgage() {
  const principal = parseFloat(document.getElementById('m-amount').value) || 80000;
  const annualRate = parseFloat(document.getElementById('m-rate').value) || 3.1;
  const years = parseInt(document.getElementById('m-term').value) || 20;

  lastMortgageInput = { principal, annualRate, years };

  renderMortgageKPIs(principal, annualRate, years);
  renderComparisonTable(principal, annualRate, years);
  renderMortgageLineChart(principal, annualRate);
  renderMortgageBarChart(principal, annualRate);

  document.getElementById('mortgage-results').classList.remove('results-hidden');
}

window.addEventListener('themechange', () => {
  if (!lastMortgageInput) return;
  const { principal, annualRate, years } = lastMortgageInput;
  if (mortgageLineChart) { mortgageLineChart.destroy(); mortgageLineChart = null; }
  if (mortgageBarChart) { mortgageBarChart.destroy(); mortgageBarChart = null; }
  renderMortgageLineChart(principal, annualRate);
  renderMortgageBarChart(principal, annualRate);
});
