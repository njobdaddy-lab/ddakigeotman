function ensurePhotoRegionUI(){
  const core=document.getElementById('photoEditCore');
  if(core){
    const card=core.closest('.photo-card');
    const h2=card&&card.querySelector('h2');
    const p=card&&card.querySelector('p');
    if(h2)h2.textContent='2. 표시한 곳에서 무엇을 바꿀까요?';
    if(p)p.textContent='각 번호에 원하는 수정만 적어주세요. 같은 번호 안에 여러 번 표시해도 하나의 수정 대상으로 묶고, 표시 안에 함께 들어온 다른 요소는 요청하지 않았다면 유지합니다.';
    const wrap=document.createElement('div');wrap.id='photoRegionInputs';wrap.className='photo-region-inputs';core.replaceWith(wrap);
  }
  const bottom=document.querySelector('#photoFullEditor .photo-editor-bottom');
  if(bottom&&!document.getElementById('photoRegionTabs')){
    const bar=document.createElement('div');bar.className='photo-editor-region-bar';
    bar.innerHTML='<span class="photo-region-label">수정 영역</span><div class="photo-region-tabs" id="photoRegionTabs"></div><div class="photo-region-actions"><button id="photoRegionDeleteBtn" onclick="deletePhotoRegion()" style="display:none">현재 영역 삭제</button></div>';
    bottom.insertBefore(bar,bottom.firstChild);
    const editor=document.getElementById('photoFullEditor');if(editor&&!document.getElementById('photoAutoToast')){const toast=document.createElement('div');toast.id='photoAutoToast';toast.className='photo-auto-toast';editor.appendChild(toast)}
  }
  if(!document.getElementById('photoRegionStyles')){
    const style=document.createElement('style');style.id='photoRegionStyles';style.textContent=`.photo-region-inputs{display:grid;gap:11px;margin-top:14px}.photo-region-input-card{border:1px solid #e5ded3;background:#fcfbf8;border-radius:15px;padding:12px}.photo-region-input-head{display:flex;align-items:center;gap:8px;margin-bottom:8px}.photo-region-number{width:28px;height:28px;border-radius:50%;display:grid;place-items:center;background:var(--deep);color:#fff;font-size:11px;font-weight:950;flex:none}.photo-region-input-head strong{font-size:12px}.photo-region-input-head small{margin-left:auto;color:#9299a3;font-size:9px}.photo-region-input-card textarea{width:100%;min-height:92px;border:1px solid #ded7cb;border-radius:12px;padding:11px 12px;background:#fff;resize:vertical;outline:none;line-height:1.55;font-size:11px;color:var(--deep)}.photo-region-input-card textarea:focus{border-color:#9aa8bd;box-shadow:0 0 0 3px #eff3fa}.photo-editor-region-bar{display:grid;grid-template-columns:auto minmax(0,1fr) auto;align-items:center;gap:7px}.photo-region-label{font-size:9px;font-weight:900;color:#aeb7c5;white-space:nowrap}.photo-region-tabs{display:flex;gap:5px;overflow-x:auto;scrollbar-width:none;min-width:0}.photo-region-tabs::-webkit-scrollbar{display:none}.photo-region-tabs button{width:32px;height:32px;flex:0 0 32px;border-radius:50%;border:1px solid rgba(255,255,255,.2);background:#172133;color:#fff;font-size:10px;font-weight:950;cursor:pointer}.photo-region-tabs button.active{background:#f0bf53;color:#071b3b;border-color:#f0bf53}.photo-region-actions{display:flex;gap:5px}.photo-region-actions button{border:1px solid rgba(255,255,255,.18);background:#172133;color:#fff;border-radius:9px;padding:8px 9px;font-size:8.5px;font-weight:900;white-space:nowrap;cursor:pointer}.photo-region-actions #photoRegionDeleteBtn{color:#ffb0b0}.photo-auto-toast{position:absolute;left:50%;bottom:16px;transform:translate(-50%,12px);z-index:8;width:max-content;max-width:calc(100% - 32px);padding:9px 13px;border-radius:999px;background:rgba(7,27,59,.94);border:1px solid rgba(255,255,255,.18);box-shadow:0 8px 28px rgba(0,0,0,.28);color:#fff;font-size:10px;font-weight:850;line-height:1.35;text-align:center;opacity:0;pointer-events:none;transition:opacity .18s ease,transform .18s ease}.photo-auto-toast.show{opacity:1;transform:translate(-50%,0)}@media(max-width:430px){.photo-region-input-card textarea{min-height:84px}.photo-editor-region-bar{grid-template-columns:auto minmax(0,1fr) auto}.photo-region-actions button{padding:8px 7px;font-size:8px}}`;
    document.head.appendChild(style);
  }
}

let photoSourceImage=null;
let photoSourceName='';
let photoOriginalFile=null;
let photoMarks=[]; // 원본 이미지 좌표/픽셀 기준, region으로 수정 대상을 구분
let photoCurrentStroke=null;
let photoBrush=14; // 화면에서 보이는 CSS px 기준
let photoMode='brush'; // brush | rect
let photoDrawing=false;
let photoEditorSnapshot=null;
let photoGuideConfirmed=false;
let photoEditorBound=false;
let photoPointers=new Map();
let photoPinch=null;
let photoRegionCount=1;
let photoActiveRegion=1;
let photoRegionTexts={1:''};
let photoRegionEditOverride=null; // 번호 탭을 누르면 다음 표시 1회만 해당 번호에 추가
let photoAutoHintShown=false;
let photoAutoToastTimer=null;
let photoView={scale:1,minScale:1,offsetX:0,offsetY:0,stageW:1,stageH:1,dpr:1};

function clonePhotoMarks(marks){
  return marks.map(s=>s.type==='rect'
    ?{type:'rect',region:s.region||1,x1:s.x1,y1:s.y1,x2:s.x2,y2:s.y2,width:s.width}
    :{type:'brush',region:s.region||1,width:s.width,points:(s.points||[]).map(p=>({x:p.x,y:p.y}))});
}
function capturePhotoRegionTexts(){
  document.querySelectorAll('[data-photo-region-input]').forEach(el=>{photoRegionTexts[Number(el.dataset.photoRegionInput)||1]=el.value});
}
function renderPhotoRegionInputs(){
  const wrap=document.getElementById('photoRegionInputs');if(!wrap)return;
  capturePhotoRegionTexts();wrap.innerHTML='';
  for(let n=1;n<=photoRegionCount;n++){
    if(photoRegionTexts[n]==null)photoRegionTexts[n]='';
    const card=document.createElement('div');card.className='photo-region-input-card';
    const head=document.createElement('div');head.className='photo-region-input-head';
    const badge=document.createElement('span');badge.className='photo-region-number';badge.textContent=n;
    const strong=document.createElement('strong');strong.textContent=`${n}번 영역 수정내용`;
    const small=document.createElement('small');small.textContent='표시한 대상만 수정';
    const ta=document.createElement('textarea');ta.dataset.photoRegionInput=String(n);ta.placeholder=n===1?'예) 케이크 위 딸기 토핑만 블루베리로 바꿔줘':`예) ${n}번 영역에서 바꿀 내용을 적어주세요`;
    ta.value=photoRegionTexts[n]||'';ta.addEventListener('input',()=>{photoRegionTexts[n]=ta.value});
    head.append(badge,strong,small);card.append(head,ta);wrap.append(card);
  }
}
function renderPhotoRegionControls(){
  const tabs=document.getElementById('photoRegionTabs');
  if(tabs){
    tabs.innerHTML='';
    for(let n=1;n<=photoRegionCount;n++){
      const b=document.createElement('button');b.type='button';b.textContent=n;
      b.classList.toggle('active',n===photoActiveRegion);
      b.title=`${n}번 영역을 다음 표시 1회 수정`;
      b.onclick=()=>selectPhotoRegion(n);tabs.append(b);
    }
  }
  const del=document.getElementById('photoRegionDeleteBtn');
  if(del)del.style.display=(photoMarks.length||photoRegionCount>1)?'inline-flex':'none';
}
function regionHasMark(region,includeCurrent=false){
  return photoMarks.some(m=>(m.region||1)===region)||(includeCurrent&&photoCurrentStroke&&(photoCurrentStroke.region||1)===region);
}
function selectPhotoRegion(region){
  if(region<1||region>photoRegionCount)return;
  photoActiveRegion=region;photoRegionEditOverride=region;photoCurrentStroke=null;photoDrawing=false;
  renderPhotoRegionControls();renderPhotoEditor();
  showPhotoAutoToast(`${region}번 영역 선택 · 다음 표시 1회가 이 번호에 추가돼요.`);
}
function showPhotoAutoToast(message,ms=2200){
  const toast=document.getElementById('photoAutoToast');if(!toast)return;
  clearTimeout(photoAutoToastTimer);toast.textContent=message;toast.classList.add('show');
  photoAutoToastTimer=setTimeout(()=>toast.classList.remove('show'),ms);
}
function createNextPhotoRegion(){
  if(photoRegionCount>=5){showPhotoAutoToast('수정 영역은 최대 5개까지 만들 수 있어요.');return null}
  capturePhotoRegionTexts();photoRegionCount+=1;photoActiveRegion=photoRegionCount;
  if(photoRegionTexts[photoActiveRegion]==null)photoRegionTexts[photoActiveRegion]='';
  renderPhotoRegionControls();renderPhotoRegionInputs();
  return photoActiveRegion;
}
function distancePointToRegionScreen(p,region){
  let best=Infinity;
  for(const mark of photoMarks){
    if((mark.region||1)!==region)continue;
    let dx=0,dy=0;
    if(mark.type==='rect'){
      const minX=Math.min(mark.x1,mark.x2),maxX=Math.max(mark.x1,mark.x2),minY=Math.min(mark.y1,mark.y2),maxY=Math.max(mark.y1,mark.y2);
      dx=p.x<minX?minX-p.x:p.x>maxX?p.x-maxX:0;dy=p.y<minY?minY-p.y:p.y>maxY?p.y-maxY:0;
    }else{
      const pts=mark.points||[];if(!pts.length)continue;
      let minX=Infinity,maxX=-Infinity,minY=Infinity,maxY=-Infinity;
      for(const q of pts){if(q.x<minX)minX=q.x;if(q.x>maxX)maxX=q.x;if(q.y<minY)minY=q.y;if(q.y>maxY)maxY=q.y}
      const pad=(mark.width||0)/2;minX-=pad;maxX+=pad;minY-=pad;maxY+=pad;
      dx=p.x<minX?minX-p.x:p.x>maxX?p.x-maxX:0;dy=p.y<minY?minY-p.y:p.y>maxY?p.y-maxY:0;
    }
    best=Math.min(best,Math.hypot(dx,dy)*(photoView.scale||1));
  }
  return best;
}
function choosePhotoRegionForNewMark(p){
  if(photoRegionEditOverride!=null){
    const r=photoRegionEditOverride;photoRegionEditOverride=null;photoActiveRegion=r;renderPhotoRegionControls();return r;
  }
  if(!photoMarks.length){photoActiveRegion=1;return 1}
  if(photoMode==='rect'){
    return createNextPhotoRegion();
  }
  let bestRegion=1,best=Infinity;
  for(let n=1;n<=photoRegionCount;n++){
    const d=distancePointToRegionScreen(p,n);if(d<best){best=d;bestRegion=n}
  }
  const threshold=Math.min(76,Math.max(44,photoBrush*1.2));
  if(best<=threshold){photoActiveRegion=bestRegion;renderPhotoRegionControls();return bestRegion}
  return createNextPhotoRegion();
}
function trimTrailingEmptyPhotoRegions(){
  let changed=false;
  while(photoRegionCount>1&&!regionHasMark(photoRegionCount,true)&&!(photoRegionTexts[photoRegionCount]||'').trim()){
    delete photoRegionTexts[photoRegionCount];photoRegionCount-=1;changed=true;
  }
  if(photoActiveRegion>photoRegionCount)photoActiveRegion=photoRegionCount;
  if(photoRegionEditOverride!=null&&photoRegionEditOverride>photoRegionCount)photoRegionEditOverride=null;
  if(changed){renderPhotoRegionControls();renderPhotoRegionInputs()}
}
function deletePhotoRegion(){
  capturePhotoRegionTexts();const target=photoActiveRegion;
  if(photoRegionCount<=1){
    photoMarks=photoMarks.filter(m=>(m.region||1)!==1);photoRegionTexts={1:''};photoCurrentStroke=null;photoDrawing=false;photoRegionEditOverride=null;
    renderPhotoRegionControls();renderPhotoRegionInputs();renderPhotoEditor();return;
  }
  photoMarks=photoMarks.filter(m=>(m.region||1)!==target).map(m=>{const r=m.region||1;if(r>target)m.region=r-1;return m});
  const nextTexts={};for(let n=1;n<=photoRegionCount;n++){if(n===target)continue;nextTexts[n>target?n-1:n]=photoRegionTexts[n]||''}
  photoRegionTexts=nextTexts;photoRegionCount-=1;photoActiveRegion=Math.min(target,photoRegionCount);photoRegionEditOverride=null;photoCurrentStroke=null;photoDrawing=false;
  renderPhotoRegionControls();renderPhotoRegionInputs();renderPhotoEditor();
}
function setPhotoMode(mode,btn){
  photoMode=mode==='rect'?'rect':'brush';document.querySelectorAll('[data-photo-mode]').forEach(b=>b.classList.remove('active'));if(btn)btn.classList.add('active');
  const brushes=document.getElementById('photoBrushTools');if(brushes)brushes.classList.toggle('hidden',photoMode!=='brush');
  const tip=document.getElementById('photoEditorTip');if(tip)tip.textContent=photoMode==='rect'?`현재 ${photoActiveRegion}번 · 한 손가락으로 네모 영역 지정 · 두 손가락으로 확대/이동`:`현재 ${photoActiveRegion}번 · 한 손가락으로 자유표시 · 두 손가락으로 확대/이동`;
}
function setPhotoBrush(size,btn){photoBrush=size;document.querySelectorAll('[data-photo-brush]').forEach(b=>b.classList.remove('active'));if(btn)btn.classList.add('active')}

function loadPhotoFile(event){
  const file=event.target.files&&event.target.files[0];if(!file)return;if(!file.type.startsWith('image/')){alert('이미지 파일을 선택해주세요.');return}
  photoOriginalFile=file;photoSourceName=file.name||'원본이미지';document.getElementById('photoFileName').textContent=photoSourceName;
  const reader=new FileReader();reader.onload=()=>{const img=new Image();img.onload=()=>{
    photoSourceImage=img;photoMarks=[];photoCurrentStroke=null;photoGuideConfirmed=false;photoRegionCount=1;photoActiveRegion=1;photoRegionTexts={1:''};photoRegionEditOverride=null;photoAutoHintShown=false;
    document.getElementById('photoEmpty').style.display='none';document.getElementById('photoSummary').classList.add('show');
    document.getElementById('photoResolutionText').textContent=`원본 ${img.naturalWidth} × ${img.naturalHeight}px · 해상도 유지`;
    document.getElementById('photoGuideBadge').textContent='원본 준비 완료';document.getElementById('photoEditGuideBtn').textContent='수정 위치 표시하기';document.getElementById('photoDownloadGuideBtn').style.display='none';
    renderPhotoRegionInputs();renderPhotoRegionControls();renderPhotoSummary(false);
  };img.onerror=()=>alert('이미지를 불러오지 못했습니다.');img.src=reader.result};reader.readAsDataURL(file);
}

function fitPhotoView(){
  if(!photoSourceImage)return;const stage=document.getElementById('photoEditorStage');const rect=stage.getBoundingClientRect();const w=Math.max(1,rect.width),h=Math.max(1,rect.height);const iw=photoSourceImage.naturalWidth,ih=photoSourceImage.naturalHeight;const fit=Math.min(w/iw,h/ih);
  photoView.stageW=w;photoView.stageH=h;photoView.minScale=fit;photoView.scale=fit;photoView.offsetX=(w-iw*fit)/2;photoView.offsetY=(h-ih*fit)/2;resizePhotoEditorCanvas();renderPhotoEditor();
}
function resizePhotoEditorCanvas(){
  const canvas=document.getElementById('photoEditorCanvas'),stage=document.getElementById('photoEditorStage');if(!canvas||!stage)return;const rect=stage.getBoundingClientRect();const dpr=Math.min(window.devicePixelRatio||1,2);photoView.stageW=Math.max(1,rect.width);photoView.stageH=Math.max(1,rect.height);photoView.dpr=dpr;canvas.width=Math.max(1,Math.round(photoView.stageW*dpr));canvas.height=Math.max(1,Math.round(photoView.stageH*dpr));
}
function clampPhotoView(){
  if(!photoSourceImage)return;const iw=photoSourceImage.naturalWidth*photoView.scale,ih=photoSourceImage.naturalHeight*photoView.scale,w=photoView.stageW,h=photoView.stageH;
  if(iw<=w)photoView.offsetX=(w-iw)/2;else photoView.offsetX=Math.min(0,Math.max(w-iw,photoView.offsetX));if(ih<=h)photoView.offsetY=(h-ih)/2;else photoView.offsetY=Math.min(0,Math.max(h-ih,photoView.offsetY));
}
function canvasPointToOriginal(clientX,clientY){const canvas=document.getElementById('photoEditorCanvas'),r=canvas.getBoundingClientRect(),x=clientX-r.left,y=clientY-r.top;return {x:(x-photoView.offsetX)/photoView.scale,y:(y-photoView.offsetY)/photoView.scale,screenX:x,screenY:y}}
function pointInsideOriginal(p){return photoSourceImage&&p.x>=0&&p.y>=0&&p.x<=photoSourceImage.naturalWidth&&p.y<=photoSourceImage.naturalHeight}

function drawPhotoStrokeDisplay(ctx,stroke,showLabel,regionNumber){
  const cv=p=>({x:photoView.offsetX+p.x*photoView.scale,y:photoView.offsetY+p.y*photoView.scale});ctx.save();ctx.lineCap='round';ctx.lineJoin='round';let anchor=null;
  if(stroke.type==='rect'){
    const a=cv({x:stroke.x1,y:stroke.y1}),b=cv({x:stroke.x2,y:stroke.y2}),x=Math.min(a.x,b.x),y=Math.min(a.y,b.y),w=Math.abs(b.x-a.x),h=Math.abs(b.y-a.y);
    ctx.fillStyle='rgba(255,55,55,.18)';ctx.strokeStyle='rgba(255,55,55,.78)';ctx.lineWidth=Math.max(2,stroke.width*photoView.scale);ctx.fillRect(x,y,w,h);ctx.strokeRect(x,y,w,h);anchor={x,y};
  }else{
    const pts=stroke.points||[];if(!pts.length){ctx.restore();return}ctx.lineWidth=Math.max(1,stroke.width*photoView.scale);ctx.strokeStyle='rgba(255,55,55,.42)';ctx.fillStyle='rgba(255,55,55,.42)';
    if(pts.length===1){const p=cv(pts[0]);ctx.beginPath();ctx.arc(p.x,p.y,ctx.lineWidth/2,0,Math.PI*2);ctx.fill()}else{const p0=cv(pts[0]);ctx.beginPath();ctx.moveTo(p0.x,p0.y);for(let i=1;i<pts.length;i++){const p=cv(pts[i]);ctx.lineTo(p.x,p.y)}ctx.stroke()}anchor=cv(pts[0]);
  }
  if(showLabel&&anchor){const radius=15;ctx.fillStyle='rgba(220,32,32,.98)';ctx.beginPath();ctx.arc(anchor.x,anchor.y,radius,0,Math.PI*2);ctx.fill();ctx.fillStyle='#fff';ctx.font='900 16px sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(String(regionNumber),anchor.x,anchor.y+1)}ctx.restore();
}
function renderPhotoEditor(){
  const canvas=document.getElementById('photoEditorCanvas');if(!canvas||!photoSourceImage)return;const ctx=canvas.getContext('2d'),dpr=photoView.dpr||1;ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,photoView.stageW,photoView.stageH);ctx.fillStyle='#0a0f18';ctx.fillRect(0,0,photoView.stageW,photoView.stageH);ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';ctx.drawImage(photoSourceImage,photoView.offsetX,photoView.offsetY,photoSourceImage.naturalWidth*photoView.scale,photoSourceImage.naturalHeight*photoView.scale);
  const labeled=new Set();photoMarks.forEach(s=>{const r=s.region||1,show=!labeled.has(r);if(show)labeled.add(r);drawPhotoStrokeDisplay(ctx,s,show,r)});
  if(photoCurrentStroke){const r=photoCurrentStroke.region||photoActiveRegion;drawPhotoStrokeDisplay(ctx,photoCurrentStroke,!labeled.has(r),r)}updatePhotoEditorStatus();
}
function updatePhotoEditorStatus(){
  const missing=[];for(let n=1;n<=photoRegionCount;n++)if(!regionHasMark(n,true))missing.push(n);
  const el=document.getElementById('photoEditorStatus');
  if(el)el.innerHTML=`<b>현재 ${photoActiveRegion}번</b> · 총 ${photoRegionCount}개 · 번호 자동 생성 · 원본 ${photoSourceImage?photoSourceImage.naturalWidth+'×'+photoSourceImage.naturalHeight+'px':''}`;
  const confirm=document.getElementById('photoEditorConfirm');if(confirm)confirm.disabled=missing.length>0;
  const z=document.getElementById('photoZoomChip');if(z&&photoView.minScale)z.textContent=Math.round(photoView.scale/photoView.minScale*100)+'%';
  const tip=document.getElementById('photoEditorTip');
  if(tip){
    if(photoRegionEditOverride!=null)tip.textContent=`${photoRegionEditOverride}번 수정 선택됨 · 다음 표시 1회가 이 번호에 추가`;
    else tip.textContent=photoMode==='rect'?'네모를 그릴 때마다 1, 2, 3… 자동 번호 · 두 손가락 확대/이동':'같은 대상 근처는 같은 번호 · 다른 곳은 다음 번호 자동 · 두 손가락 확대/이동';
  }
}
function beginPhotoPinch(){
  if(photoPointers.size<2)return;const pts=[...photoPointers.values()].slice(0,2),a=pts[0],b=pts[1],dist=Math.hypot(b.x-a.x,b.y-a.y)||1,mid={x:(a.x+b.x)/2,y:(a.y+b.y)/2};photoPinch={dist,startScale:photoView.scale,anchorX:(mid.x-photoView.offsetX)/photoView.scale,anchorY:(mid.y-photoView.offsetY)/photoView.scale};if(photoCurrentStroke){photoCurrentStroke=null;photoDrawing=false;trimTrailingEmptyPhotoRegions();renderPhotoEditor()}
}
function bindPhotoEditor(){
  if(photoEditorBound)return;photoEditorBound=true;const canvas=document.getElementById('photoEditorCanvas');const local=e=>{const r=canvas.getBoundingClientRect();return {x:e.clientX-r.left,y:e.clientY-r.top}};
  canvas.addEventListener('pointerdown',e=>{
    if(!photoSourceImage)return;e.preventDefault();canvas.setPointerCapture?.(e.pointerId);photoPointers.set(e.pointerId,local(e));if(photoPointers.size>=2){beginPhotoPinch();return}
    const p=canvasPointToOriginal(e.clientX,e.clientY);if(!pointInsideOriginal(p))return;
    const region=choosePhotoRegionForNewMark(p);if(region==null)return;
    if(photoMode==='rect')photoCurrentStroke={type:'rect',region,x1:p.x,y1:p.y,x2:p.x,y2:p.y,width:Math.max(2,3/photoView.scale)};
    else photoCurrentStroke={type:'brush',region,points:[{x:p.x,y:p.y}],width:photoBrush/photoView.scale};photoDrawing=true;renderPhotoEditor();
  });
  canvas.addEventListener('pointermove',e=>{
    if(!photoPointers.has(e.pointerId))return;e.preventDefault();photoPointers.set(e.pointerId,local(e));if(photoPointers.size>=2){if(!photoPinch)beginPhotoPinch();const pts=[...photoPointers.values()].slice(0,2),a=pts[0],b=pts[1],dist=Math.hypot(b.x-a.x,b.y-a.y)||1,mid={x:(a.x+b.x)/2,y:(a.y+b.y)/2};const maxScale=photoView.minScale*6;photoView.scale=Math.min(maxScale,Math.max(photoView.minScale,photoPinch.startScale*(dist/photoPinch.dist)));photoView.offsetX=mid.x-photoPinch.anchorX*photoView.scale;photoView.offsetY=mid.y-photoPinch.anchorY*photoView.scale;clampPhotoView();renderPhotoEditor();return}
    if(!photoDrawing||!photoCurrentStroke)return;const p=canvasPointToOriginal(e.clientX,e.clientY);if(!pointInsideOriginal(p))return;if(photoCurrentStroke.type==='rect'){photoCurrentStroke.x2=p.x;photoCurrentStroke.y2=p.y}else photoCurrentStroke.points.push({x:p.x,y:p.y});renderPhotoEditor();
  });
  const finish=e=>{if(!photoPointers.has(e.pointerId))return;e.preventDefault?.();photoPointers.delete(e.pointerId);if(photoPinch){if(photoPointers.size<2)photoPinch=null;return}if(photoDrawing&&photoCurrentStroke){const completedRegion=photoCurrentStroke.region||1;photoMarks.push(photoCurrentStroke);photoCurrentStroke=null;photoDrawing=false;photoActiveRegion=completedRegion;renderPhotoRegionControls();renderPhotoRegionInputs();renderPhotoEditor();if(!photoAutoHintShown){photoAutoHintShown=true;showPhotoAutoToast('1번 영역이 만들어졌어요. 다른 곳을 표시하면 다음 번호가 자동으로 생겨요.',2500)}}};
  canvas.addEventListener('pointerup',finish);canvas.addEventListener('pointercancel',finish);window.addEventListener('resize',()=>{if(document.getElementById('photoFullEditor')?.classList.contains('show'))fitPhotoView()});
}
function openPhotoEditor(){
  if(!photoSourceImage){alert('먼저 원본 이미지를 선택해주세요.');return}capturePhotoRegionTexts();photoEditorSnapshot={marks:clonePhotoMarks(photoMarks),regionCount:photoRegionCount,activeRegion:photoActiveRegion,texts:{...photoRegionTexts},confirmed:photoGuideConfirmed};photoCurrentStroke=null;photoDrawing=false;photoPointers.clear();photoPinch=null;photoRegionEditOverride=null;
  const editor=document.getElementById('photoFullEditor');editor.classList.add('show');editor.setAttribute('aria-hidden','false');document.body.classList.add('photo-editor-open');renderPhotoRegionControls();bindPhotoEditor();requestAnimationFrame(()=>requestAnimationFrame(fitPhotoView));
}
function closePhotoEditorVisual(){const editor=document.getElementById('photoFullEditor');editor.classList.remove('show');editor.setAttribute('aria-hidden','true');document.body.classList.remove('photo-editor-open');photoPointers.clear();photoPinch=null}
function cancelPhotoEditor(){
  if(photoEditorSnapshot){photoMarks=clonePhotoMarks(photoEditorSnapshot.marks);photoRegionCount=photoEditorSnapshot.regionCount;photoActiveRegion=photoEditorSnapshot.activeRegion;photoRegionTexts={...photoEditorSnapshot.texts};photoGuideConfirmed=photoEditorSnapshot.confirmed}
  photoCurrentStroke=null;photoDrawing=false;photoRegionEditOverride=null;closePhotoEditorVisual();renderPhotoRegionInputs();renderPhotoSummary(photoGuideConfirmed);
}
function confirmPhotoEditor(){
  const missing=[];for(let n=1;n<=photoRegionCount;n++)if(!regionHasMark(n))missing.push(n);if(missing.length){alert(`${missing.join(', ')}번 영역의 위치를 표시해주세요.`);return}
  photoGuideConfirmed=true;closePhotoEditorVisual();renderPhotoRegionInputs();renderPhotoSummary(true);document.getElementById('photoGuideBadge').textContent=`위치 표시 완료 · ${photoRegionCount}개 영역`;document.getElementById('photoEditGuideBtn').textContent='다시 수정하기';document.getElementById('photoDownloadGuideBtn').style.display='inline-flex';
}
function undoPhotoMark(){
  if(photoCurrentStroke&&(photoCurrentStroke.region||1)===photoActiveRegion){photoCurrentStroke=null;photoDrawing=false}
  else{for(let i=photoMarks.length-1;i>=0;i--){if((photoMarks[i].region||1)===photoActiveRegion){photoMarks.splice(i,1);break}}}
  photoRegionEditOverride=null;trimTrailingEmptyPhotoRegions();renderPhotoRegionControls();renderPhotoRegionInputs();renderPhotoEditor();
}
function clearPhotoMarks(){
  photoMarks=[];photoCurrentStroke=null;photoDrawing=false;photoRegionCount=1;photoActiveRegion=1;photoRegionTexts={1:''};photoRegionEditOverride=null;
  renderPhotoRegionControls();renderPhotoRegionInputs();renderPhotoEditor();
}

function drawMarksAtOriginalResolution(ctx){
  const labeled=new Set();photoMarks.forEach(mark=>{const region=mark.region||1;ctx.save();let anchor=null;
    if(mark.type==='rect'){const x=Math.min(mark.x1,mark.x2),y=Math.min(mark.y1,mark.y2),w=Math.abs(mark.x2-mark.x1),h=Math.abs(mark.y2-mark.y1);ctx.fillStyle='rgba(255,38,38,.18)';ctx.strokeStyle='rgba(255,38,38,.82)';ctx.lineWidth=Math.max(2,mark.width||2);ctx.fillRect(x,y,w,h);ctx.strokeRect(x,y,w,h);anchor={x,y}}
    else{const pts=mark.points||[];if(!pts.length){ctx.restore();return}ctx.lineCap='round';ctx.lineJoin='round';ctx.lineWidth=mark.width;ctx.strokeStyle='rgba(255,38,38,.40)';ctx.fillStyle='rgba(255,38,38,.40)';if(pts.length===1){ctx.beginPath();ctx.arc(pts[0].x,pts[0].y,mark.width/2,0,Math.PI*2);ctx.fill()}else{ctx.beginPath();ctx.moveTo(pts[0].x,pts[0].y);for(let j=1;j<pts.length;j++)ctx.lineTo(pts[j].x,pts[j].y);ctx.stroke()}anchor=pts[0]}
    if(!labeled.has(region)&&anchor){labeled.add(region);const radius=Math.max(18,Math.min(56,16/(photoView.minScale||1)));ctx.fillStyle='rgba(220,32,32,.98)';ctx.beginPath();ctx.arc(anchor.x,anchor.y,radius,0,Math.PI*2);ctx.fill();ctx.fillStyle='#fff';ctx.font=`900 ${Math.max(18,radius*1.05)}px sans-serif`;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(String(region),anchor.x,anchor.y+1)}ctx.restore();
  });
}
function createOriginalGuideCanvas(){if(!photoSourceImage)return null;const c=document.createElement('canvas');c.width=photoSourceImage.naturalWidth;c.height=photoSourceImage.naturalHeight;const ctx=c.getContext('2d');ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';ctx.drawImage(photoSourceImage,0,0,c.width,c.height);drawMarksAtOriginalResolution(ctx);return c}
function renderPhotoSummary(withMarks=photoGuideConfirmed){
  const canvas=document.getElementById('photoPreviewCanvas');if(!canvas||!photoSourceImage)return;const maxW=900,maxH=700,scale=Math.min(1,maxW/photoSourceImage.naturalWidth,maxH/photoSourceImage.naturalHeight);canvas.width=Math.max(1,Math.round(photoSourceImage.naturalWidth*scale));canvas.height=Math.max(1,Math.round(photoSourceImage.naturalHeight*scale));const ctx=canvas.getContext('2d');ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';ctx.drawImage(photoSourceImage,0,0,canvas.width,canvas.height);if(withMarks&&photoMarks.length){ctx.save();ctx.scale(scale,scale);drawMarksAtOriginalResolution(ctx);ctx.restore()}
}
function downloadPhotoGuide(){
  if(!photoSourceImage){alert('먼저 원본 이미지를 선택해주세요.');return}if(!photoMarks.length||!photoGuideConfirmed){alert('먼저 전체화면에서 수정할 위치를 표시하고 확인해주세요.');return}const c=createOriginalGuideCanvas();if(!c)return;c.toBlob(blob=>{if(!blob){alert('가이드 이미지를 만들지 못했습니다.');return}const a=document.createElement('a'),url=URL.createObjectURL(blob);a.href=url;a.download='내말대로-수정위치-가이드.png';document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),800)},'image/png');
}
function getPhotoRegionRequests(){
  capturePhotoRegionTexts();const req=[];for(let n=1;n<=photoRegionCount;n++)req.push({region:n,text:(photoRegionTexts[n]||'').trim()});return req;
}
function makePhotoPrompt(){
  if(!photoSourceImage){alert('먼저 원본 이미지를 선택해주세요.');return}if(!photoMarks.length||!photoGuideConfirmed){alert('먼저 수정 위치를 표시하고 확인해주세요.');return}
  const missingMarks=[];for(let n=1;n<=photoRegionCount;n++)if(!regionHasMark(n))missingMarks.push(n);if(missingMarks.length){alert(`${missingMarks.join(', ')}번 영역의 위치를 다시 확인해주세요.`);return}
  const requests=getPhotoRegionRequests(),missingText=requests.filter(r=>!r.text).map(r=>r.region);if(missingText.length){alert(`${missingText.join(', ')}번 영역의 수정 내용을 적어주세요.`);return}
  const keep=vals('photoKeep'),ai=val('photoAiChoices')||'GPT';const regionLines=requests.map(r=>`- ${r.region}번 영역: ${r.text}`).join('\n');
  let out=`이미지 편집 작업입니다.\n\n【첨부 이미지의 역할】\n1. 표시 없는 이미지 = 원본 이미지입니다. 실제 수정의 기준이며 가장 우선해서 사용하세요.\n2. 빨간 반투명 표시와 번호가 있는 이미지 = 수정 위치 안내 이미지입니다. 빨간 표시·번호·선 자체는 최종 결과에 포함하면 안 됩니다.\n\n【수정 영역별 요청】\n${regionLines}\n\n【부분수정 핵심 규칙】\n- 각 번호는 "어디를 볼지" 알려주는 위치 힌트이며, 같은 번호에 여러 표시가 있어도 하나의 수정 대상으로 봅니다.\n- 각 번호에 적힌 수정 요청만 적용하세요. 해당 영역 안의 모든 요소를 전부 수정하라는 뜻이 아닙니다.\n- 표시 영역 안에 우연히 포함된 글자, 숫자, 날짜, 얼굴, 제품, 배경, 장식, 로고, QR 등이 해당 번호의 수정 요청 대상이 아니라면 원본 그대로 유지하세요.\n- 서로 다른 번호의 요청을 섞거나 다른 영역에 적용하지 마세요.\n- 원본 이미지를 전체적으로 다시 그리거나 재구성하지 말고, 필요한 최소 범위만 편집하세요.\n- 요청하지 않은 구도, 크롭, 비율, 배치, 색감, 조명, 질감, 글자 위치, 제품 외형은 최대한 유지하세요.\n- 특정 실존 제품이나 모델이 보인다면 다른 세대·유사 모델처럼 임의로 재설계하지 마세요.\n- 재시도할 경우 이전 AI 수정본을 기준으로 이어서 수정하지 말고, 항상 첫 번째 첨부 원본에서 다시 시작하세요.\n- 최종 결과는 편집 완료 이미지 1장만 출력하세요.`;
  if(keep.length)out+=`\n\n【특히 반드시 유지】\n- ${keep.join('\n- ')}`;
  if(ai==='Gemini')out+=`\n\n【Gemini 추가 지시】\n- 두 첨부 이미지를 서로 다른 시안 2개로 해석하지 마세요. 첫 번째는 원본, 두 번째는 위치 안내용 가이드입니다.\n- 가이드 이미지의 빨간 표시와 번호를 디자인 요소로 재현하지 마세요.\n- 번호별 수정 요청을 서로 바꾸거나 합치지 마세요.`;
  else if(ai==='Google Flow')out+=`\n\n【Google Flow 추가 지시】\n- 한 프레임의 편집 결과로 작업하고, 요청하지 않은 장면 확장이나 전체 재디자인은 하지 마세요.\n- 번호별 지정 영역과 요청을 각각 대응시켜 적용하세요.`;
  else if(ai==='Claude Code')out=`이미지 편집 작업을 수행하세요. 필요하면 연결된 이미지 편집/생성 도구를 사용하세요.\n\n${out}\n\n【작업 후 검증】\n- 번호별 수정 요청이 올바른 위치에 적용됐는지 확인하세요.\n- 원본과 비교해 요청하지 않은 부분이 바뀌지 않았는지 확인하세요.\n- 가이드의 빨간 표시나 번호가 결과에 남지 않았는지 확인하세요.`;
  document.getElementById('photoOutput').value=out;document.getElementById('photoResult').classList.add('show');document.getElementById('photoOpenAiBtn').textContent=ai+' 열기';document.getElementById('photoResult').scrollIntoView({behavior:'smooth',block:'start'});
}
function openPhotoAI(){if(!document.getElementById('photoOutput').value)makePhotoPrompt();const out=document.getElementById('photoOutput').value;if(!out)return;copyText('photoOutput');const ai=val('photoAiChoices')||'GPT';setTimeout(()=>window.open(AI_URLS[ai]||AI_URLS.GPT,'_blank'),100)}

ensurePhotoRegionUI();renderPhotoRegionInputs();renderPhotoRegionControls();
