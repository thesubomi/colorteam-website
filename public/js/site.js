(function(){
  /* size each rolling digit column to its final digit so 10+ and 200+ have natural spacing */
  function fitDigits(){document.querySelectorAll('.roll').forEach(function(col){
    var last=col.lastElementChild; if(!last||!last.firstChild)return;
    var r=document.createRange(); r.selectNodeContents(last); var w=r.getBoundingClientRect().width;
    if(w)col.style.width=Math.ceil(w)+'px';});}
  fitDigits(); if(document.fonts&&document.fonts.ready)document.fonts.ready.then(fitDigits); window.addEventListener('resize',fitDigits);

  var navbar=document.querySelector('.navbar');
  /* Spotify section: load the official Spotify embed on demand; fall back to opening Spotify if the host blocks the player */
  (function(){var player=document.getElementById('ct-sp-player');if(!player)return;
    var start=document.getElementById('ct-sp-start'),openA=document.getElementById('ct-sp-open'),blocked=false;
    function fallback(){blocked=true;var id=player.getAttribute('data-ep');
      player.innerHTML='<div class="ct-sp-blocked"><span>The player can’t load in this preview. It will play here on colorteam.io.</span><a href="https://open.spotify.com/episode/'+id+'" target="_blank" rel="noopener">Listen on Spotify</a></div>';}
    document.addEventListener('securitypolicyviolation',function(e){if(String(e.blockedURI).indexOf('spotify')>-1)fallback();});
    function load(){var id=player.getAttribute('data-ep');if(blocked){fallback();return;}
      player.innerHTML='<iframe title="Spotify episode player" src="https://open.spotify.com/embed/episode/'+id+'?utm_source=generator&theme=0" width="100%" height="152" frameborder="0" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy"></iframe>';}
    if(start)start.addEventListener('click',load);
    document.querySelectorAll('.ct-sp-card').forEach(function(c){c.addEventListener('click',function(){
      document.querySelectorAll('.ct-sp-card').forEach(function(x){x.classList.toggle('is-active',x===c)});
      var id=c.getAttribute('data-ep'),n=c.getAttribute('data-num');player.setAttribute('data-ep',id);
      document.getElementById('ct-sp-cover').src='/img/pod-ep'+n+'.webp';document.getElementById('ct-sp-big').textContent='EP '+n;
      document.getElementById('ct-sp-title').textContent=c.getAttribute('data-title');document.getElementById('ct-sp-guest').textContent=c.getAttribute('data-guest');
      document.getElementById('ct-sp-role').textContent=c.getAttribute('data-role');
      document.getElementById('ct-sp-label').lastChild.textContent=(n===document.querySelector('.ct-sp-card').getAttribute('data-num'))?'Latest episode':'Episode '+n;
      if(openA)openA.href='https://open.spotify.com/episode/'+id;load();
      var f=document.querySelector('.ct-sp-feature');if(f&&f.getBoundingClientRect().top<0)f.scrollIntoView({behavior:'smooth',block:'start'});});});
  })();
  /* hero stats carousel: auto-scrolls, and follows sideways trackpad / shift-wheel / touch swipes */
  document.querySelectorAll('.ct-stats').forEach(function(box){var tr=box.querySelector('.ct-stats-track');if(!tr)return;
    box.classList.add('is-js');var x=0,half=0,hover=false,hold=0,last=performance.now(),tx=null,ty=null;
    var still=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    function measure(){half=tr.scrollWidth/2;}measure();window.addEventListener('resize',measure);
    if(document.fonts&&document.fonts.ready)document.fonts.ready.then(measure);
    function wrap(){if(!half)return;x=x%half;if(x>0)x-=half;}
    function nudge(dx){x-=dx;hold=performance.now()+1600;wrap();}
    box.addEventListener('mouseenter',function(){hover=true});box.addEventListener('mouseleave',function(){hover=false});
    box.addEventListener('wheel',function(e){var dx=e.deltaX||(e.shiftKey?e.deltaY:0);
      if(dx&&Math.abs(dx)>=Math.abs(e.shiftKey?0:e.deltaY)){e.preventDefault();nudge(dx*(e.deltaMode===1?16:1));}},{passive:false});
    box.addEventListener('touchstart',function(e){tx=e.touches[0].clientX;ty=e.touches[0].clientY},{passive:true});
    box.addEventListener('touchmove',function(e){if(tx===null)return;var cx=e.touches[0].clientX,cy=e.touches[0].clientY;
      if(Math.abs(cx-tx)>Math.abs(cy-ty)){nudge(tx-cx);}tx=cx;ty=cy;},{passive:true});
    box.addEventListener('touchend',function(){tx=null});
    function tick(t){var dt=Math.min(t-last,64);last=t;
      if(!still&&!hover&&t>hold)x-=dt*0.055;wrap();
      tr.style.transform='translate3d('+x.toFixed(2)+'px,0,0)';requestAnimationFrame(tick);}
    requestAnimationFrame(tick);});
  var top=document.querySelector('.ct-totop');
  var sd=document.querySelector('.ct-scrolldown');
  if(sd)sd.addEventListener('click',function(){var pg=document.querySelector('.ct-page:not([hidden])');var hero=pg&&pg.querySelector('.section.hero');
    var next=hero?hero.nextElementSibling:null;window.scrollTo({top:next?next.getBoundingClientRect().top+window.scrollY-80:window.innerHeight*.85,behavior:'smooth'})});
  var lastY=window.scrollY;
  function onScroll(){var y=window.scrollY,d=y-lastY;
    if(navbar){navbar.classList.toggle('is-scrolled',y>12);
      var open=document.querySelector('.w-nav-menu.w--open');
      /* header hides while scrolling up and comes back while scrolling down (as requested); always shown near the top */
      if(y<80||open){navbar.classList.remove('is-hidden')}else if(Math.abs(d)>6){navbar.classList.toggle('is-hidden',d<0)}}
    if(Math.abs(d)>6||y<80)lastY=y;
    if(top)top.classList.toggle('is-visible',y>600);
    if(sd)sd.classList.toggle('is-hidden',y>160)}
  if(top)top.addEventListener('click',function(){window.scrollTo({top:0,behavior:'smooth'})});
  window.addEventListener('scroll',onScroll,{passive:true});onScroll();
  var btn=document.querySelector('.w-nav-button'),menu=document.querySelector('.w-nav-menu');
  if(btn&&menu){btn.setAttribute('role','button');btn.setAttribute('tabindex','0');btn.setAttribute('aria-label','Menu');
    var t=function(){var o=menu.classList.toggle('w--open');btn.classList.toggle('w--open',o);btn.setAttribute('aria-expanded',o)};
    btn.addEventListener('click',t);btn.addEventListener('keydown',function(e){if(e.key==='Enter'||e.key===' '){e.preventDefault();t()}});
    menu.addEventListener('click',function(e){if(e.target.closest('a'))menu.classList.remove('w--open')});}
  document.querySelectorAll('[data-tab]').forEach(function(tab){
    tab.addEventListener('click',function(e){e.preventDefault();var k=tab.getAttribute('data-tab');
      document.querySelectorAll('[data-tab]').forEach(function(x){x.classList.toggle('w--current',x===tab)});
      document.querySelectorAll('[data-pane]').forEach(function(p){p.classList.toggle('w--tab-active',p.getAttribute('data-pane')===k)});});
  });
  /* newsletter: submits to HubSpot Forms (portal 145992220). Set HS_FORM to the form's GUID to switch it on. */
  var HS_PORTAL='145992220',HS_FORM='c5ca2739-8389-4060-a664-84c60a29286e';
  var f=document.getElementById('newsletter');
  if(f){f.addEventListener('submit',function(e){e.preventDefault();
    var n=f.parentNode.parentNode.querySelector('.form-note');
    if(!n){n=document.createElement('p');n.className='form-note';f.parentNode.parentNode.insertBefore(n,f.parentNode.nextSibling)}
    var inp=f.querySelector('input[type=email]'),btn=f.querySelector('[type=submit]'),email=(inp.value||'').trim();
    var fn=(f.querySelector('#newsletter-firstname')||{}).value||'',ln=(f.querySelector('#newsletter-lastname')||{}).value||'';fn=fn.trim();ln=ln.trim();
    if(!fn||!ln){n.textContent='Please add your first and last name.';return;}
    if(!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)){n.textContent='Please enter a valid email address.';inp.focus();return;}
    if(!HS_FORM){n.textContent='Thanks. Newsletter sign-up is being connected.';return;}
    var hutk=(document.cookie.match(/(?:^|; )hubspotutk=([^;]+)/)||[])[1];
    var ctx={pageUri:location.href,pageName:document.title};if(hutk)ctx.hutk=hutk;
    btn.disabled=true;n.textContent='Subscribing…';
    fetch('https://api.hsforms.com/submissions/v3/integration/submit/'+HS_PORTAL+'/'+HS_FORM,{method:'POST',headers:{'Content-Type':'application/json'},
      body:JSON.stringify({fields:[{objectTypeId:'0-1',name:'firstname',value:fn},{objectTypeId:'0-1',name:'lastname',value:ln},{objectTypeId:'0-1',name:'email',value:email}],context:ctx})})
    .then(function(r){if(!r.ok)throw r;n.textContent='Thanks '+fn+', you are subscribed. Look out for our next update.';f.reset();})
    .catch(function(){n.textContent='Something went wrong. Please try again, or email subomi@colorteam.io.';})
    .finally(function(){btn.disabled=false;});});}
  /* analytics: every "Book a call" click is logged in HubSpot as a visit to /book-a-call (links open in a new tab, so the hit completes) */
  document.addEventListener('click',function(e){
    var a=e.target.closest&&e.target.closest('a[href*="calendar.app.google"]');if(!a)return;
    var q=window._hsq=window._hsq||[],p=location.pathname;
    q.push(['setPath','/book-a-call']);q.push(['trackPageView']);q.push(['setPath',p]);
  });
  /* cookie settings: re-opens the HubSpot consent banner so visitors can change their choice */
  document.addEventListener('click',function(e){
    var a=e.target.closest&&e.target.closest('.ct-cookie-settings');if(!a)return;
    e.preventDefault();(window._hsp=window._hsp||[]).push(['showBanner']);
  });
})();
