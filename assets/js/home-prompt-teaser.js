function openPresetGalleryHome(){
  if(typeof currentScreen!=='undefined' && currentScreen==='home' && typeof openModule==='function')openModule('style');
  else if(typeof switchFreeTool==='function')switchFreeTool('style');
  else if(typeof openModule==='function')openModule('style');
  setTimeout(()=>{
    if(typeof presetFilter!=='undefined')presetFilter='all';
    if(typeof presetExpanded!=='undefined')presetExpanded=false;
    document.querySelectorAll('[data-preset-filter]').forEach(btn=>btn.classList.toggle('active',btn.dataset.presetFilter==='all'));
    if(typeof renderPresetCards==='function')renderPresetCards();
    document.querySelector('#module-style .preset-gallery-field')?.scrollIntoView({behavior:'smooth',block:'start'});
  },120);
}

(function applyFunPromptImages(){
  const alt={
    watercolor:'AI 생성 인물 수채화풍 변환 예시',
    webtoon:'AI 생성 인물 웹툰풍 변환 예시',
    clay:'AI 생성 인물 클레이풍 변환 예시',
    figure:'AI 생성 인물 피규어 박스 변환 예시',
    movie:'AI 생성 인물 영화 포스터 변환 예시',
    edit:'AI 생성 인물 안경 부분수정 전후 예시'
  };
  Object.entries(alt).forEach(([kind,label])=>{
    const preview=document.querySelector(`.fun-prompt-card[data-kind="${kind}"] .fun-prompt-preview`);
    if(!preview)return;
    const img=preview.querySelector('img');
    if(img){img.removeAttribute('src');img.alt='';img.setAttribute('aria-hidden','true');}
    preview.setAttribute('role','img');
    preview.setAttribute('aria-label',label);
  });
})();
