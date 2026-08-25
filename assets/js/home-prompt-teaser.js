function openPresetGalleryHome(){
  if(typeof switchFreeTool==='function')switchFreeTool('create');
  else if(typeof openModule==='function')openModule('create');
  setTimeout(()=>document.querySelector('.preset-gallery-field')?.scrollIntoView({behavior:'smooth',block:'start'}),120);
}
