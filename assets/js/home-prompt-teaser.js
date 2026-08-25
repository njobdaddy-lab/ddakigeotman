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
  const images={
    watercolor:'./assets/examples/fun-watercolor.webp?v=restore1',
    webtoon:'./assets/examples/fun-webtoon.webp?v=restore1',
    clay:'./assets/examples/fun-clay.webp?v=restore1',
    figure:'./assets/examples/fun-figure.webp?v=restore1',
    movie:'./assets/examples/fun-movie.webp?v=restore1',
    edit:'./assets/examples/fun-edit.webp?v=restore1'
  };
  const alt={
    watercolor:'AI 생성 인물 수채화풍 변환 예시',
    webtoon:'AI 생성 인물 웹툰풍 변환 예시',
    clay:'AI 생성 인물 클레이풍 변환 예시',
    figure:'AI 생성 인물 피규어 박스 변환 예시',
    movie:'AI 생성 인물 영화 포스터 변환 예시',
    edit:'AI 생성 인물 안경 부분수정 전후 예시'
  };
  Object.entries(images).forEach(([kind,src])=>{
    const preview=document.querySelector(`.fun-prompt-card[data-kind="${kind}"] .fun-prompt-preview`);
    if(!preview)return;
    preview.removeAttribute('role');
    preview.removeAttribute('aria-label');
    let img=preview.querySelector('img');
    if(!img){
      img=document.createElement('img');
      preview.prepend(img);
    }
    img.src=src;
    img.alt=alt[kind];
    img.removeAttribute('aria-hidden');
  });
})();
