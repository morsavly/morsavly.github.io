const TRANSLATIONS = {
  en: {
    'app.title': 'morsavly <span>· Mortgage &amp; Savings</span>',
    'tab.mortgage': 'Mortgage Calculator',
    'tab.savings': 'Savings Plan',
    'mortgage.title': 'Mortgage Parameters',
    'mortgage.amount': 'Loan amount',
    'mortgage.rate': 'Annual rate (APR)',
    'mortgage.term': 'Term',
    'mortgage.calculate': 'Calculate',
    "action.reset": "Reset",
    'mortgage.kpi.payment': 'Monthly payment',
    'mortgage.kpi.loan': 'Loan amount',
    'mortgage.kpi.interest': 'Total interest',
    'mortgage.kpi.total': 'Total repaid',
    'mortgage.section.comparison': 'Term comparison',
    'mortgage.table.term': 'Term',
    'mortgage.table.monthly': 'Monthly payment',
    'mortgage.table.interest': 'Total interest',
    'mortgage.table.total': 'Total paid',
    'mortgage.table.saving': 'Saving vs 30 yrs',
    'mortgage.badge': 'selected',
    'mortgage.chart1.title': 'Remaining debt over time',
    'mortgage.chart2.title': 'Annual payment breakdown by term',
    'mortgage.tip': (y, rate, int, avg) =>
      `With a ${y}-year term at ${rate}% APR, you pay ${int} in total interest. ` +
      `Each year you shorten the term saves you ~${avg}/yr in interest.`,
    'savings.title': 'Savings Plan Parameters',
    'savings.monthly': 'Monthly contribution',
    'savings.initial': 'Initial capital',
    'savings.return': 'Expected annual return',
    'savings.term': 'Investment horizon',
    'savings.inflation': 'Annual inflation',
    'savings.calculate': 'Calculate',
    'savings.kpi.capital': 'Final capital',
    'savings.kpi.contributed': 'Total contributed',
    'savings.kpi.interest': 'Interest earned',
    'savings.kpi.real': 'Real value',
    'savings.section.summary': 'Yearly summary',
    'savings.table.year': 'Year',
    'savings.table.contributed': 'Total contributed',
    'savings.table.interest': 'Interest earned',
    'savings.table.capital': 'Capital',
    'savings.chart.title': 'Capital growth',
    'chart.axis.year': 'Year',
    'chart.axis.eur': 'EUR',
    'suffix.yrs': 'yrs',
    'kpi.sub.years': (y) => `after ${y} years`,
    'kpi.sub.apr': (y, r) => `${y} yrs · ${r}% APR`,
    'kpi.sub.pct': (p) => `${p}% of capital`,
  },

  it: {
    'app.title': 'morsavly <span>· Mortgage &amp; Savings</span>',
    'tab.mortgage': 'Calcolatore Mutuo',
    'tab.savings': 'Piano di Accumulo',
    'mortgage.title': 'Parametri del Mutuo',
    'mortgage.amount': 'Importo del mutuo',
    'mortgage.rate': 'Tasso annuo (TAN)',
    'mortgage.term': 'Durata',
    'mortgage.calculate': 'Calcola',
    "action.reset": "Azzera",
    'mortgage.kpi.payment': 'Rata mensile',
    'mortgage.kpi.loan': 'Importo mutuo',
    'mortgage.kpi.interest': 'Interessi totali',
    'mortgage.kpi.total': 'Totale rimborsato',
    'mortgage.section.comparison': 'Piano di confronto durate',
    'mortgage.table.term': 'Durata',
    'mortgage.table.monthly': 'Rata/mese',
    'mortgage.table.interest': 'Interessi tot.',
    'mortgage.table.total': 'Totale pagato',
    'mortgage.table.saving': 'Risparmio vs 30 anni',
    'mortgage.badge': 'selezionata',
    'mortgage.chart1.title': 'Evoluzione del debito residuo',
    'mortgage.chart2.title': 'Composizione annuale della rata',
    'mortgage.tip': (y, rate, int, avg) =>
      `Con ${y} anni e tasso ${rate}%, paghi ${int} di interessi. ` +
      `Ogni anno in meno di durata ti fa risparmiare mediamente ${avg}/anno.`,
    'savings.title': 'Parametri Piano di Accumulo (PAC)',
    'savings.monthly': 'Versamento mensile',
    'savings.initial': 'Capitale iniziale',
    'savings.return': 'Rendimento annuo atteso',
    'savings.term': 'Durata investimento',
    'savings.inflation': 'Inflazione annua',
    'savings.calculate': 'Calcola',
    'savings.kpi.capital': 'Capitale finale',
    'savings.kpi.contributed': 'Totale versato',
    'savings.kpi.interest': 'Rendita interessi',
    'savings.kpi.real': 'Valore reale',
    'savings.section.summary': 'Riepilogo annuale',
    'savings.table.year': 'Anno',
    'savings.table.contributed': 'Versato tot.',
    'savings.table.interest': 'Rendita',
    'savings.table.capital': 'Capitale',
    'savings.chart.title': 'Crescita del capitale',
    'chart.axis.year': 'Anno',
    'chart.axis.eur': 'EUR',
    'suffix.yrs': 'anni',
    'kpi.sub.years': (y) => `dopo ${y} anni`,
    'kpi.sub.apr': (y, r) => `${y} anni · ${r}% TAN`,
    'kpi.sub.pct': (p) => `${p}% del capitale`,
  },
};

let currentLang = localStorage.getItem('lang') || 'it';

function t(key) {
  return (TRANSLATIONS[currentLang][key] ?? TRANSLATIONS['en'][key]) ?? key;
}

function applyLang(lang) {
  currentLang = lang;
  localStorage.setItem('lang', lang);
  document.documentElement.lang = lang;

  document.querySelectorAll('[data-i18n]').forEach(el => {
    const val = t(el.dataset.i18n);
    if (typeof val === 'string') el.innerHTML = val;
  });

  document.querySelectorAll('[data-lang-btn]').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.langBtn === lang);
  });

  const mortgageVisible = !document.getElementById('mortgage-results')
    .classList.contains('results-hidden');

  if (mortgageVisible && lastMortgageInput) {
    const { principal, annualRate, years } = lastMortgageInput;
    renderMortgageKPIs(principal, annualRate, years);
    renderComparisonTable(principal, annualRate, years);
    if (mortgageLineChart) { mortgageLineChart.destroy(); mortgageLineChart = null; }
    if (mortgageBarChart) { mortgageBarChart.destroy(); mortgageBarChart = null; }
    renderMortgageLineChart(principal, annualRate);
    renderMortgageBarChart(principal, annualRate);
  }

  const savingsVisible = !document.getElementById('savings-results')
    .classList.contains('results-hidden');

  if (savingsVisible && lastSavingsData) {
    const years = parseInt(document.getElementById('s-term').value) || 20;
    const inflation = parseFloat(document.getElementById('s-inflation').value) || 2;
    renderSavingsKPIs(lastSavingsData, years, inflation);
    renderSavingsTable(lastSavingsData);
    if (savingsChart) { savingsChart.destroy(); savingsChart = null; }
    renderSavingsChart(lastSavingsData);
  }
}
