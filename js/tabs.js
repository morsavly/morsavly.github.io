(function () {
  const tabBtns = document.querySelectorAll('.tab-btn');

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.dataset.tab;

      document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
      tabBtns.forEach(b => b.classList.remove('active'));

      document.getElementById('panel-' + targetId).classList.add('active');
      btn.classList.add('active');
    });
  });
})();
