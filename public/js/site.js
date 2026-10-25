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
      openA.href='https://open.spotify.com/episode/'+id;load();
      var f=document.querySelector('.ct-sp-feature');if(f&&f.getBoundingClientRect().top<0)f.scrollIntoView({behavior:'smooth',block:'start'});});});
  })();
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
  var f=document.getElementById('newsletter');
  if(f){f.addEventListener('submit',function(e){e.preventDefault();var n=f.parentNode.querySelector('.form-note');
    if(!n){n=document.createElement('p');n.className='form-note';f.parentNode.insertBefore(n,f.nextSibling)}
    n.textContent='Thanks. Newsletter sign-up goes live when the site is deployed.';});}
})();
