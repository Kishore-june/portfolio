'use strict';

/* PRELOADER */
document.body.style.overflow = 'hidden';
window.addEventListener('load', () => {
  setTimeout(() => {
    document.getElementById('preloader')?.classList.add('out');
    document.body.style.overflow = '';
    setTimeout(animCounters, 900);
  }, 1600);
});

/* THEME */
(function () {
  const saved = localStorage.getItem('ks-theme') || 'dark';
  document.documentElement.setAttribute('data-theme', saved);
  const btn = document.getElementById('themeBtn');
  if (btn) btn.textContent = saved === 'dark' ? '🌙' : '☀️';
})();
document.getElementById('themeBtn')?.addEventListener('click', () => {
  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  const next = isDark ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', next);
  document.getElementById('themeBtn').textContent = next === 'dark' ? '🌙' : '☀️';
  localStorage.setItem('ks-theme', next);
});

/* CURSOR */
const cur = document.getElementById('cur'), curR = document.getElementById('cur-r');
if (cur && curR && window.matchMedia('(hover:hover)').matches) {
  let mx = 0, my = 0, rx = 0, ry = 0;
  document.addEventListener('mousemove', e => {
    mx = e.clientX; my = e.clientY;
    cur.style.left = mx + 'px'; cur.style.top = my + 'px';
  });
  (function loop() { rx += (mx-rx)*.13; ry += (my-ry)*.13; curR.style.left=rx+'px'; curR.style.top=ry+'px'; requestAnimationFrame(loop); })();
  document.addEventListener('mouseover', e => {
    if (e.target.closest('a,button,.pj-card,.bl-card,.sk-card,.repo-card,.ct-item,.info-c')) {
      cur.style.transform='translate(-50%,-50%) scale(1.9)'; curR.style.opacity='.2';
    }
  });
  document.addEventListener('mouseout', e => {
    if (e.target.closest('a,button,.pj-card,.bl-card,.sk-card,.repo-card,.ct-item,.info-c')) {
      cur.style.transform='translate(-50%,-50%) scale(1)'; curR.style.opacity='.5';
    }
  });
} else if (cur && curR) {
  cur.style.display = 'none'; curR.style.display = 'none';
}

/* HAMBURGER */
const ham = document.getElementById('ham'), mobNav = document.getElementById('mobNav');
if (ham && mobNav) {
  ham.addEventListener('click', () => {
    const open = mobNav.classList.toggle('open');
    ham.textContent = open ? '✕' : '☰';
    ham.setAttribute('aria-expanded', open);
  });
  document.querySelectorAll('.mob-nav a').forEach(a => a.addEventListener('click', () => {
    mobNav.classList.remove('open'); ham.textContent = '☰';
  }));
  document.addEventListener('click', e => {
    if (!mobNav.contains(e.target) && !ham.contains(e.target)) {
      mobNav.classList.remove('open'); ham.textContent = '☰';
    }
  });
}

/* SCROLL REVEAL */
const ro = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) e.target.classList.add('on'); }), { threshold: .1 });
document.querySelectorAll('.rev').forEach(el => ro.observe(el));

/* PROGRESS BARS */
const po = new IntersectionObserver(es => es.forEach(e => {
  if (e.isIntersecting) { e.target.querySelectorAll('.prog-f').forEach(b => { b.style.width = (b.dataset.w||0)+'%'; }); po.unobserve(e.target); }
}), { threshold: .3 });
document.querySelectorAll('.sk-card').forEach(c => po.observe(c));

/* COUNTER ANIMATION — CGPA decimal fix */
function animNum(id, target, suffix, isFloat) {
  const el = document.getElementById(id); if (!el) return;
  const dur = 1500, t0 = performance.now();
  (function step(now) {
    const p = Math.min((now-t0)/dur,1), ease = 1-Math.pow(1-p,3);
    const val = isFloat ? (ease*target).toFixed(1) : Math.round(ease*target);
    el.innerHTML = val + (suffix ? `<s>${suffix}</s>` : '');
    if (p < 1) requestAnimationFrame(step);
    else el.innerHTML = (isFloat ? target.toFixed(1) : target) + (suffix ? `<s>${suffix}</s>` : '');
  })(t0);
}
function animCounters() {
  animNum('cnt-proj', 6,  '+');
  animNum('cnt-int',  3,  '+');
  animNum('cnt-ml',  90,  '%');
  animNum('cnt-cgpa', 8.5, '', true);
}

/* ACTIVE NAV */
const nls = document.querySelectorAll('.nav-ul a,.mob-nav a');
const so = new IntersectionObserver(es => es.forEach(e => {
  if (e.isIntersecting) nls.forEach(a => a.classList.toggle('active', a.getAttribute('href')==='#'+e.target.id));
}), { threshold: .4 });
document.querySelectorAll('section[id]').forEach(s => so.observe(s));

/* GITHUB — name + description only, no stars/lang */
async function loadGitHub() {
  const user = 'Kishore-June';
  try {
    const [uRes, rRes] = await Promise.all([
      fetch(`https://api.github.com/users/${user}`),
      fetch(`https://api.github.com/users/${user}/repos?sort=updated&per_page=8`)
    ]);
    if (!uRes.ok) throw new Error('GitHub ' + uRes.status);
    const [u, repos] = await Promise.all([uRes.json(), rRes.json()]);
    const set = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = v; };
    set('gh-name',      u.name || 'Kishore S');
    set('gh-bio',       u.bio  || 'Full Stack Developer · ML Engineer · UI/UX Designer');
    set('gh-repos',     u.public_repos ?? '—');
    set('gh-followers', u.followers    ?? '—');
    set('gh-following', u.following    ?? '—');
    const av = document.getElementById('gh-avatar');
    if (av && u.avatar_url) {
      const img = document.createElement('img');
      img.src=u.avatar_url; img.alt='Kishore'; img.loading='lazy'; img.width=64; img.height=64;
      av.innerHTML=''; av.appendChild(img);
    }
    const grid = document.getElementById('gh-repos-grid');
    if (!grid) return;
    if (Array.isArray(repos) && repos.length) {
      grid.innerHTML = repos.map(r => `
        <a href="${r.html_url}" target="_blank" rel="noopener noreferrer" class="repo-card" aria-label="${r.name}">
          <div class="repo-name">📁 ${r.name}</div>
          <div class="repo-desc">${r.description || 'No description yet.'}</div>
        </a>`).join('');
    } else {
      grid.innerHTML = '<div class="gh-loading">No public repos found.</div>';
    }
  } catch {
    const grid = document.getElementById('gh-repos-grid');
    if (grid) grid.innerHTML = `<div class="gh-loading">GitHub unavailable. <a href="https://github.com/Kishore-June" target="_blank" rel="noopener" style="color:var(--accent)">View on GitHub →</a></div>`;
  }
}
loadGitHub();

/* PROJECT FILTER */
document.querySelectorAll('.fb').forEach(btn => btn.addEventListener('click', () => {
  document.querySelectorAll('.fb').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  const f = btn.dataset.f;
  document.querySelectorAll('.pj-card').forEach(c => c.classList.toggle('hide', f!=='all' && c.dataset.c!==f));
}));

/* CASE STUDY MODAL */
const CS = {
  sl: {
    cat:'Machine Learning · Computer Vision', title:'Sign Language Detection System', badge:'⚡ 90% Accuracy',
    prob:'Sign language is a major communication barrier. Existing solutions needed expensive hardware or had poor accuracy. Goal: a real-time, webcam-based software system accessible to all.',
    approach:'Used MobileNet V2 (ImageNet pre-trained) for transfer learning. Custom preprocessing: frame normalization, hand-region cropping via OpenCV, augmentation (flip, rotation, brightness).',
    arch:`[Webcam Input] → [OpenCV Frame Capture]\n      ↓\n[Preprocessing: Resize 224×224, Normalize, Augment]\n      ↓\n[MobileNet V2 (Frozen)] → [Custom Head: GlobalAvgPool → Dense(256) → Dropout → Softmax]\n      ↓\n[Real-time Prediction: Class + Confidence]`,
    challenges:['65% initial accuracy → ReduceLROnPlateau + stronger augmentation.','Real-time latency → optimized frame buffer + thumbnail inference.','Class imbalance → focal loss + class-weight balancing.','Overfitting at epoch 15 → early stopping + dropout.'],
    results:{a:'90%',b:'26',c:'24fps'}, rl:['Val Accuracy','Sign Classes','FPS'],
    tech:['Python','TensorFlow','Keras','OpenCV','MobileNet V2','NumPy','Transfer Learning']
  },
  nf: {
    cat:'Data Analytics · Power BI', title:'Netflix Analytics Dashboard', badge:'10+ Visualizations',
    prob:'Raw Netflix CSV data with no visual interface. Needed interactive insights on content trends, genre distribution, regional breakdown.',
    approach:'Full ETL in Power Query: clean nulls, split multi-value columns, normalize. Star schema model. All 10+ visuals cross-filter.',
    arch:`[Raw CSV 8K+ Records] → [Power Query ETL]\n  → Remove nulls, split multi-value cols\n      ↓\n[Star Schema: Fact(Content) + Dim(Genre, Country, Year)]\n      ↓\n[DAX: Growth Rate, Genre %, Ratio] → [10+ Cross-filtered Visuals]`,
    challenges:['Multi-value columns → Power Query List.Transform.','8K-row performance → aggregation tables + composite model.'],
    results:{a:'10+',b:'8K+',c:'100%'}, rl:['Visuals','Records','Interactive'],
    tech:['Power BI','SQL','DAX','Power Query','ETL','Star Schema']
  },
  ch: {
    cat:'Web Development · Full Stack', title:'Django Chat Application', badge:'REST API · Full Stack',
    prob:'Needed a real full-stack project showing complete backend architecture.',
    approach:'Django REST Framework GET/POST endpoints with serializers. JS frontend polls every 2 seconds.',
    arch:`[JS Frontend] → GET/POST /messages\n      ↓\n[Django REST Framework]\n  → Router → APIView → Serializers\n      ↓\n[Django ORM → SQLite]`,
    challenges:['CORS errors → django-cors-headers.','Real-time without WebSockets → 2s polling.'],
    results:{a:'REST',b:'SQLite',c:'Responsive'}, rl:['API','Database','UI'],
    tech:['Django','DRF','JavaScript','SQLite','HTML5','CSS3','JSON']
  }
};
function openModal(id) {
  const d = CS[id]; if (!d) return;
  const body = document.getElementById('modal-body'); if (!body) return;
  body.innerHTML = `
    <div class="m-cat">${d.cat}</div><div class="m-title">${d.title}</div><div class="m-badge">${d.badge}</div>
    <div class="m-s"><h3>Problem</h3><p>${d.prob}</p></div>
    <div class="m-s"><h3>Approach</h3><p>${d.approach}</p></div>
    <div class="m-s"><h3>Architecture</h3><div class="arch-box">${d.arch}</div></div>
    <div class="m-s"><h3>Challenges</h3><ul>${d.challenges.map(c=>`<li>${c}</li>`).join('')}</ul></div>
    <div class="m-s"><h3>Results</h3><div class="res-g">${[0,1,2].map(i=>`<div class="res-b"><div class="res-n">${Object.values(d.results)[i]}</div><div class="res-l">${d.rl[i]}</div></div>`).join('')}</div></div>
    <div class="m-s"><h3>Tech Stack</h3><div class="m-tech-row">${d.tech.map(t=>`<span class="m-tt">${t}</span>`).join('')}</div></div>`;
  document.getElementById('overlay').classList.add('open');
  document.body.style.overflow = 'hidden';
  setTimeout(() => document.querySelector('#modal-c .m-close')?.focus(), 50);
}
function closeModal() {
  document.getElementById('overlay')?.classList.remove('open');
  document.body.style.overflow = '';
}
document.getElementById('overlay')?.addEventListener('click', e => { if (e.target.id==='overlay') closeModal(); });
document.addEventListener('keydown', e => { if (e.key==='Escape') closeModal(); });

/* BLOG MODALS */
const BLOGS = {
  b1: {
    tag:'Machine Learning', title:'How I Built a Sign Language Detector with 90% Accuracy', date:'5 min read · June 2025',
    content:`<p>When I started this project, I was getting 65% accuracy. The problem wasn't the model — it was the data pipeline.</p><h4>Transfer Learning Was the Key</h4><p>Instead of training from scratch, I used MobileNet V2 pre-trained on ImageNet. I froze the base layers and added a custom head: <code>GlobalAveragePooling → Dense(256, relu) → Dropout(0.5) → Softmax</code>.</p><h4>Three Fixes That Got Me to 90%</h4><ol><li><b>Aggressive augmentation</b> — random brightness, contrast, flips, zoom.</li><li><b>ReduceLROnPlateau</b> — dropped learning rate when validation loss plateaued.</li><li><b>Focal loss + class weights</b> — addressed class imbalance across 26 signs.</li></ol><p><b>Lesson:</b> 80% of your accuracy gains come from data quality and pipeline design.</p>`
  },
  b2: {
    tag:'Deep Learning', title:'What I Learned Building a CNN from Scratch', date:'4 min read · May 2025',
    content:`<p>Most tutorials hand you a pre-built model. I built one from scratch in Keras, layer by layer.</p><h4>Convolutions Are Just Filters</h4><p>A convolutional layer applies a small filter across the image, producing a feature map. Stack enough layers and the network learns hierarchical features — edges → shapes → objects.</p><h4>Why Transfer Learning Wins</h4><p>Training from scratch on a small dataset leads to overfitting. A model pre-trained on ImageNet has already learned millions of useful features. My scratch CNN hit 71% accuracy. MobileNet V2 hit 90%. Same data.</p><p><b>Lesson:</b> Understand CNNs conceptually, but use transfer learning in practice.</p>`
  },
  b3: {
    tag:'Full Stack', title:'Django REST APIs: What Nobody Tells You', date:'6 min read · Apr 2025',
    content:`<p>Django's docs are comprehensive — but they skip the parts that bite you in real projects.</p><h4>CORS Will Break You First</h4><p>When your frontend on port 3000 calls Django on port 8000, the browser blocks it. Fix: install <code>django-cors-headers</code> and set <code>CORS_ALLOWED_ORIGINS</code>. Never use <code>CORS_ALLOW_ALL_ORIGINS = True</code> in production.</p><h4>Serializers Are More Powerful Than You Think</h4><p>Use <code>validate_&lt;field&gt;</code> for field-level validation and <code>validate()</code> for cross-field logic. Keeps validation out of views and makes it testable.</p><h4>ViewSets vs APIView</h4><p>Use <code>ViewSet</code> for full CRUD. Use <code>APIView</code> when you need precise control. I used APIView for the chat app — only GET and POST needed.</p>`
  }
};
function openBlog(id) {
  const b = BLOGS[id]; if (!b) return;
  const body = document.getElementById('modal-body'); if (!body) return;
  body.innerHTML = `<div class="m-cat">${b.tag}</div><div class="m-title" style="font-size:1.35rem">${b.title}</div><div class="m-badge" style="margin-bottom:22px">${b.date}</div><div class="blog-content">${b.content}</div>`;
  document.getElementById('overlay').classList.add('open');
  document.body.style.overflow = 'hidden';
}

/* TOAST */
function showToast(msg, type) {
  document.getElementById('ks-toast')?.remove();
  const t = document.createElement('div');
  t.id = 'ks-toast'; t.setAttribute('role','alert');
  t.className = 'ks-toast ks-toast-'+(type||'success');
  t.innerHTML = `<span>${type==='error'?'❌':'✅'}</span> ${msg}`;
  document.body.appendChild(t);
  requestAnimationFrame(() => requestAnimationFrame(() => t.classList.add('show')));
  setTimeout(() => { t.classList.remove('show'); setTimeout(() => t.remove(), 400); }, 4200);
}

/* CONTACT FORM */
function validateEmail(e) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e.trim()); }

async function submitForm() {
  const nm=document.getElementById('fn'), em=document.getElementById('fe'),
        msg=document.getElementById('fm'), stat=document.getElementById('fstat'),
        btn=document.getElementById('sub-btn');
  if (!nm||!em||!msg||!btn) return;

  let ok = true;
  [nm,em,msg].forEach(f => f.classList.remove('err'));
  ['en','ee','em'].forEach(id => document.getElementById(id)?.classList.remove('show'));

  if (!nm.value.trim())            { nm.classList.add('err');  document.getElementById('en')?.classList.add('show'); ok=false; }
  if (!validateEmail(em.value))    { em.classList.add('err');  document.getElementById('ee')?.classList.add('show'); ok=false; }
  if (msg.value.trim().length<10)  { msg.classList.add('err'); document.getElementById('em')?.classList.add('show'); ok=false; }

  if (!ok) { showToast('Please fix the errors above.','error'); return; }

  btn.disabled=true; btn.textContent='Sending…';
  if (stat) { stat.textContent=''; stat.className='f-status'; }

  const payload = { name:nm.value.trim(), email:em.value.trim(), message:msg.value.trim() };

  try {
    const r = await fetch('/api/contact', {
      method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify(payload), signal: AbortSignal.timeout(12000)
    });
    const d = await r.json();
    if (d.success) {
      nm.value=''; em.value=''; msg.value='';
      if (stat) { stat.textContent="✓ Message sent!"; stat.className='f-status ok'; }
      showToast("Message sent! I'll reply within 24 hours 🎉",'success');
    } else {
      const errMsg = d.error || 'Something went wrong.';
      showToast(errMsg,'error');
      if (stat) { stat.textContent=errMsg; stat.className='f-status er'; }
    }
  } catch {
    // Fallback: FormSubmit (no credentials needed)
    try {
      const fd = new FormData();
      fd.append('name', payload.name);
      fd.append('email', payload.email);
      fd.append('message', payload.message);
      fd.append('_subject','Portfolio message from '+payload.name);
      fd.append('_captcha','false');
      fd.append('_template','table');
      const r2 = await fetch('https://formsubmit.co/ajax/kishore.sakthi1806@gmail.com', {
        method:'POST', headers:{'Accept':'application/json'}, body:fd
      });
      const d2 = await r2.json();
      if (d2.success==='true'||d2.success===true) {
        nm.value=''; em.value=''; msg.value='';
        if (stat) { stat.textContent="✓ Message sent!"; stat.className='f-status ok'; }
        showToast("Message sent! I'll reply within 24 hours 🎉",'success');
      } else throw new Error('FormSubmit failed');
    } catch {
      const fb = 'Network error. Email me directly at kishore.sakthi1806@gmail.com';
      if (stat) { stat.textContent=fb; stat.className='f-status er'; }
      showToast(fb,'error');
    }
  } finally {
    btn.disabled=false; btn.textContent='Send Message';
  }
}

/* PHONE REVEAL */
function revealPhone() {
  const val = document.getElementById('phone-val');
  if (!val) return;
  val.innerHTML = '<a href="tel:+918637617688" style="color:var(--accent);font-family:JetBrains Mono,monospace;font-weight:600;text-decoration:none">+91 86376 17688</a>';
}

/* ═══════════════════════════════════════════════════════
   CHATBOT
   FIX 4: Empty input shows feedback, does NOT send request
   FIX 7: Improved keyword rules and unknown-query fallback
═══════════════════════════════════════════════════════ */
function toggleChat() {
  const bot = document.getElementById('chatbot'); if (!bot) return;
  const open = bot.classList.toggle('open');
  document.getElementById('chat-fab')?.setAttribute('aria-expanded', open);
  if (open) setTimeout(() => document.getElementById('ch-inp')?.focus(), 80);
}
function qa(q) { const i = document.getElementById('ch-inp'); if (i) i.value=q; sendMsg(); }

// FIX 7: Improved keyword rules
const KB_RULES = [
  [['python','java','javascript','js','sql','language','coding','code','program'],
   "Kishore works with Python, JavaScript, Java, and SQL. Python is his strongest — used for ML models, Flask backends, and automation."],
  [['react','frontend','html','css','bootstrap','responsive','ui','webpage','website'],
   "Kishore builds frontends with React, HTML5, CSS3, and Bootstrap with a focus on responsive, accessible design."],
  [['django','flask','backend','api','rest','server','endpoint','json','database','db','mysql','sqlite'],
   "Kishore builds backends with Django and Flask — REST APIs with serialization, authentication, and SQLite/MySQL databases."],
  [['tensorflow','keras','ml','machine learning','ai','deep learning','neural','cnn','model','sign language','mobilenet','opencv','accuracy','90','transfer learning','computer vision'],
   "Kishore's star ML project: real-time Sign Language Detection with 90% accuracy using MobileNet V2 transfer learning, TensorFlow, and OpenCV."],
  [['figma','design','uiux','ui/ux','wireframe','prototype','framer','mockup'],
   "Kishore designs in Figma — wireframes, high-fidelity mockups, and prototypes. He redesigned 5+ pages during his BLS 360 internship."],
  [['power bi','powerbi','dax','dashboard','data','analytics','etl','power query','visualization'],
   "Kishore built a Netflix Analytics Dashboard in Power BI with 10+ cross-filtered visualizations using DAX measures and Power Query ETL."],
  [['project','built','portfolio','work','app','application','github','repo'],
   "Projects: Sign Language Detection (90% ML), Netflix Dashboard (Power BI), Django Chat App (REST API), To-Do App (JS), DOCX→PDF Converter, CGPA Calculator."],
  [['intern','internship','experience','bls','jai','j.ai','raven','work history','company'],
   "3 internships: UI/UX Design at BLS 360, Developer & Testing at J.AI (JMeter), and 8 months as Junior Accountant at Raven & Co."],
  [['education','degree','college','msc','bsc','cgpa','university','study','course'],
   "M.Sc IT at D.G. Vaishnav College (CGPA 8.5, expected 2026) + B.Sc CS in 2023 (CGPA 7.8)."],
  [['hire','contact','available','job','open to work','full-time','freelance','opportunity','role','recruit'],
   "Yes! Kishore is actively seeking Full Stack, ML, or UI/UX roles — internships, full-time, or freelance. Use the contact form to reach him."],
  [['location','where','city','chennai','india','remote','timezone'],
   "Kishore is based in Chennai, Tamil Nadu, India. Open to remote work globally."],
  [['achievement','award','prize','competition','won','seminar'],
   "Kishore won 1st Prize in a Technical Seminar on Cloud & DeepFake, and 2nd Prize in Graphical Design — both in 2025."],
  [['resume','cv','download'],
   "Download Kishore's resume using the ⬇ Resume button at the top of the page."],
  [['hello','hi','hey','namaste','hola','greetings'],
   "Hi! 👋 I'm Kishore's portfolio assistant. Ask me about his skills, projects, experience, or how to hire him!"],
  [['thank','thanks','bye','goodbye'],
   "You're welcome! Use the contact form if you'd like to reach Kishore directly. 😊"],
  [['who','about','kishore','introduce','tell me'],
   "Kishore S is a Full Stack Developer + ML Engineer + UI/UX Designer from Chennai. He's built real-world apps, completed 3 internships, and has an ML model with 90% accuracy."]
];

function localReply(q) {
  const m = q.toLowerCase();
  for (const [keywords, reply] of KB_RULES) {
    if (keywords.some(k => m.includes(k))) return reply;
  }
  // FIX 7: improved unknown-query response
  return "I can answer questions about Kishore's skills, projects, experience, education, or availability. Try asking about 'Python', 'ML project', 'internships', or 'open to work'!";
}

// FIX 4: Empty input shows feedback, no request sent
async function sendMsg() {
  const input = document.getElementById('ch-inp');
  const msgs  = document.getElementById('ch-msgs');
  if (!input || !msgs) return;

  const txt = input.value.trim();

  // FIX 4: empty input guard
  if (!txt) {
    const hint = document.createElement('div');
    hint.className = 'msg bot';
    hint.textContent = '⚠️ Please enter a message first.';
    hint.style.opacity = '0.7';
    msgs.appendChild(hint);
    msgs.scrollTop = msgs.scrollHeight;
    setTimeout(() => hint.remove(), 3000);
    input.focus();
    return;
  }

  input.value = '';

  const ud = document.createElement('div'); ud.className='msg user'; ud.textContent=txt;
  msgs.appendChild(ud);
  const td = document.createElement('div'); td.className='msg bot ty'; td.id='typing-ind'; td.textContent='Thinking…';
  msgs.appendChild(td); msgs.scrollTop=msgs.scrollHeight;

  document.getElementById('ch-quick').style.display='none';

  let reply = localReply(txt);

  try {
    const res = await fetch('/api/chat', {
      method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({message:txt}), signal: AbortSignal.timeout(8000)
    });
    if (res.ok) { const d=await res.json(); if (d&&d.reply) reply=d.reply; }
  } catch { /* use local reply */ }

  document.getElementById('typing-ind')?.remove();
  const bd = document.createElement('div'); bd.className='msg bot'; bd.textContent=reply;
  msgs.appendChild(bd); msgs.scrollTop=msgs.scrollHeight;
}

/* SMOOTH SCROLL */
document.querySelectorAll('a[href^="#"]').forEach(a => a.addEventListener('click', e => {
  const target = document.querySelector(a.getAttribute('href'));
  if (target) { e.preventDefault(); target.scrollIntoView({behavior:'smooth',block:'start'}); }
}));
