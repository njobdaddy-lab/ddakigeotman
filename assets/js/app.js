document.write('<script src="./assets/js/app-core.js?v=tabs4"><\/script>');

(function setupThreeFreeToolTabs(){
  const NMD_PRESETS={
    watercolor:{category:'style',shortPrompt:'사진 속 인물을 부드러운 수채화풍으로 바꿔주세요.\n따뜻하고 밝은 분위기로 표현해주세요.',fullPrompt:'사진 속 인물을 부드러운 수채화풍 초상화 느낌으로 바꿔주세요.\n인물의 얼굴 느낌과 머리 모양은 최대한 자연스럽게 유지하고, 전체 분위기는 따뜻하고 밝게 표현해주세요.\n배경은 은은한 붓터치 느낌으로 정리해주세요.\n너무 과한 만화풍보다는 사람 사진을 수채화로 그린 느낌으로 만들어주세요.',helper:'인물·배경·분위기만 바꿔서 바로 써도 좋아요.'},
    webtoon:{category:'style',shortPrompt:'사진 속 인물을 깔끔한 웹툰풍으로 바꿔주세요.\n또렷하고 세련된 만화 느낌으로 표현해주세요.',fullPrompt:'사진 속 인물을 깔끔한 웹툰풍 캐릭터 느낌으로 바꿔주세요.\n얼굴은 또렷하고 밝게 표현하고, 눈·코·입은 자연스럽게 정리된 만화 느낌으로 표현해주세요.\n인물의 표정과 헤어스타일은 유지해주세요.\n너무 유아틱한 그림체보다는 세련된 웹툰 썸네일 느낌으로 만들어주세요.',helper:'캐릭터 느낌을 원하면 가장 무난하게 시작하기 좋아요.'},
    clay:{category:'style',shortPrompt:'사진 속 인물을 클레이 인형처럼 귀엽게 바꿔주세요.\n동글동글하고 부드러운 느낌으로 표현해주세요.',fullPrompt:'사진 속 인물을 클레이 인형처럼 동글고 귀엽게 바꿔주세요.\n점토로 만든 캐릭터 같은 질감이 느껴지게 해주세요.\n인물의 헤어스타일과 표정은 유지하고, 얼굴은 너무 망가지지 않게 자연스럽게 단순화해주세요.\n전체 분위기는 따뜻하고 부드럽게 표현해주세요.',helper:'귀엽게 바꾸되 인물 특징이 너무 사라지지 않게 하는 요청이에요.'},
    'figure-box':{category:'style',shortPrompt:'사진 속 인물을 피규어 박스에 들어 있는 캐릭터처럼 바꿔주세요.\n장난감 패키지 같은 느낌으로 표현해주세요.',fullPrompt:'사진 속 인물을 컬렉터블 피규어 박스 안에 들어 있는 캐릭터처럼 바꿔주세요.\n인물은 작은 피규어처럼 보이게 하고, 투명한 전면창이 있는 패키지 박스 안에 들어 있는 느낌으로 표현해주세요.\n전체 색감은 깔끔하고 세련되게 해주세요.\n박스 안에는 인물과 어울리는 작은 소품도 함께 보이게 해주세요.\n장난감 패키지처럼 보이되, 인물이 중심이 되도록 만들어주세요.',helper:'소장하고 싶은 굿즈 느낌을 내고 싶을 때 좋아요.'},
    'movie-poster':{category:'style',shortPrompt:'사진 속 인물을 영화 포스터 같은 분위기로 바꿔주세요.\n감성적이고 시네마틱한 느낌으로 표현해주세요.',fullPrompt:'사진 속 인물을 영화 포스터 같은 분위기로 바꿔주세요.\n조명은 감성적이고 시네마틱하게 표현하고, 전체 분위기는 깊이감 있고 세련되게 만들어주세요.\n인물의 얼굴과 표정은 자연스럽게 유지해주세요.\n배경은 영화 한 장면 같은 느낌이 나도록 정리해주세요.\n텍스트보다 분위기 중심의 포스터 느낌으로 만들어주세요.',helper:'평범한 인물 사진의 분위기를 크게 바꿔보고 싶을 때 좋아요.'},
    'topping-change':{category:'edit',shortPrompt:'사진 속 인물은 그대로 두고 안경만 추가해주세요.\n다른 부분은 바꾸지 말아주세요.',fullPrompt:'사진 속 인물은 그대로 두고 안경만 추가해주세요.\n얼굴, 표정, 헤어스타일, 의상, 배경, 구도는 그대로 유지해주세요.\n전체 이미지를 새로 바꾸지 말고, 필요한 부분만 수정한 것처럼 자연스럽게 안경만 더해주세요.\n안경은 인물 얼굴에 자연스럽게 어울리게 표현해주세요.',helper:'부분수정은 전체를 다시 만드는 게 아니라 필요한 한 부분만 바꾸는 기능이에요.'}
  };
  window.NMD_PROMPT_PRESETS=NMD_PRESETS;

  try{MODULE_NAMES.add('style')}catch(e){}
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
  function getBaseCard(id){try{return PRESET_PROMPT_CARDS.find(x=>x.id===id)||null}catch(e){return null}}
  function getPreset(id){
    const override=NMD_PRESETS[id];
    const base=getBaseCard(id);
    if(!override&&!base)return null;
    return {id,category:override?.category||(base?.module==='photo'?'edit':'style'),shortPrompt:override?.shortPrompt||base?.prompt||'',fullPrompt:override?.fullPrompt||base?.prompt||'',helper:override?.helper||''};
  }
  function syncPresetFilterButtons(value){document.querySelectorAll('[data-preset-filter]').forEach(btn=>btn.classList.toggle('active',btn.dataset.presetFilter===value))}
  function syncPromptModeButtons(){document.querySelectorAll('#stylePromptMode [data-mode]').forEach(btn=>btn.classList.toggle('active',btn.dataset.mode===selectedStyleMode))}
  function fillStylePrompt(id,useFull=false,scroll=true){
    const preset=getPreset(id);if(!preset||preset.category==='edit')return;
    selectedStyleId=id;selectedStyleMode=useFull?'full':'short';
    const box=document.getElementById('stylePromptOutput');
    const helper=document.getElementById('stylePromptHelper');
    if(box)box.value=useFull?preset.fullPrompt:preset.shortPrompt;
    if(helper)helper.textContent=preset.helper||'원하는 부분만 바꿔서 사용해보세요.';
    syncPromptModeButtons();
    if(scroll&&box)box.scrollIntoView({behavior:'smooth',block:'center'});
  }
  function fillPhotoPrompt(id,useFull=false){
    const preset=getPreset(id);if(!preset)return;
    const box=document.getElementById('photoEditCore');if(!box)return;
    box.value=useFull?preset.fullPrompt:preset.shortPrompt;
    box.focus();box.setSelectionRange(box.value.length,box.value.length);
  }

  document.getElementById('stylePromptMode')?.addEventListener('click',e=>{
    const btn=e.target.closest('[data-mode]');if(!btn||!selectedStyleId)return;
    fillStylePrompt(selectedStyleId,btn.dataset.mode==='full',false);
  });

  window.useStylePromptInCreate=function(){
    const source=document.getElementById('stylePromptOutput');
    if(!source||!source.value.trim()){if(typeof showPresetToast==='function')showPresetToast('먼저 예시를 하나 골라주세요.');return}
    switchFreeTool('create');
    setTimeout(()=>{
      const target=document.getElementById('createCore');if(!target)return;
      target.value=source.value;target.focus();target.setSelectionRange(target.value.length,target.value.length);
      if(typeof showPresetToast==='function')showPresetToast('선택한 요청문을 이미지 제작으로 가져왔어요.');
    },60);
  };

  document.querySelectorAll('.free-tool-switcher').forEach(el=>el.remove());
  const tabDefs=[['create','이미지 제작'],['photo','부분수정'],['style','화풍 바꾸기']];
  [['module-create','create'],['module-photo','photo'],['module-style','style']].forEach(([id,active])=>{
    const module=document.getElementById(id);const head=module?.querySelector('.module-head');if(!module||!head)return;
    const nav=document.createElement('div');nav.className='free-tool-switcher free-tool-switcher-3';nav.setAttribute('aria-label','무료 이미지 도구 전환');nav.style.setProperty('display','grid','important');nav.style.gridTemplateColumns='repeat(3,minmax(0,1fr))';
    tabDefs.forEach(([name,label])=>{const btn=document.createElement('button');btn.type='button';btn.textContent=label;btn.classList.toggle('active',name===active);btn.addEventListener('click',()=>{switchFreeTool(name);if(name==='style')setTimeout(()=>{syncPresetFilterButtons(presetFilter||'all');if(typeof renderPresetCards==='function')renderPresetCards()},30)});nav.appendChild(btn)});
    head.insertAdjacentElement('afterend',nav);
  });

  const originalApplyPresetCard=window.applyPresetCard;
  window.applyFunPromptCard=function(id,useFull=false){
    const preset=getPreset(id);if(!preset)return;
    if(preset.category==='edit'){
      if(currentScreen==='home')openModule('photo');else switchFreeTool('photo');
      setTimeout(()=>{fillPhotoPrompt(id,useFull);if(typeof showPresetToast==='function')showPresetToast('부분수정 예시가 채워졌어요. 원본을 올리고 바꿀 위치를 표시해보세요.')},60);
      return;
    }
    if(currentScreen==='home')openModule('style');else switchFreeTool('style');
    setTimeout(()=>{
      const base=getBaseCard(id);presetFilter=base?.category==='style'?'style':'fun';presetExpanded=false;syncPresetFilterButtons(presetFilter);if(typeof renderPresetCards==='function')renderPresetCards();fillStylePrompt(id,useFull,true);
      if(typeof showPresetToast==='function')showPresetToast(useFull?'더 정확한 요청으로 채웠어요.':'짧은 요청으로 채웠어요. 필요한 부분만 바꿔보세요.');
    },60);
  };
  window.applyPresetCard=function(id){if(NMD_PRESETS[id])return window.applyFunPromptCard(id,false);if(typeof originalApplyPresetCard==='function')return originalApplyPresetCard(id)};
  window.setStylePromptDetail=function(useFull){if(selectedStyleId)fillStylePrompt(selectedStyleId,!!useFull,false)};
  window.openPresetGalleryHome=function(){presetFilter='all';presetExpanded=false;if(currentScreen==='home')openModule('style');else switchFreeTool('style');setTimeout(()=>{syncPresetFilterButtons('all');if(typeof renderPresetCards==='function')renderPresetCards();document.querySelector('#module-style .preset-gallery-field')?.scrollIntoView({behavior:'smooth',block:'start'})},60)};
})();
