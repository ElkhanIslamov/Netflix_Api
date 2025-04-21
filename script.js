let shows = [];
let currentPage = 1;
const showsPerPage = 8;
let isLoading = false;
const container = document.getElementById('shows-container');

async function fetchShows() {
  const res = await fetch('https://api.tvmaze.com/shows');
  shows = await res.json();
  populateYearDropdown();
  applyFilters();
}

function populateYearDropdown() {
  const yearSet = new Set(
    shows
      .filter(show => show.premiered)
      .map(show => show.premiered.slice(0, 4))
  );

  const yearFilter = document.getElementById('yearFilter');
  [...yearSet].sort((a, b) => b - a).forEach(year => {
    const option = document.createElement('option');
    option.value = year;
    option.textContent = year;
    yearFilter.appendChild(option);
  });
}

function getFilteredShows() {
  const keyword = document.getElementById('searchInput').value.toLowerCase();
  const selectedYear = document.getElementById('yearFilter').value;
  const activeGenre = document.querySelector('#genreNav a.active')?.dataset.genre || null;

  return shows.filter(show => {
    const matchesKeyword = show.name.toLowerCase().includes(keyword);
    const matchesYear = selectedYear === '' || (show.premiered && show.premiered.startsWith(selectedYear));
    const matchesGenre = !activeGenre || show.genres.includes(activeGenre);
    return matchesKeyword && matchesYear && matchesGenre;
  });
}

function renderShows(filtered) {
  const start = (currentPage - 1) * showsPerPage;
  const end = currentPage * showsPerPage;
  const toDisplay = filtered.slice(start, end);

  toDisplay.forEach(show => {
    const div = document.createElement('div');
    div.className = 'movie';
    div.innerHTML = `<img src="${show.image?.medium || 'https://via.placeholder.com/200x300?text=No+Image'}" alt="${show.name}"><p>${show.name}</p>`;
    div.onclick = () => showDetails(show);
    container.appendChild(div);
  });

  isLoading = false;
}

function applyFilters() {
  currentPage = 1;
  container.innerHTML = '';
  const filtered = getFilteredShows();
  renderShows(filtered);
}

function loadMoreIfNeeded() {
  if (isLoading) return;

  const scrollPosition = window.innerHeight + window.scrollY;
  const threshold = document.body.offsetHeight - 300;

  if (scrollPosition >= threshold) {
    isLoading = true;
    currentPage++;
    const filtered = getFilteredShows();
    renderShows(filtered);
  }
}

function showDetails(show) {
  document.getElementById('modalTitle').textContent = show.name;
  document.getElementById('modalGenres').textContent = show.genres.join(', ');
  document.getElementById('modalLanguage').textContent = show.language;
  document.getElementById('modalRating').textContent = show.rating.average || 'N/A';
  document.getElementById('modalSummary').innerHTML = show.summary;
  document.getElementById('watchNowBtn').href = show.url;
  document.getElementById('modal').style.display = 'flex';
}

function closeModal() {
  document.getElementById('modal').style.display = 'none';
}

document.getElementById('modal').addEventListener('click', function (e) {
  if (e.target === this) {
    closeModal();
  }
});

document.getElementById('searchInput').addEventListener('input', applyFilters);
document.getElementById('yearFilter').addEventListener('change', applyFilters);

function filterGenre(genre, link) {
  document.querySelectorAll('#genreNav a').forEach(a => {
    a.classList.remove('active');
    delete a.dataset.genre;
  });

  link.classList.add('active');
  if (genre) link.dataset.genre = genre;

  applyFilters();
}

// Infinite scroll
window.addEventListener('scroll', loadMoreIfNeeded);

// Start app

// Back to Top Button Logic
const backToTopBtn = document.getElementById('backToTopBtn');

window.addEventListener('scroll', () => {
  if (document.documentElement.scrollTop > 500) {
    backToTopBtn.style.display = 'block';
  } else {
    backToTopBtn.style.display = 'none';
  }
});

backToTopBtn.addEventListener('click', () => {
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  });
});

fetchShows();
