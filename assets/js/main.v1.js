
(function(){
  'use strict';
  var $=function(id){return document.getElementById(id)};

  /* меню */
  var drawer=$('drawer'), burger=$('burger'), closeBtn=$('drawerClose'), lastFocus=null;
  function openD(){ if(!drawer||!burger) return; lastFocus=document.activeElement;
    drawer.classList.add('is-open'); drawer.setAttribute('aria-hidden','false');
    burger.setAttribute('aria-expanded','true'); document.body.style.overflow='hidden';
    var f=drawer.querySelector('a,button'); if(f) f.focus(); }
  function closeD(){ if(!drawer||!burger) return; drawer.classList.remove('is-open');
    drawer.setAttribute('aria-hidden','true'); burger.setAttribute('aria-expanded','false');
    document.body.style.overflow=''; if(lastFocus&&lastFocus.focus) lastFocus.focus(); }
  if(burger) burger.addEventListener('click',function(){ drawer.classList.contains('is-open')?closeD():openD(); });
  if(closeBtn) closeBtn.addEventListener('click',closeD);
  if(drawer) drawer.addEventListener('click',function(e){ if(e.target.tagName==='A') closeD(); });
  document.addEventListener('keydown',function(e){
    if(e.key==='Escape'&&drawer&&drawer.classList.contains('is-open')) closeD();
    if(e.key==='Tab'&&drawer&&drawer.classList.contains('is-open')){
      var f=drawer.querySelectorAll('a,button'), first=f[0], last=f[f.length-1];
      if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}
      else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}
    }
  });
  window.addEventListener('resize',function(){ if(window.innerWidth>1049&&drawer&&drawer.classList.contains('is-open')) closeD(); });

  /* ---------- каталог: фильтры ---------- */
  var items=[].slice.call(document.querySelectorAll('.item'));
  var cat='all', q='';
  function apply(){
    var shown=0;
    items.forEach(function(el){
      var okc = cat==='all' || el.getAttribute('data-cat')===cat;
      var okq = !q || (el.getAttribute('data-name')||'').toLowerCase().indexOf(q)>=0;
      var vis = okc&&okq;
      el.style.display = vis?'':'none';
      if(vis) shown++;
    });
    var empty=$('shopEmpty'); if(empty) empty.classList.toggle('on', shown===0);
    var cnt=$('shopCount'); if(cnt) cnt.textContent = shown;
  }
  if(items.length){
    document.querySelectorAll('.chip').forEach(function(b){
      b.addEventListener('click',function(){
        cat=this.getAttribute('data-cat');
        document.querySelectorAll('.chip').forEach(function(x){x.setAttribute('aria-pressed', x===b?'true':'false');});
        apply();
      });
    });
    var s=$('shopSearch');
    if(s) s.addEventListener('input',function(){ q=this.value.trim().toLowerCase(); apply(); });
    var rs=$('shopReset');
    if(rs) rs.addEventListener('click',function(){
      cat='all'; q='';
      if(s) s.value='';
      document.querySelectorAll('.chip').forEach(function(x){x.setAttribute('aria-pressed', x.getAttribute('data-cat')==='all'?'true':'false');});
      apply();
    });
    apply();
  }

  /* ---------- заявка-корзина ---------- */
  var picked={};
  function bar(){
    var list=Object.keys(picked), n=list.length, rb=$('reqbar');
    if(!rb) return;
    rb.classList.toggle('on', n>0);
    var rc=$('reqCount'); if(rc) rc.textContent = n ? (n+' поз. в заявке') : '';
    var rl=$('reqList'); if(rl) rl.textContent = n ? list.map(function(k){return picked[k];}).join(', ') : '';
    var rw=$('reqWa');
    if(rw){
      rw.href='https://wa.me/375298153962?text='+encodeURIComponent(
        'Заявка с сайта CARPLAST\nПозиции:\n— '+(n?list.map(function(k){return picked[k];}).join('\n— '):'нужен подбор')
        +'\n\nМодель авто: \nГород: \nЧто уточнить: наличие, цена, срок');
    }
    document.querySelectorAll('.add').forEach(function(b){
      var on = !!picked[b.getAttribute('data-id')];
      b.setAttribute('aria-pressed', on?'true':'false');
      b.textContent = on ? 'В заявке' : 'В заявку';
    });
  }
  document.querySelectorAll('.add').forEach(function(b){
    b.addEventListener('click',function(){
      var id=b.getAttribute('data-id');
      if(picked[id]) delete picked[id]; else picked[id]=b.getAttribute('data-name');
      bar();
    });
  });
  var rc2=$('reqClear');
  if(rc2) rc2.addEventListener('click',function(){ picked={}; bar(); });
  bar();

  /* ---------- покрытие: гелькоут или под покраску ---------- */
  var COVER={
    gel:{h:'Деталь с гелькоутом',l:['Поверхность уже закрыта защитным слоем',
      'Можно ставить сразу, без грунта','Цвет — базовый, обычно чёрный или серый',
      'Полировка возможна, но слой тонкий','Подходит, когда внешний вид «как есть» достаточно']},
    kraska:{h:'Деталь под покраску',l:['Поверхность подготовлена под шпатлёвку и грунт',
      'Нужна подгонка и шлифовка стыков','Красится в цвет кузова',
      'Возможен любой цвет и фактура','Подходит для полного обвеса и штатных деталей']}
  };
  var segout=$('segout');
  function paintCover(k){
    document.querySelectorAll('.seg button').forEach(function(b){
      b.setAttribute('aria-pressed', b.getAttribute('data-c')===k?'true':'false');
    });
    var d=COVER[k]; if(!d||!segout) return;
    segout.innerHTML='<h3>'+d.h+'</h3><ul>'+d.l.map(function(x){return '<li>'+x+'</li>';}).join('')+'</ul>';
  }
  if(segout){
    document.querySelectorAll('.seg button').forEach(function(b){
      b.addEventListener('click',function(){ paintCover(this.getAttribute('data-c')); });
    });
    paintCover('kraska');
  }

  /* ---------- форма ---------- */
  var form=$('lead-form');
  if(form){
    form.addEventListener('submit',function(e){
      e.preventDefault();
      var g=function(id){var el=$(id);return el?el.value.trim():''};
      var name=g('lname'), phone=g('lphone'), what=g('lwhat'), msg=g('lmsg'), ok=$('lead-ok');
      if(!name||!phone){ if(ok){ok.textContent='Укажите имя и телефон'; ok.classList.add('on');} return; }
      var text='Заявка с сайта CARPLAST\nИмя: '+name+'\nТелефон: '+phone+'\nДеталь: '+what+(msg?'\nДетали: '+msg:'');
      if(ok){ ok.textContent='Открываем WhatsApp с готовым сообщением…'; ok.classList.add('on'); }
      window.open('https://wa.me/375298153962?text='+encodeURIComponent(text),'_blank');
    });
  }
})();
