document.write('<script src="./assets/js/app-core.js?v=tabs3"><\/script>');

(function setupThreeFreeToolTabs(){
  try{ MODULE_NAMES.add('style'); }catch(e){}

  const createModule = document.getElementById('module-create');
  const photoModule = document.getElementById('module-photo');
  if(!createModule || !photoModule) return;

  let styleModule = document.getElementById('module-style');
  if(!styleModule){
    styleModule = document.createElement('section');
    styleModule.id = 'module-style';
    styleModule.className = 'module';
    styleModule.innerHTML = `
  <div class="module-head">
    <button class="back" onclick="goBack()">← 뒤로</button>
    <div>
      <div class="module-title">화풍 바꾸기</div>
      <div class="module-sub">원하는 스타일을 골라 예시 요청문으로 빠르게 시작해보세요.</div>
    </div>
  </div>
  <div class="card style-gallery-card"></div>
  <div class="card style-prompt-card">
    <h2>선택한 요청문</h2>
    <div class="desc">예시 카드를 누르면 요청문이 아래에 채워져요. 복사해서 바로 써도 되고, 원하면 이미지 제작 탭으로 이어갈 수도 있어요.</div>
    <textarea id="stylePromptOutput" class="wide textarea" readonly placeholder="예시 카드를 눌러 요청문을 채워보세요."></textarea>
    <div class="result-actions">
      <button class="secondary" type="button" onclick="copyText('stylePromptOutput')">요청 복사</button>
      <button class="primary" type="button" onclick="useStylePromptInCreate()">이미지 제작에서 이어쓰기</button>
    </div>
  </div>`;
    photoModule.insertAdjacentElement('afterend', styleModule);
    styleModule = document.getElementById('module-style');
  }

  const gallery = createModule.querySelector('.preset-gallery-field');
  const styleCard = styleModule.querySelector('.style-gallery-card');
  if(gallery && styleCard && !styleCard.contains(gallery)){
    styleCard.appendChild(gallery);
    const label = gallery.querySelector('.label');
    if(label) label.textContent = '원하는 변환을 골라보세요.';
    const hint = gallery.querySelector('.hint');
    if(hint) hint.textContent = '화풍·재미 변환은 여기서 따로 고르고, 필요하면 이미지 제작이나 부분수정으로 이어갈 수 있어요.';
  }

  function syncPresetFilterButtons(value){
    document.querySelectorAll('[data-preset-filter]').forEach(btn=>{
      btn.classList.toggle('active', btn.dataset.presetFilter === value);
    });
  }

  function setStylePrompt(card){
    const box = document.getElementById('stylePromptOutput');
    if(!box) return;
    box.value = card?.prompt || '';
    box.scrollIntoView({behavior:'smooth', block:'center'});
    if(typeof showPresetToast === 'function'){
      showPresetToast('요청문이 채워졌어요. 복사하거나 이미지 제작에서 이어쓸 수 있어요.');
    }
  }

  window.useStylePromptInCreate = function(){
    const source = document.getElementById('stylePromptOutput');
    if(!source || !source.value.trim()){
      if(typeof showPresetToast === 'function') showPresetToast('먼저 예시를 하나 골라주세요.');
      return;
    }
    switchFreeTool('create');
    setTimeout(()=>{
      const target = document.getElementById('createCore');
      if(!target) return;
      target.value = source.value;
      target.focus();
      target.setSelectionRange(target.value.length, target.value.length);
      if(typeof showPresetToast === 'function') showPresetToast('선택한 요청문을 이미지 제작으로 가져왔어요.');
    }, 60);
  };

  document.querySelectorAll('.free-tool-switcher').forEach(el=>el.remove());
  const tabDefs = [['create','이미지 제작'],['photo','부분수정'],['style','화풍 바꾸기']];
  [['module-create','create'],['module-photo','photo'],['module-style','style']].forEach(([id,active])=>{
    const module = document.getElementById(id);
    const head = module?.querySelector('.module-head');
    if(!module || !head) return;
    const nav = document.createElement('div');
    nav.className = 'free-tool-switcher free-tool-switcher-3';
    nav.setAttribute('aria-label','무료 이미지 도구 전환');
    nav.style.setProperty('display','grid','important');
    nav.style.gridTemplateColumns = 'repeat(3,minmax(0,1fr))';

    tabDefs.forEach(([name,label])=>{
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.textContent = label;
      btn.classList.toggle('active', name === active);
      btn.addEventListener('click', ()=>{
        switchFreeTool(name);
        if(name === 'style'){
          setTimeout(()=>{
            syncPresetFilterButtons(presetFilter || 'all');
            if(typeof renderPresetCards === 'function') renderPresetCards();
          }, 30);
        }
      });
      nav.appendChild(btn);
    });
    head.insertAdjacentElement('afterend', nav);
  });

  const originalApplyPresetCard = window.applyPresetCard;
  window.applyPresetCard = function(id){
    const card = PRESET_PROMPT_CARDS.find(x=>x.id===id);
    if(!card) return;

    if(currentScreen === 'home'){
      if(card.category === 'practical'){
        openModule('photo');
        setTimeout(()=>{
          const box = document.getElementById('photoEditCore');
          if(box){
            box.value = card.prompt;
            box.focus();
            box.setSelectionRange(box.value.length, box.value.length);
          }
          if(typeof showPresetToast === 'function') showPresetToast('예시가 입력됐어요. 원본을 올리고 바꿀 위치를 표시하면 더 정확해져요.');
        },60);
      }else{
        openModule('style');
        presetFilter = card.category === 'style' ? 'style' : 'fun';
        presetExpanded = false;
        setTimeout(()=>{
          syncPresetFilterButtons(presetFilter);
          if(typeof renderPresetCards === 'function') renderPresetCards();
          setStylePrompt(card);
        },60);
      }
      return;
    }

    if(currentScreen === 'module-style'){
      setStylePrompt(card);
      return;
    }

    if(typeof originalApplyPresetCard === 'function'){
      originalApplyPresetCard(id);
    }
  };

  window.openPresetGalleryHome = function(){
    presetFilter = 'all';
    presetExpanded = false;
    openModule('style');
    setTimeout(()=>{
      syncPresetFilterButtons('all');
      if(typeof renderPresetCards === 'function') renderPresetCards();
    },60);
  };
})();
