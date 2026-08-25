function openPresetGalleryHome(){
  if(typeof switchFreeTool==='function')switchFreeTool('create');
  else if(typeof openModule==='function')openModule('create');
  setTimeout(()=>document.querySelector('.preset-gallery-field')?.scrollIntoView({behavior:'smooth',block:'start'}),120);
}

(function applyFunPromptImages(){
  const images={
    watercolor:'./assets/examples/fun-watercolor.webp?v=fun1',
    webtoon:'./assets/examples/fun-webtoon.webp?v=fun1',
    clay:'./assets/examples/fun-clay.webp?v=fun1',
    figure:'./assets/examples/fun-figure.webp?v=fun1',
    movie:'./assets/examples/fun-movie.webp?v=fun1',
    edit:'./assets/examples/fun-edit.webp?v=fun1'
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
    const img=document.querySelector(`.fun-prompt-card[data-kind="${kind}"] .fun-prompt-preview img`);
    if(!img)return;
    img.src=src;
    img.alt=alt[kind];
  });
})();
