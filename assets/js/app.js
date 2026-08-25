document.write('<script src="./assets/js/app-core.js?v=tabs4"><\/script>');

(function setupThreeFreeToolTabs(){
  try{ MODULE_NAMES.add('style'); }catch(e){}

  const createModule=document.getElementById('module-create');
  const photoModule=document.getElementById('module-photo');
  if(!createModule||!photoModule)return;

  let styleModule=document.getElementById('module-style');
  if(!styleModule){
    styleModule=document.createElement('section');
    styleModule.id='module-style';
    styleModule.className='module';
    styleModule.innerHTML=`<div class="module-head"><button class="back" onclick="goBack()">← 뒤로</button><div><div class="module-title">화풍 바꾸기</div><div class="module-sub">원하는 스타일을 골라 예시 요청문으로 빠르게 시작해보세요.</div></div></div><div class="card style-gallery-card"></div>`;
    photoModule.insertAdjacentElement('afterend',styleModule);
  }

  const gallery=createModule.querySelector('.preset-gallery-field');
  const styleCard=styleModule.querySelector('.style-gallery-card');
  if(gallery&&styleCard&&!styleCard.contains(gallery)){
    styleCard.appendChild(gallery);
    const label=gallery.querySelector('.label');
    if(label)label.textContent='원하는 변환을 골라보세요.';
    const hint=gallery.querySelector('.hint');
    if(hint)hint.textContent='화풍·재미 변환은 이미지 제작으로, 실전 수정은 부분수정으로 이어져요.';
  }

  window.nmdSwitchImageTool=function(name,addHistory){
    const screen='module-'+name;
    const target=document.getElementById(screen);
    if(!target)return;
    try{ MODULE_NAMES.add(name); }catch(e){}
    if(currentScreen===screen){window.scrollTo(0,0);return;}
    if(addHistory){
      fallbackStack.push(screen);
      try{history.pushState({nmdScreen:screen},'',location.href.split('#')[0])}catch(e){}
    }else{
      if(fallbackStack.length)fallbackStack[fallbackStack.length-1]=screen;else fallbackStack=[screen];
      try{history.replaceState({nmdScreen:screen},'',location.href.split('#')[0])}catch(e){}
    }
    renderScreen(screen);
  };

  document.querySelectorAll('.free-tool-switcher').forEach(el=>el.remove());
  const tabDefs=[['create','이미지 제작'],['photo','부분수정'],['style','화풍 바꾸기']];
  [['module-create','create'],['module-photo','photo'],['module-style','style']].forEach(([id,active])=>{
    const module=document.getElementById(id);
    const head=module?.querySelector('.module-head');
    if(!module||!head)return;
    const nav=document.createElement('div');
    nav.className='free-tool-switcher free-tool-switcher-3';
    nav.setAttribute('aria-label','무료 이미지 도구 전환');
    nav.style.setProperty('display','grid','important');
    nav.style.gridTemplateColumns='repeat(3,minmax(0,1fr))';
    tabDefs.forEach(([name,label])=>{
      const btn=document.createElement('button');
      btn.type='button';
      btn.textContent=label;
      btn.classList.toggle('active',name===active);
      btn.setAttribute('onclick',`nmdSwitchImageTool('${name}',false)`);
      nav.appendChild(btn);
    });
    head.insertAdjacentElement('afterend',nav);
  });

  function fillPresetTarget(card){
    const target=card.category==='practical'?'photo':'create';
    window.nmdSwitchImageTool(target,false);
    setTimeout(()=>{
      const box=document.getElementById(target==='create'?'createCore':'photoEditCore');
      if(!box)return;
      box.value=card.prompt;
      box.focus();
      box.setSelectionRange(box.value.length,box.value.length);
      showPresetToast(target==='create'?'예시가 입력됐어요. 그대로 쓰거나 조금만 고쳐보세요.':'예시가 입력됐어요. 원본을 올리고 바꿀 위치를 표시하면 더 정확해져요.');
    },60);
  }

  const originalApplyPresetCard=applyPresetCard;
  applyPresetCard=function(id){
    const card=PRESET_PROMPT_CARDS.find(x=>x.id===id);
    if(!card)return;
    if(currentScreen==='home'){
      if(card.category==='practical'){
        try{MODULE_NAMES.add('photo')}catch(e){}
        openModule('photo');
        setTimeout(()=>{
          const box=document.getElementById('photoEditCore');
          if(box){box.value=card.prompt;box.focus();box.setSelectionRange(box.value.length,box.value.length)}
          showPresetToast('예시가 입력됐어요. 원본을 올리고 바꿀 위치를 표시하면 더 정확해져요.');
        },60);
      }else{
        window.nmdSwitchImageTool('style',true);
        presetFilter=card.category==='style'?'style':'fun';
        presetExpanded=false;
        setTimeout(()=>{
          document.querySelectorAll('[data-preset-filter]').forEach(btn=>btn.classList.toggle('active',btn.dataset.presetFilter===presetFilter));
          renderPresetCards();
        },60);
      }
      return;
    }
    if(currentScreen==='module-style'){
      fillPresetTarget(card);
      return;
    }
    originalApplyPresetCard(id);
  };

  window.openPresetGalleryHome=function(){
    presetFilter='all';
    presetExpanded=false;
    window.nmdSwitchImageTool('style',true);
    setTimeout(()=>{
      document.querySelectorAll('[data-preset-filter]').forEach(btn=>btn.classList.toggle('active',btn.dataset.presetFilter==='all'));
      renderPresetCards();
    },60);
  };
})();
