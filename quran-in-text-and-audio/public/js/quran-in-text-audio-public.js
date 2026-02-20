(function () {
	function dynamicQuranApi() {
		const quranDynamicObj = {
			api: 'https://api.alquran.cloud/v1',
		};

		quranDynamicObj.mainWrapper = document.querySelector('.dwl-quran-full-wrapper');
		if (!quranDynamicObj.mainWrapper) return;

		// ---- Audio player setup ----------------------------------------------
		let audioEl = null;
		let playerBar = null;

		// ---- Helpers --------------------------------------------------------
		const escapeHTML = (str) => {
			if (str == null) return '';
			return String(str)
				.replace(/&/g, '&amp;')
				.replace(/</g, '&lt;')
				.replace(/>/g, '&gt;')
				.replace(/"/g, '&quot;')
				.replace(/'/g, '&#039;');
		};

		// Audio helpers and state
		const AUTO_ADVANCE = true;
		const LAST_AUDIO_KEY = 'qita_last_audio';
		const BM_KEY = 'qita_bookmarks_v1';
		function loadBookmarks(){
		    try { return JSON.parse(localStorage.getItem(BM_KEY) || '[]'); } catch(e){ return []; }
		}
		function saveBookmarks(list){
		    try { localStorage.setItem(BM_KEY, JSON.stringify(list)); } catch(e){}
		}
		function isBookmarked(src){
		    const list = loadBookmarks();
		    return !!list.find(b => b && b.src === src);
		}
		function refreshBookmarksState(){
		    const list = loadBookmarks();
		    const set = new Set(list.map(b => b.src));
		    quranDynamicObj.mainWrapper.querySelectorAll('.qita-bookmark-btn').forEach(btn => {
		        const wrap = btn.closest('.quran-surah-ayah--wrapper');
		        const play = wrap && wrap.querySelector('.quran-surah-ayah-play');
		        const src  = play && play.dataset && play.dataset.audio;
		        const on = src && set.has(src);
		        btn.setAttribute('aria-pressed', on ? 'true':'false');
		        btn.classList.toggle('active', !!on);
		    });
		    bookmarksRenderList();
		}

		function ensureAudioPlayer() {
			if (audioEl && !audioEl.isConnected) { audioEl = null; }
			if (!audioEl) {
				audioEl = document.getElementById('quran-audio-player');
				if (!audioEl) {
					audioEl = document.createElement('audio');
					audioEl.id = 'quran-audio-player';
					audioEl.preload = 'none';
					audioEl.setAttribute('aria-hidden','true');
					audioEl.style.display = 'none';
					document.body.appendChild(audioEl);
				}
				audioEl.addEventListener('ended', handleAudioEnded);
				audioEl.addEventListener('pause', ()=> { if (!audioEl.ended) updateAllPlayButtons(false); });
				audioEl.addEventListener('play', ()=> {/* hook for future UI */});
			}
			return audioEl;
		}

		function updateAllPlayButtons() {
			const btns = quranDynamicObj.mainWrapper.querySelectorAll('.quran-surah-ayah-play');
			btns.forEach(b=>{
				b.setAttribute('aria-pressed','false');
				b.classList.remove('is-playing');
				const wrap = b.closest('.quran-surah-ayah--wrapper');
				if (wrap) wrap.classList.remove('is-playing');
			});
		}

		function setPlayingState(btn, isPlaying){
			if (!btn) return;
			btn.setAttribute('aria-pressed', isPlaying ? 'true':'false');
			btn.classList.toggle('is-playing', !!isPlaying);
			const wrap = btn.closest('.quran-surah-ayah--wrapper');
			if (wrap) wrap.classList.toggle('is-playing', !!isPlaying);
		}

		function saveLastAudio(src){
			try { localStorage.setItem(LAST_AUDIO_KEY, JSON.stringify({src})); } catch(e){}
		}

		function sourcesMatch(a,b){
			if (!a || !b) return false;
			try { return a === b || a.endsWith(b) || b.endsWith(a); } catch(e) { return a === b; }
		}

		function findCurrentButton(){
			// Prefer explicit playing state
			let btn = quranDynamicObj.mainWrapper.querySelector('.quran-surah-ayah-play.is-playing') ||
			          quranDynamicObj.mainWrapper.querySelector('.quran-surah-ayah--wrapper.is-playing .quran-surah-ayah-play');
			if (btn) return btn;
			// Fallback: match by audio src
			const audio = ensureAudioPlayer();
			if (!audio || !audio.src) return null;
			const all = quranDynamicObj.mainWrapper.querySelectorAll('.quran-surah-ayah-play');
			for (const b of all) {
				if (b.dataset && b.dataset.audio && sourcesMatch(audio.src, b.dataset.audio)) {
					return b;
				}
			}
			return null;
		}

		function handleAudioEnded(){
			if (!AUTO_ADVANCE) return;
			const current = findCurrentButton();
			if (!current) { updateAllPlayButtons(); return; }
			const next = findNextAyahButton(current);
			setPlayingState(current,false);
			if (next) {
				playFromButton(next);
				next.focus();
			} else {
				updateAllPlayButtons();
			}
		}

		function findNextAyahButton(btn){
			const wrap = quranDynamicObj.mainWrapper.querySelector('.dwl-quran-surah.active');
			if (!wrap) return null;
			const curr = btn.closest('.quran-surah-ayah--wrapper');
			if (!curr) return null;
			let node = curr.nextElementSibling;
			while (node && !node.classList.contains('quran-surah-ayah--wrapper')) {
				node = node.nextElementSibling;
			}
			if (node) return node.querySelector('.quran-surah-ayah-play');
			return null;
		}

		function findPrevAyahButton(btn){
			const wrap = quranDynamicObj.mainWrapper.querySelector('.dwl-quran-surah.active');
			if (!wrap) return null;
			const curr = btn.closest('.quran-surah-ayah--wrapper');
			if (!curr) return null;
			let node = curr.previousElementSibling;
			while (node && !node.classList.contains('quran-surah-ayah--wrapper')) {
				node = node.previousElementSibling;
			}
			if (node) return node.querySelector('.quran-surah-ayah-play');
			return null;
		}

		async function playFromButton(btn){
			const audioSrc = btn && btn.dataset && btn.dataset.audio;
			if (!audioSrc) return;
			const audio = ensureAudioPlayer();
			if (audio.src !== audioSrc) {
				audio.src = audioSrc;
			}
			try {
				updateAllPlayButtons();
				setPlayingState(btn,true);
				await audio.play();
				saveLastAudio(audioSrc);
				if (!playerBar) injectPlayerBar();
				updatePlayerBar();
			} catch(e){
				setPlayingState(btn,false);
			}
		}

		function formatTime(sec){
			if (!isFinite(sec)) return '0:00';
			sec = Math.max(0, Math.floor(sec));
			const m = Math.floor(sec/60);
			const s = (sec%60).toString().padStart(2,'0');
			return m+':'+s;
		}

		function getAyahLabel(btn){
			if (!btn) return '';
			const wrap = btn.closest('.quran-surah-ayah--wrapper');
			const numEl = wrap && wrap.querySelector('.quran-surah-ayah--number');
			if (numEl) return numEl.textContent.trim();
			return '';
		}

		function updatePlayerBar(){
			if (!playerBar) return;
			const audio = ensureAudioPlayer();
			const isPlaying = !audio.paused && !audio.ended && audio.currentTime > 0;
			const playBtn = playerBar.querySelector('#qita-playpause');
			const currEl = playerBar.querySelector('#qita-current');
			const durEl  = playerBar.querySelector('#qita-duration');
			const seekEl = playerBar.querySelector('#qita-seek');
			const label  = playerBar.querySelector('#qita-label');

			// label from current button
			const curBtn = findCurrentButton();
			if (curBtn) {
				label.textContent = getAyahLabel(curBtn);
			}

			playBtn.setAttribute('aria-pressed', isPlaying ? 'true' : 'false');
			playBtn.textContent = isPlaying ? 'Pause' : 'Play';

			const d = isFinite(audio.duration) ? audio.duration : 0;
			const t = isFinite(audio.currentTime) ? audio.currentTime : 0;
			currEl.textContent = formatTime(t);
			durEl.textContent  = formatTime(d);
			seekEl.max = d || 0;
			if (!seekEl.matches(':active')) {
				seekEl.value = t || 0;
			}
		}

		function injectPlayerBar(){
			if (playerBar) return playerBar;
			playerBar = document.createElement('div');
			playerBar.id = 'qita-player-bar';
			playerBar.setAttribute('role','region');
			playerBar.setAttribute('aria-label','Quran audio player');
			playerBar.innerHTML = `
				<button id="qita-prev" aria-label="Previous ayah">⟨</button>
				<button id="qita-playpause" aria-pressed="false">Play</button>
				<button id="qita-next" aria-label="Next ayah">⟩</button>
				<input id="qita-seek" type="range" min="0" value="0" step="1" aria-label="Seek" />
				<span id="qita-current">0:00</span> / <span id="qita-duration">0:00</span>
				<span id="qita-label" class="qita-label"></span>
				<button id="qita-bm-toggle" aria-expanded="false" aria-controls="qita-bm-drawer" title="Bookmarks">★</button>
				<div id="qita-bm-drawer" hidden>
					<ul id="qita-bm-list" aria-label="Bookmarks"></ul>
				</div>
			`;

			// minimal styles
			const style = document.createElement('style');
			style.textContent = `
				#qita-player-bar{position:fixed;left:0;right:0;bottom:0;z-index:9999;background:#111;color:#fff;display:flex;gap:.5rem;align-items:center;padding:.5rem 1rem;font:14px/1.2 system-ui, -apple-system, Segoe UI, Roboto, Arial;}
				#qita-player-bar button{background:#2b2b2b;border:0;color:#fff;padding:.4rem .7rem;border-radius:4px;cursor:pointer}
				#qita-player-bar button[aria-pressed="true"]{background:#0a7d38}
				#qita-player-bar input[type=range]{flex:1;accent-color:#0a7d38}
				#qita-player-bar .qita-label{margin-left:.5rem;opacity:.85;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:30vw}
				@media (max-width:600px){#qita-player-bar .qita-label{display:none}}
				#qita-bm-toggle{margin-left:auto}
				#qita-bm-drawer{position:fixed;left:0;right:0;bottom:48px;background:#181818;border-top:1px solid #2a2a2a;max-height:40vh;overflow:auto;padding:.5rem 1rem}
				#qita-bm-list{list-style:none;margin:0;padding:0}
				#qita-bm-list li{display:flex;align-items:center;gap:.5rem;padding:.35rem 0;border-bottom:1px dashed #333}
				#qita-bm-list li button{background:#2b2b2b;border:0;color:#fff;padding:.2rem .5rem;border-radius:3px;cursor:pointer}
				#qita-bm-list .bm-label{flex:1;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
			`;
			document.head.appendChild(style);
			document.body.appendChild(playerBar);

			// wire events
			const audio = ensureAudioPlayer();
			audio.addEventListener('timeupdate', updatePlayerBar);
			audio.addEventListener('loadedmetadata', updatePlayerBar);
			audio.addEventListener('play', updatePlayerBar);
			audio.addEventListener('pause', updatePlayerBar);
			audio.addEventListener('ended', updatePlayerBar);

			playerBar.addEventListener('click', function(ev){
				const t = ev.target;
				if (t.id === 'qita-playpause'){
					if (audio.paused) {
						const cur = findCurrentButton() || quranDynamicObj.mainWrapper.querySelector('.dwl-quran-surah.active .quran-surah-ayah--wrapper .quran-surah-ayah-play');
						if (cur) playFromButton(cur);
					} else {
						audio.pause();
					}
					updatePlayerBar();
				} else if (t.id === 'qita-next'){
					const cur = findCurrentButton();
					const n = cur ? findNextAyahButton(cur) : null;
					if (n) playFromButton(n);
				} else if (t.id === 'qita-prev'){
					const cur = findCurrentButton();
					const p = cur ? findPrevAyahButton(cur) : null;
					if (p) playFromButton(p);
				}
			});

			// bookmarks toggle + actions
			playerBar.addEventListener('click', function(ev){
				const t = ev.target;
				if (t.id === 'qita-bm-toggle'){
					const drawer = playerBar.querySelector('#qita-bm-drawer');
					const expanded = t.getAttribute('aria-expanded') === 'true';
					t.setAttribute('aria-expanded', expanded ? 'false' : 'true');
					if (expanded) { drawer.setAttribute('hidden',''); } else { drawer.removeAttribute('hidden'); }
					bookmarksRenderList();
				}
				if (t && t.matches && t.matches('button[data-bm-action]')){
					const action = t.getAttribute('data-bm-action');
					const src = t.getAttribute('data-src');
					if (action === 'jump' && src){ jumpToBookmarkSrc(src); }
					if (action === 'remove' && src){ removeBookmark(src); }
				}
			});

			const seek = playerBar.querySelector('#qita-seek');
			let seeking = false;
			seek.addEventListener('input', function(){
				seeking = true;
				const audio = ensureAudioPlayer();
				const val = Number(this.value) || 0;
				if (isFinite(audio.duration)) {
					audio.currentTime = Math.min(Math.max(0,val), audio.duration);
					updatePlayerBar();
				}
			});
			seek.addEventListener('change', function(){ seeking = false; });

			// keyboard shortcut P to toggle
			document.addEventListener('keydown', function(e){
				if (e.key && (e.key === 'p' || e.key === 'P')){
					const audio = ensureAudioPlayer();
					if (audio.paused) {
						const cur = findCurrentButton() || quranDynamicObj.mainWrapper.querySelector('.dwl-quran-surah.active .quran-surah-ayah--wrapper .quran-surah-ayah-play');
						if (cur) playFromButton(cur);
					} else {
						audio.pause();
					}
					updatePlayerBar();
				}
			});

			updatePlayerBar();
			return playerBar;
		}

		function bookmarksRenderList(){
		    if (!playerBar) return;
		    const ul = playerBar.querySelector('#qita-bm-list');
		    if (!ul) return;
		    const list = loadBookmarks();
		    ul.innerHTML = '';
		    if (!list.length){
		        ul.innerHTML = '<li><em>No bookmarks yet.</em></li>';
		        return;
		    }
		    list.forEach(bm => {
		        const li = document.createElement('li');
		        li.innerHTML = `
		            <span class="bm-label">${escapeHTML(bm.label || bm.src)}</span>
		            <button data-bm-action="jump" data-src="${escapeHTML(bm.src)}">Play</button>
		            <button data-bm-action="remove" data-src="${escapeHTML(bm.src)}">Remove</button>
		        `;
		        ul.appendChild(li);
		    });
		}
		function removeBookmark(src){
		    const list = loadBookmarks().filter(b => b && b.src !== src);
		    saveBookmarks(list);
		    refreshBookmarksState();
		}
		function jumpToBookmarkSrc(src){
		    // if button exists on current DOM, use it; otherwise switch surah then try
		    const existing = quranDynamicObj.mainWrapper.querySelector(`.quran-surah-ayah-play[data-audio="${CSS.escape(src)}"]`);
		    if (existing){ playFromButton(existing); return; }
		    // find bookmark data for surah number
		    const bm = loadBookmarks().find(b => b && b.src === src);
		    if (!bm || !bm.surah) return;
		    switchToSurah(bm.surah, function(){
		        // after load, try again
		        const btn = quranDynamicObj.mainWrapper.querySelector(`.quran-surah-ayah-play[data-audio="${CSS.escape(src)}"]`);
		        if (btn) playFromButton(btn);
		    });
		}

		// --- Simple localStorage cache (JSON + TTL) with quota safety --------
		const LS_PREFIX = 'qita_cache_';
		const SURAH_TTL = 604800; // 7 days
		const LIST_TTL = 2592000; // 30 days
		const AYAH_TTL = 604800; // 7 days

		function lsSupported() {
			try { const k = '__qita__'; localStorage.setItem(k, '1'); localStorage.removeItem(k); return true; } catch(e){ return false; }
		}
		function cacheKey(url){ return LS_PREFIX + url; }
		function listCacheKeys(){
			if (!lsSupported()) return [];
			const keys = [];
			for (let i = 0; i < localStorage.length; i++) {
				const k = localStorage.key(i) || '';
				if (k.indexOf(LS_PREFIX) === 0) keys.push(k);
			}
			return keys;
		}
		function getCache(url){
			if (!lsSupported()) return null;
			const raw = localStorage.getItem(cacheKey(url));
			if (!raw) return null;
			try {
				const obj = JSON.parse(raw);
				if (obj && obj.exp && Date.now() < obj.exp) return obj.val;
				localStorage.removeItem(cacheKey(url));
			} catch(e){}
			return null;
		}
		function pruneOldest(n){
			if (!lsSupported()) return;
			const keys = listCacheKeys();
			// Sort by stored timestamp asc (oldest first)
			const enriched = keys.map(k=>{
				try { const o = JSON.parse(localStorage.getItem(k)); return {k, ts: (o && o.ts) || 0}; } catch(e){ return {k, ts: 0}; }
			});
			enriched.sort((a,b)=>a.ts-b.ts);
			for (let i=0; i<Math.min(n, enriched.length); i++) {
				try { localStorage.removeItem(enriched[i].k); } catch(e){}
			}
		}
		function setCache(url, json, ttlSec){
			if (!lsSupported()) return;
			const key = cacheKey(url);
			const payload = JSON.stringify({ val: json, exp: Date.now() + (ttlSec*1000), ts: Date.now() });
			try {
				localStorage.setItem(key, payload);
			} catch(e){
				// Quota: remove a few oldest entries and retry once
				if (e && (e.name === 'QuotaExceededError' || e.code === 22)) {
					pruneOldest(5);
					try { localStorage.setItem(key, payload); } catch(_) { /* give up silently */ }
				}
			}
		}
		// Network-first with cache fill
		async function fetchCached(url, ttlSec){
			const cached = getCache(url);
			if (cached) return cached;
			const res = await fetchWithRetry(url);
			if (res && (res.code === 200 || res.code === '200')) {
				setCache(url, res, ttlSec);
			}
			return res;
		}

		async function fetchWithRetry(url, opts = {}, tries = 3, backoff = 500) {
			const controller = new AbortController();
			const timeout = setTimeout(() => controller.abort(), opts.timeout || 15000);
			try {
				const res = await fetch(url, { method: 'GET', signal: controller.signal });
				clearTimeout(timeout);
				return res.json();
			} catch (err) {
				clearTimeout(timeout);
				if (tries > 1) {
					await new Promise((r) => setTimeout(r, backoff));
					return fetchWithRetry(url, opts, tries - 1, backoff * 2);
				}
				return { code: 'fetch_error', error: String(err) };
			}
		}

		function renderError(message) {
			return (
				'<div class="quran-error" role="alert">' +
				escapeHTML(message || 'Failed to load content. Please try again.') +
				'</div>'
			);
		}

		function outputSingleAyah(data) {
			if (!Array.isArray(data) || data.length < 2 || !data[0] || !data[1]) {
				return renderError('Invalid ayah data.');
			}
			const a = data[0];
			const t = data[1];
			return (
				'<div class="quran-surah-ayah--wrapper">' +
				'<div class="quran-surah-ayah--meta">' +
				'<div class="quran-surah-name--english">' + escapeHTML(a.surah && a.surah.englishName) + '</div>' +
				'<div class="quran-surah-ayah--number quran-text-arabic">' +
				escapeHTML(a.surah && a.surah.number) + ' : ' + escapeHTML(a.number) + ' ' + escapeHTML(a.surah && a.surah.name) +
				'</div>' +
				'</div>' +
				'<div class="quran-surah-ayah--text quran-text-arabic">' + escapeHTML(a.text) + '</div>' +
				'<div class="quran-surah-ayah--text">' + escapeHTML(t.text) + '</div>' +
				'</div>'
			);
		}

		function showAllAyahs(data) {
			if (!Array.isArray(data) || data.length < 2) {
				return renderError('Invalid surah data.');
			}
			const meta = data[0];
			const trans = data[1];
			let html = '';
			html +=
				'<div class="quran-surah-name--wrapper">' +
				'<button class="dwl-surah-toggle" aria-label="Open surah list" aria-expanded="false">' +
				'<span class="quran-surah-name--english">' + escapeHTML(meta.englishName) + '</span>' +
				'<span><svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3.135 6.158a.5.5 0 0 1 .707-.023L7.5 9.565l3.658-3.43a.5.5 0 0 1 .684.73l-4 3.75a.5.5 0 0 1-.684 0l-4-3.75a.5.5 0 0 1-.023-.707Z" fill="currentColor" fill-rule="evenodd" clip-rule="evenodd"></path></svg></span>' +
				'</button>' +
				'<h2 class="quran-surah-name--arabic quran-text-arabic">' + escapeHTML(meta.name) + '</h2>' +
				'</div>';

			if (Array.isArray(meta.ayahs) && meta.ayahs.length) {
				meta.ayahs.forEach(function (item, index) {
					html +=
						'<div class="quran-surah-ayah--wrapper">' +
						'<div class="quran-surah-ayah--meta">' +
						'<div class="quran-surah-ayah-play" tabindex="0" role="button" aria-label="Play ayah audio" data-audio="https://cdn.islamic.network/quran/audio/128/ar.alafasy/' +
						escapeHTML(item.number) +
						'.mp3">' +
						'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M464 256A208 208 0 1 0 48 256a208 208 0 1 0 416 0zM0 256a256 256 0 1 1 512 0A256 256 0 1 1 0 256zM188.3 147.1c7.6-4.2 16.8-4.1 24.3 .5l144 88c7.1 4.4 11.5 12.1 11.5 20.5s-4.4 16.1-11.5 20.5l-144 88c-7.4 4.5-16.7 4.7-24.3 .5s-12.3-12.2-12.3-20.9V168c0-8.7 4.7-16.7 12.3-20.9z"/></svg>' +
						'</div>' +
						'<button class="qita-bookmark-btn quran-surah-ayah-bookmark" aria-pressed="false" title="Bookmark this ayah">★</button>' +
						'<div class="quran-surah-ayah--number quran-text-arabic">' + escapeHTML(meta.number) + ' : ' + escapeHTML(item.number) + '</div>' +
						'</div>' +
						'<div class="quran-surah-ayah--text quran-text-arabic"><span class="quran-single-ayah">' + escapeHTML(item.text) + '</span></div>' +
						'<div class="quran-surah-ayah--text"><span class="quran-single-ayah">' + escapeHTML(trans.ayahs && trans.ayahs[index] && trans.ayahs[index].text) + '</span></div>' +
						'</div>';
				});
			}
			return html;
		}

		function getSurahBySuahId(item, surahId = 1, doneCb) {
			if (!item) return;
			item.innerHTML = '<div class="quran-loading">Loading…</div>';
			const url = quranDynamicObj.api + '/surah/' + surahId + '/editions/quran-uthmani,en.asad';
			fetchCached(url, SURAH_TTL).then(function (response) {
				if (response && (response.code === 200 || response.code === '200') && response.data) {
					item.innerHTML = showAllAyahs(response.data);
					// background prefetch adjacent surahs for faster next navigation
					backgroundPrefetchSurahs(surahId);
					refreshBookmarksState();
					if (typeof doneCb === 'function') { try { doneCb(); } catch(e){} }
				} else {
					item.innerHTML = renderError('Could not load surah.');
				}
			});
		}

		function switchToSurah(surahNumber, cb){
		    const offcanvasArea = document.getElementById('dwl-surah-offcanvas');
		    const btn = document.getElementById('dwl-surah-number-' + String(surahNumber));
		    if (!btn) return;
		    const active = offcanvasArea && offcanvasArea.querySelector('.dwl-surah-name-btn.active');
		    if (active) active.classList.remove('active');
		    btn.classList.add('active');
		    const targedSelected = quranDynamicObj.mainWrapper.querySelector('.dwl-quran-surah.active');
		    if (targedSelected) targedSelected.classList.remove('active');
		    const targed = quranDynamicObj.mainWrapper.querySelector('#dwl-quran-surah-' + String(surahNumber));
		    if (targed) { targed.classList.add('active'); getSurahBySuahId(targed, surahNumber, cb); }
		    if (offcanvasArea) offcanvasArea.classList.remove('active-offcanvas');
		}

		// ---- Surah list -----------------------------------------------------
		function dwlSurahList(data) {
			let html = '<ul class="dwl-surah-list">';
			if (Array.isArray(data)) {
				data.forEach(function (item) {
					const active = Number(item.number) === 1 ? ' active' : '';
					html +=
						`<li>
							<button id="dwl-surah-number-${escapeHTML(item.number)}"
									class="dwl-surah-name-btn${active}"
									data-surah_number="${escapeHTML(item.number)}"
									aria-label="Surah ${escapeHTML(item.englishName)} - ${escapeHTML(item.englishNameTranslation)}">
							<div class="dwl-surah-row">
								<span class="dwl-surah--number">${escapeHTML(item.number)}</span>
								<div class="dwl-surah--meta">
								<span class="dwl-surah--english-name">${escapeHTML(item.englishName)}</span>
								<span class="dwl-surah--translation">${escapeHTML(item.englishNameTranslation)}</span>
								<span class="dwl-surah--arabic-name quran-text-arabic">${escapeHTML(item.name)}</span>
								</div>
							</div>
							</button>
						</li>`;
				});
			}
			html += '</ul>';
			return html;
		}

		const dwlSurahWrapper = document.getElementById('dwl-surah-listing');
		if (dwlSurahWrapper) {
			const url = quranDynamicObj.api + '/surah';
			fetchCached(url, LIST_TTL).then(function (response) {
				if (response && (response.code === 200 || response.code === '200') && response.data) {
					dwlSurahWrapper.innerHTML = dwlSurahList(response.data);
					// idle prefetch of first few surahs to warm cache
					idlePrefetch([1,2,3]);
				} else {
					dwlSurahWrapper.innerHTML = renderError('Could not load surah list.');
				}
			});
		}

		// ---- Background prefetch helpers -----------------------------------
		function idlePrefetch(ids){
			const run = () => {
				ids.forEach((id, idx)=>{
					setTimeout(()=>{
						const url = quranDynamicObj.api + '/surah/' + id + '/editions/quran-uthmani,en.asad';
						fetchCached(url, SURAH_TTL);
					}, idx * 500);
				});
			};
			if (typeof window.requestIdleCallback === 'function') {
				window.requestIdleCallback(run, { timeout: 2000 });
			} else {
				setTimeout(run, 1200);
			}
		}
		function backgroundPrefetchSurahs(current){
			const id = parseInt(current, 10) || 1;
			const next = Math.min(114, id + 1);
			const prev = Math.max(1, id - 1);
			idlePrefetch([next, prev]);
		}

		// ---- Event delegation (robust to inner SVG/span clicks) -------------
		document.addEventListener('click', function (e) {
			const surahBtn = e.target.closest('button.dwl-surah-name-btn');
			if (surahBtn) {
				const offcanvasArea = document.getElementById('dwl-surah-offcanvas');
				if (!offcanvasArea) return;

				const active = offcanvasArea.querySelector('.dwl-surah-name-btn.active');
				if (active) active.classList.remove('active');
				surahBtn.classList.add('active');

				const targedSelected = quranDynamicObj.mainWrapper.querySelector('.dwl-quran-surah.active');
				if (targedSelected) targedSelected.classList.remove('active');

				const targed = quranDynamicObj.mainWrapper.querySelector('#dwl-quran-surah-' + surahBtn.dataset.surah_number);
				if (targed) {
					targed.classList.add('active');
					getSurahBySuahId(targed, surahBtn.dataset.surah_number);
				}
				// close offcanvas
				offcanvasArea.classList.remove('active-offcanvas');
				return;
			}

			const openToggle = e.target.closest('.dwl-surah-toggle');
			if (openToggle) {
				const offcanvasArea = document.getElementById('dwl-surah-offcanvas');
				if (offcanvasArea) {
					offcanvasArea.classList.add('active-offcanvas');
					openToggle.setAttribute('aria-expanded', 'true');
				}
				return;
			}

			const closeBtn = e.target.closest('.dwl-surah-offcanvas-close');
			if (closeBtn) {
				const offcanvasArea = document.getElementById('dwl-surah-offcanvas');
				if (offcanvasArea) {
					offcanvasArea.classList.remove('active-offcanvas');
					const toggle = quranDynamicObj.mainWrapper.querySelector('.dwl-surah-toggle');
					if (toggle) toggle.setAttribute('aria-expanded', 'false');
				}
				return;
			}

			const playBtn = e.target.closest('.quran-surah-ayah-play');
			if (playBtn) {
				const audio = ensureAudioPlayer();
				const audioSrc = playBtn.dataset.audio;
				if (!audioSrc) return;
				const isSame = audio.src === audioSrc;
				if (audio.paused || !isSame) {
					playFromButton(playBtn);
				} else {
					audio.pause();
					setPlayingState(playBtn,false);
				}
			}

			const bmBtn = e.target.closest('.qita-bookmark-btn');
			if (bmBtn) {
				const wrap = bmBtn.closest('.quran-surah-ayah--wrapper');
				const play = wrap && wrap.querySelector('.quran-surah-ayah-play');
				const num  = wrap && wrap.querySelector('.quran-surah-ayah--number');
				const src  = play && play.dataset && play.dataset.audio;
				const label= num ? num.textContent.trim() : '';
				if (!src) return;
				const list = loadBookmarks();
				const idx = list.findIndex(b => b && b.src === src);
				if (idx >= 0) {
					list.splice(idx,1);
				} else {
					// Try to infer current surah number from label ("X : Y"), fallback to active button data
					let surahNo = null;
					const m = label.match(/^(\d+)\s*:/);
					if (m) surahNo = parseInt(m[1],10);
					if (!surahNo) {
						const activeBtn = document.querySelector('.dwl-surah-name-btn.active');
						if (activeBtn) surahNo = parseInt(activeBtn.getAttribute('data-surah_number'),10);
					}
					list.push({ src: src, label: label, surah: surahNo || null, ts: Date.now() });
				}
				saveBookmarks(list);
				refreshBookmarksState();
				return;
			}
		});

		// Keyboard support for the play button (Enter/Space)
		document.addEventListener('keydown', function (e) {
			if ((e.key === 'Enter' || e.key === ' ') && e.target && e.target.classList && e.target.classList.contains('quran-surah-ayah-play')) {
				e.preventDefault();
				e.target.click();
			}
		});

		// ---- Initial loads --------------------------------------------------
		// Create footer player bar
		injectPlayerBar();
		const dwlQuranSurahActive = document.querySelectorAll('.dwl-quran-surah.active');
		dwlQuranSurahActive.forEach(function (item) {
			getSurahBySuahId(item, item.dataset.surah);
		});

		const dwlQuranSurahAyah = document.querySelectorAll('.dwl-quran-ayah-wrapper');
		dwlQuranSurahAyah.forEach(function (item) {
			item.innerHTML = '<div class="quran-loading">Loading…</div>';
			const url = quranDynamicObj.api + '/ayah/' + item.dataset.ayah + '/editions/quran-uthmani,en.asad';
			fetchCached(url, AYAH_TTL).then(function (response) {
				if (response && (response.code === 200 || response.code === '200') && response.data) {
					item.innerHTML = outputSingleAyah(response.data);
					refreshBookmarksState();
				} else {
					item.innerHTML = renderError('Could not load ayah.');
				}
			});
		});

		// Restore last played audio source (no autoplay)
		try {
			const last = JSON.parse(localStorage.getItem(LAST_AUDIO_KEY) || 'null');
			if (last && last.src) {
				const btns = quranDynamicObj.mainWrapper.querySelectorAll('.quran-surah-ayah-play');
				btns.forEach(b => {
					if (b.dataset && b.dataset.audio === last.src) {
						ensureAudioPlayer().src = last.src;
						b.classList.add('was-last-played');
					}
				});
			}
		} catch(e){}
	}

	dynamicQuranApi();
})();
