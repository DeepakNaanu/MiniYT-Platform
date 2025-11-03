// script.js — MiniTube frontend demo (no real API, sample data)
const sampleVideos = (() => {
  // small generator for demo videos
  const vids = [];
  for (let i=1;i<=12;i++){
    vids.push({
      id: `vid-${i}`,
      title: `Demo Video ${i} — Building a YouTube-like UI`,
      channel: `Channel ${((i%5)+1)}`,
      views: Math.floor(Math.random()*900000) + 1200,
      duration: `${Math.floor(Math.random()*20)+1}:${String(Math.floor(Math.random()*60)).padStart(2,'0')}`,
      description: `This is a demo description for Demo Video ${i}. It explains how to design a modern video platform UI.`,
      thumbnail: `https://picsum.photos/seed/youtube-${i}/640/360`,
      src: null // we will use a short sample video placeholder (or blank)
    });
  }
  return vids;
})();

document.addEventListener('DOMContentLoaded', () => {
  const videosGrid = document.getElementById('videosGrid');
  const searchInput = document.getElementById('query');
  const searchBtn = document.getElementById('searchBtn');
  const loadMoreBtn = document.getElementById('loadMore');
  const playerModal = document.getElementById('playerModal');
  const player = document.getElementById('player');
  const videoTitle = document.getElementById('videoTitle');
  const videoViews = document.getElementById('videoViews');
  const videoDescription = document.getElementById('videoDescription');
  const closeModal = document.getElementById('closeModal');
  const likeBtn = document.getElementById('likeBtn');
  const likeCountSpan = document.getElementById('likeCount');
  const subscribeBtn = document.getElementById('subscribeBtn');
  const menuBtn = document.getElementById('menuBtn');

  let data = sampleVideos.slice();
  let shown = 0;
  const PAGE = 8;
  let currentVideo = null;
  let liked = new Set();
  let subscribed = new Set();

  function formatViews(n){
    if (n >= 1e6) return (n/1e6).toFixed(1)+'M views';
    if (n >= 1e3) return (n/1e3).toFixed(1)+'K views';
    return n + ' views';
  }

  function renderCards(videos){
    const frag = document.createDocumentFragment();
    videos.forEach(v=>{
      const card = document.createElement('article');
      card.className = 'card';
      card.setAttribute('data-id', v.id);
      card.innerHTML = `
        <div class="thumb">
          <img loading="lazy" src="${v.thumbnail}" alt="${escapeHtml(v.title)}" />
        </div>
        <div class="card-body">
          <h4 class="title">${escapeHtml(v.title)}</h4>
          <div class="meta">
            <div class="channel">
              <div class="avatar" aria-hidden="true"></div>
              <div>
                <div class="channel-name">${escapeHtml(v.channel)}</div>
                <div class="meta small">${formatViews(v.views)} • ${v.duration}</div>
              </div>
            </div>
          </div>
        </div>
      `;
      card.addEventListener('click', () => openPlayer(v));
      frag.appendChild(card);
    });
    videosGrid.appendChild(frag);
  }

  function loadMore(){
    const next = data.slice(shown, shown + PAGE);
    renderCards(next);
    shown += next.length;
    if (shown >= data.length) loadMoreBtn.style.display = 'none';
  }

  function performSearch(q){
    videosGrid.innerHTML = '';
    shown = 0;
    if (!q) {
      data = sampleVideos.slice();
    } else {
      const s = q.trim().toLowerCase();
      data = sampleVideos.filter(v => v.title.toLowerCase().includes(s) || v.channel.toLowerCase().includes(s));
    }
    loadMoreBtn.style.display = 'block';
    loadMore();
  }

  searchBtn.addEventListener('click', ()=> performSearch(searchInput.value));
  searchInput.addEventListener('keydown', (e)=> { if (e.key === 'Enter') performSearch(searchInput.value) });

  loadMoreBtn.addEventListener('click', loadMore);

  function openPlayer(video){
    currentVideo = video;
    // set player src to a small sample video or use placeholder stream
    // For demo, use a public small mp4 hosted by sample-videos or set blank with poster.
    // Using a short base64 fallback or empty: we'll use a tiny sample video hosted at sample-videos.com might be blocked.
    player.src = video.src || 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4';
    player.play().catch(()=>{ /* ignore autoplay block */ });
    videoTitle.textContent = video.title;
    videoViews.textContent = formatViews(video.views);
    videoDescription.textContent = video.description;
    likeCountSpan.textContent = (liked.has(video.id) ? 1 : 0);
    subscribeBtn.textContent = (subscribed.has(video.channel) ? 'Subscribed' : 'Subscribe');
    playerModal.classList.remove('hidden');
    playerModal.setAttribute('aria-hidden', 'false');
  }

  closeModal.addEventListener('click', () => {
    player.pause();
    player.src = '';
    playerModal.classList.add('hidden');
    playerModal.setAttribute('aria-hidden','true');
  });

  likeBtn.addEventListener('click', () => {
    if (!currentVideo) return;
    if (liked.has(currentVideo.id)) {
      liked.delete(currentVideo.id);
    } else {
      liked.add(currentVideo.id);
    }
    likeCountSpan.textContent = (liked.has(currentVideo.id) ? 1 : 0);
    likeBtn.classList.toggle('active', liked.has(currentVideo.id));
  });

  subscribeBtn.addEventListener('click', () => {
    if (!currentVideo) return;
    if (subscribed.has(currentVideo.channel)) {
      subscribed.delete(currentVideo.channel);
      subscribeBtn.textContent = 'Subscribe';
    } else {
      subscribed.add(currentVideo.channel);
      subscribeBtn.textContent = 'Subscribed';
    }
  });

  menuBtn.addEventListener('click', () => {
    const sidebar = document.getElementById('sidebar');
    if (!sidebar) return;
    sidebar.style.display = sidebar.style.display === 'none' || getComputedStyle(sidebar).display === 'none' ? 'block' : 'none';
  });

  // small helper: escape HTML for safety when injecting titles
  function escapeHtml(s){
    return String(s).replace(/[&<>"']/g, (m)=>({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[m]));
  }

  // initial render
  performSearch('');
});
