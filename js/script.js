function downloadPortfolioPDF() { window.print(); }

const root = document.documentElement;
const toggle = document.getElementById('themeToggle');
const icon = document.getElementById('themeIcon');

// Use the saved preference when available; otherwise default to light mode.
let savedTheme = null;
try { savedTheme = localStorage.getItem('sam-portfolio-theme'); } catch (error) {}
applyTheme(savedTheme === 'light' ? 'light' : 'dark');

function applyTheme(theme) {
  root.setAttribute('data-theme', theme);
  const isDark = theme === 'dark';
  icon.className = isDark ? 'bi bi-sun' : 'bi bi-moon-stars';
  toggle.setAttribute('aria-label', isDark ? 'Switch to light theme' : 'Switch to dark theme');
  toggle.setAttribute('title', isDark ? 'Switch to light theme' : 'Switch to dark theme');
}
toggle.addEventListener('click', () => {
  const nextTheme = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
  applyTheme(nextTheme);
  try { localStorage.setItem('sam-portfolio-theme', nextTheme); } catch (error) {}
});

document.getElementById('year').textContent = new Date().getFullYear();

// Close the mobile navigation after a section is selected.
document.querySelectorAll('#portfolioNav .nav-link, #portfolioNav .btn').forEach(link => {
  link.addEventListener('click', () => {
    const nav = document.getElementById('portfolioNav');
    if (nav.classList.contains('show') && window.bootstrap) {
      bootstrap.Collapse.getOrCreateInstance(nav).hide();
    }
  });
});

// Image viewer: clicking a project, award, or certificate image opens it larger.
(function () {
  const modalEl = document.getElementById('imageModal');
  if (!modalEl) return;
  const modalImg = document.getElementById('imageModalImg');
  const modalCaption = document.getElementById('imageModalCaption');

  // If an image file has not been added yet, show a neat placeholder instead of a broken icon.
  function placeholder(text) {
    const safe = text.replace(/&/g, '&amp;').replace(/</g, '&lt;');
    const svg = '<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800" viewBox="0 0 1200 800">' +
      '<rect width="1200" height="800" fill="#e6f4ee"/>' +
      '<text x="600" y="400" text-anchor="middle" dominant-baseline="middle" font-family="sans-serif" font-size="34" fill="#68766f">' +
      safe + '</text></svg>';
    return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
  }
  document.querySelectorAll('.zoomable img').forEach(img => {
    const fallback = () => {
      img.dataset.missing = 'true';
      img.src = placeholder(img.dataset.label || img.alt || 'Add image');
    };
    img.addEventListener('error', () => { if (img.dataset.missing !== 'true') fallback(); });
    if (img.complete && img.naturalWidth === 0 && img.getAttribute('src')) fallback();
  });

  let currentThumb = null;
  document.addEventListener('click', event => {
    const trigger = event.target.closest('.zoomable');
    if (!trigger) return;
    const img = trigger.querySelector('img');
    currentThumb = img;
    modalImg.src = img.dataset.missing === 'true' ? img.src : (trigger.dataset.full || img.currentSrc || img.src);
    modalImg.alt = img.alt;
    modalCaption.textContent = trigger.dataset.caption || img.alt;
    if (window.bootstrap) bootstrap.Modal.getOrCreateInstance(modalEl).show();
  });

  // If the larger version fails to load, fall back to the thumbnail already on the page.
  modalImg.addEventListener('error', () => {
    if (currentThumb && modalImg.src !== currentThumb.src) modalImg.src = currentThumb.src;
  });
  modalEl.addEventListener('hidden.bs.modal', () => { modalImg.removeAttribute('src'); });
})();
