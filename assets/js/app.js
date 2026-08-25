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
    styleModule.innerHTML=`
      <div class="module-head">
        <button class="back" onclick="goBack()">← 뒤로</button>
        <div>
          <div class="module-title">화풍 바꾸기</div>
          <div class="module-sub">마음에 드는 예시를 고르고, 짧게 시작하거나 더 정확한 요청으로 바꿔보세요.</div>
        </div>
      </div>
      <div class="card style-gallery-card"></div>
      <div class="card style-prompt-card">
        <h2>선택한 요청문</h2>
        <div class="desc">처음엔 짧게 시작해도 괜찮아요. 필요하면 아래에서 더 정확한 요청으로 바꿀 수 있어요.</div>
        <div class="style-prompt-mode" id="stylePromptMode">
          <button type="button" class="active" data-mode="short">간단히 쓰기</button>
          <button type="button" data-mode="full">더 정확하게 쓰기</button>
        </div>
        <textarea id="stylePromptOutput" class="wide textarea" readonly placeholder="예시 카드를 눌러 요청문을 채워보세요."></textarea>
        <p class="style-prompt-helper" id="stylePromptHelper">예시를 하나 골라보세요. 필요한 부분만 바꿔서 써도 됩니다.</p>
        <div class="result-actions">
          <button class="secondary" type="button" onclick="copyText('stylePromptOutput')">요청 복사</button>
          <button class="primary" type="button" onclick="useStylePromptInCreate()">이미지 제작에서 이어쓰기</button>
        </div>
      </div>`;
    photoModule.insertAdjacentElement('afterend',styleModule);
  }

  const gallery=createModule.querySelector('.preset-gallery-field');
  const styleCard=styleModule.querySelector('.style-gallery-card');
  if(gallery&&styleCard&&!styleCard.contains(gallery)){
    styleCard.appendChild(gallery);
    const label=gallery.querySelector('.label');
    if(label)label.textContent='원하는 변환을 골라보세요.';
    const hint=gallery.querySelector('.hint');
    if(hint)hint.textContent='막막하면 하나 눌러보세요. 바로 채워지고, 필요한 부분만 바꿔도 돼요.';
  }

  let selectedStyleId='';
  let selectedStyleMode='short';

  function getBaseCard(id){
    try{return PRESET_PROMPT_CARDS.find(x=>x.id===id)||null}catch(e){return null}
  }
  function getPreset(id){
    const override=window.getNmdPromptPreset?window.getNmdPromptPreset(id):null;
    const base=getBaseCard(id);
    if(!override&&!base)return null;
    return {
      id,
      category:override?.category||(base?.module==='photo'?'edit':'style'),
      shortPrompt:override?.shortPrompt||base?.prompt||'',
      fullPrompt:override?.fullPrompt||base?.prompt||'',
      helper:override?.helper||''
    };
  }
  function syncPresetFilterButtons(value){
    document.querySelectorAll('[data-preset-filter]').forEach(btn=>btn.classList.toggle('active',btn.dataset.presetFilter===value));
  }
  function syncPromptModeButtons(){
    document.querySelectorAll('#stylePromptMode [data-mode]').forEach(btn=>btn.classList.toggle('active',btn.dataset.mode===selectedStyleMode));
  }
  function fillStylePrompt(id,useFull=false,scroll=true){
    const preset=getPreset(id);
    if(!preset||preset.category==='edit')return;
    selectedStyleId=id;
    selectedStyleMode=useFull?'full':'short';
    const box=document.getElementById('stylePromptOutput');
    const helper=document.getElementById('stylePromptHelper');
    if(box)box.value=useFull?preset.fullPrompt:preset.shortPrompt;
    if(helper)helper.textContent=preset.helper||'원하는 부분만 바꿔서 사용해보세요.';
    syncPromptModeButtons();
    if(scroll&&box)box.scrollIntoView({behavior:'smooth',block:'center'});
  }
  function fillPhotoPrompt(id,useFull=false){
    const preset=getPreset(id);
    if(!preset)return;
    const box=document.getElementById('photoEditCore');
    if(!box)return;
    box.value=useFull?preset.fullPrompt:preset.shortPrompt;
    box.focus();
    box.setSelectionRange(box.value.length,box.value.length);
  }

  document.getElementById('stylePromptMode')?.addEventListener('click',e=>{
    const btn=e.target.closest('[data-mode]');
    if(!btn||!selectedStyleId)return;
    fillStylePrompt(selectedStyleId,btn.dataset.mode==='full',false);
  });

  window.useStylePromptInCreate=function(){
    const source=document.getElementById('stylePromptOutput');
    if(!source||!source.value.trim()){
      if(typeof showPresetToast==='function')showPresetToast('먼저 예시를 하나 골라주세요.');
      return;
    }
    switchFreeTool('create');
    setTimeout(()=>{
      const target=document.getElementById('createCore');
      if(!target)return;
      target.value=source.value;
      target.focus();
      target.setSelectionRange(target.value.length,target.value.length);
      if(typeof showPresetToast==='function')showPresetToast('선택한 요청문을 이미지 제작으로 가져왔어요.');
    },60);
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
      btn.addEventListener('click',()=>{
        switchFreeTool(name);
        if(name==='style')setTimeout(()=>{
          syncPresetFilterButtons(presetFilter||'all');
          if(typeof renderPresetCards==='function')renderPresetCards();
        },30);
      });
      nav.appendChild(btn);
    });
    head.insertAdjacentElement('afterend',nav);
  });

  const originalApplyPresetCard=window.applyPresetCard;
  window.applyFunPromptCard=function(id,useFull=false){
    const preset=getPreset(id);
    if(!preset)return;
    if(preset.category==='edit'){
      if(currentScreen==='home')openModule('photo');else switchFreeTool('photo');
      setTimeout(()=>{
        fillPhotoPrompt(id,useFull);
        if(typeof showPresetToast==='function')showPresetToast('부분수정 예시가 채워졌어요. 원본을 올리고 바꿀 위치를 표시해보세요.');
      },60);
      return;
    }
    if(currentScreen==='home')openModule('style');else switchFreeTool('style');
    setTimeout(()=>{
      const base=getBaseCard(id);
      presetFilter=base?.category==='style'?'style':'fun';
      presetExpanded=false;
      syncPresetFilterButtons(presetFilter);
      if(typeof renderPresetCards==='function')renderPresetCards();
      fillStylePrompt(id,useFull,true);
      if(typeof showPresetToast==='function')showPresetToast(useFull?'더 정확한 요청으로 채웠어요.':'짧은 요청으로 채웠어요. 필요한 부분만 바꿔보세요.');
    },60);
  };
  window.applyPresetCard=function(id){
    if(window.getNmdPromptPreset?.(id))return window.applyFunPromptCard(id,false);
    if(typeof originalApplyPresetCard==='function')return originalApplyPresetCard(id);
  };
  window.setStylePromptDetail=function(useFull){
    if(selectedStyleId)fillStylePrompt(selectedStyleId,!!useFull,false);
  };
  window.openPresetGalleryHome=function(){
    presetFilter='all';presetExpanded=false;
    if(currentScreen==='home')openModule('style');else switchFreeTool('style');
    setTimeout(()=>{
      syncPresetFilterButtons('all');
      if(typeof renderPresetCards==='function')renderPresetCards();
      document.querySelector('#module-style .preset-gallery-field')?.scrollIntoView({behavior:'smooth',block:'start'});
    },60);
  };
})();
