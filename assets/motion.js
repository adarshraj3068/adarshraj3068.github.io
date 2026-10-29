/* Motion layer for adarshraj.co.in. Progressive: if this file fails to load, every page still reads normally. */
(function(){
  var d=document, root=d.documentElement, w=window;
  var mm=function(q){return w.matchMedia?w.matchMedia(q).matches:false;};
  var reduce=mm('(prefers-reduced-motion: reduce)');
  var each=function(list,fn){Array.prototype.forEach.call(list,fn);};
  var nav=d.querySelector('nav');

  /* Reading progress in the nav rule */
  if(nav){
    var bar=d.createElement('div');bar.className='m-progress';bar.setAttribute('aria-hidden','true');nav.appendChild(bar);
    root.classList.add('m-prog');
  }

  var io;
  function show(el,delay){
    if(io)io.unobserve(el);
    el.style.setProperty('--d',delay+'s');
    el.classList.add('m-in','m-seen');
    setTimeout(function(){el.classList.remove('m-r','m-in','m-wipe','m-photo');el.style.removeProperty('--d');},(delay+1.15)*1000);
  }
  function revealAll(){each(d.querySelectorAll('.m-r:not(.m-in)'),function(el){show(el,0);});}
  w.addEventListener('beforeprint',revealAll);

  /* Back-to-top button */
  var top=d.createElement('button');
  top.type='button';top.className='m-top';top.setAttribute('aria-label','Back to top');
  top.innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="square" aria-hidden="true"><path d="M12 19V5M5 12l7-7 7 7"/></svg>';
  top.addEventListener('click',function(){w.scrollTo({top:0,behavior:reduce?'auto':'smooth'});});
  d.body.appendChild(top);

  var ticking=false;
  top.tabIndex=-1;top.setAttribute('aria-hidden','true');
  function onScroll(){
    if(ticking)return;ticking=true;
    w.requestAnimationFrame(function(){
      var y=w.scrollY||w.pageYOffset, max=root.scrollHeight-w.innerHeight;
      if(bar)bar.style.setProperty('--p',max>0?Math.min(1,y/max).toFixed(4):0);
      if(max>0&&y>=max-4)revealAll();
      var show=y>w.innerHeight*1.2;
      if(show!==top.classList.contains('m-show')){top.classList.toggle('m-show',show);top.tabIndex=show?0:-1;show?top.removeAttribute('aria-hidden'):top.setAttribute('aria-hidden','true');}
      ticking=false;
    });
  }
  w.addEventListener('scroll',onScroll,{passive:true});w.addEventListener('resize',onScroll);onScroll();

  /* Nav: mark the section being read, and keep that link in view on small screens */
  var links=d.querySelector('.links');
  if(links&&'IntersectionObserver' in w){
    var map={};
    each(links.querySelectorAll('a[href^="#"]'),function(a){var id=a.getAttribute('href').slice(1);if(id&&d.getElementById(id))map[id]=a;});
    var current=null;
    var spy=new IntersectionObserver(function(es){
      es.forEach(function(e){
        if(!e.isIntersecting)return;
        var a=map[e.target.id];if(!a||a===current)return;
        if(current)current.classList.remove('m-on');
        a.classList.add('m-on');current=a;
        if(links.scrollWidth>links.clientWidth){
          links.scrollTo({left:a.offsetLeft-links.clientWidth/2+a.offsetWidth/2,behavior:reduce?'auto':'smooth'});
        }
      });
    },{rootMargin:'-45% 0px -50% 0px'});
    Object.keys(map).forEach(function(id){spy.observe(d.getElementById(id));});
  }

  /* Section titles: mark when seen so the underline sweeps in */
  var heads=d.querySelectorAll('section .head h2');

  if(reduce||!('IntersectionObserver' in w)){
    each(heads,function(h){h.classList.add('m-seen');});
    each(d.querySelectorAll('.lchart'),function(c){c.classList.add('m-seen');});
    return;
  }
  root.classList.add('m-js');

  /* Scroll reveals */
  var sel=['section .head .eyebrow','section .head h2','section .head p','.impact','.card','.row','.medal','.mag','.photos-sub','.photos button','.gallery button','.photogrid figure','.sitephotos > h3','.sitephotos > p','.press','.origin','.contact','.callout','figure.exhibit','.chartfig','.calc','dl.facts','.tablewrap','ol.refs'];
  var vh=w.innerHeight;
  io=new IntersectionObserver(function(es){
    var n=0;
    es.forEach(function(e){
      if(!e.isIntersecting)return;
      show(e.target,Math.min(n++,6)*0.08);
    });
  },{rootMargin:'0px 0px -8% 0px',threshold:0});
  each(d.querySelectorAll(sel.join(',')),function(el){
    if(el.closest('.hero')||el.closest('.lb')||!el.getClientRects().length)return;
    var p=el.parentElement&&el.parentElement.closest('.m-r');if(p)return;
    var r=el.getBoundingClientRect();
    if(r.top<vh*0.92&&r.bottom>0){el.classList.add('m-seen');return;}
    el.classList.add('m-r');
    if(el.matches('section .head .eyebrow'))el.classList.add('m-wipe');
    if(el.matches('.photos button,.gallery button,.photogrid figure,.mag'))el.classList.add('m-photo');
    io.observe(el);
  });

  /* Chart bars grow when the chart comes into view */
  var chartIO=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('m-seen');chartIO.unobserve(e.target);}});},{threshold:0.3});
  each(d.querySelectorAll('.lchart'),function(c){each(c.querySelectorAll('.bar'),function(b,i){b.style.setProperty('--bi',i);});chartIO.observe(c);});

  /* Numbers count up when they come into view */
  var ease=function(t){return 1-Math.pow(1-t,3);};
  function countUp(el,wait){
    var txt=el.textContent, m=txt.match(/^(\D*?)(\d[\d,]*(?:\.\d+)?)(\D*)$/);
    if(!m)return;
    var raw=m[2], dec=(raw.split('.')[1]||'').length, comma=raw.indexOf(',')>-1, target=parseFloat(raw.replace(/,/g,''));
    if(!(target>0))return;
    var fmt=function(v){return comma?v.toLocaleString('en-IN',{minimumFractionDigits:dec,maximumFractionDigits:dec}):v.toFixed(dec);};
    var dur=target<10?900:1500;
    el.textContent=m[1]+fmt(0)+m[3];
    setTimeout(function(){
      var t0=null;
      function step(ts){if(!t0)t0=ts;var k=Math.min(1,(ts-t0)/dur);el.textContent=k<1?m[1]+fmt(target*ease(k))+m[3]:txt;if(k<1)w.requestAnimationFrame(step);}
      w.requestAnimationFrame(step);
    },wait||0);
  }
  var numIO=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){numIO.unobserve(e.target);countUp(e.target,e.target.closest('.stats')?800:150);}});},{threshold:0.6});
  each(d.querySelectorAll('.stat b, dl.facts dd, .card .big'),function(el){if(!el.children.length&&/^\D*?\d[\d,]*(?:\.\d+)?\D*$/.test(el.textContent))numIO.observe(el);});

  /* Pointer tilt for the portrait and magazine covers (mouse only) */
  if(mm('(hover: hover) and (pointer: fine)')){
    var tilt=function(el,max,host){
      if(!el)return;el.classList.add('m-tilt');host=host||el;
      host.addEventListener('pointermove',function(e){var r=el.getBoundingClientRect();var x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;el.style.setProperty('--ry',(x*max).toFixed(2)+'deg');el.style.setProperty('--rx',(-y*max).toFixed(2)+'deg');});
      host.addEventListener('pointerleave',function(){el.style.setProperty('--rx','0deg');el.style.setProperty('--ry','0deg');});
    };
    tilt(d.querySelector('.portrait picture'),8);
    each(d.querySelectorAll('.mag'),function(b){tilt(b.querySelector('.cv'),10,b);});
  }
})();
