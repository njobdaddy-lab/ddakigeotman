let photoSourceImage=null;
let photoSourceName='';
let photoOriginalFile=null;
let photoMarks=[]; // 모든 점과 굵기는 원본 이미지 좌표/픽셀 기준
let photoCurrentStroke=null;
let photoBrush=14; // 화면에서 보이는 CSS px 기준
let photoMode='brush'; // brush | rect
let photoDrawing=false;
let photoEditorSnapshot=[];
let photoGuideConfirmed=false;
let photoEditorBound=false;
let photoPointers=new Map();
let photoPinch=null;
let photoView={scale:1,minScale:1,offsetX:0,offsetY:0,stageW:1,stageH:1,dpr:1};

function clonePhotoMarks(marks){return marks.map(s=>s.type==='rect'?{type:'rect',x1:s.x1,y1:s.y1,x2:s.x2,y2:s.y2,width:s.width}:{type:'brush',width:s.width,points:(s.points||[]).map(p=>({x:p.x,y:p.y}))})}
function setPhotoMode(mode,btn){
  photoMode=mode==='rect'?'rect':'brush';
  document.querySelectorAll('[data-photo-mode]').forEach(b=>b.classList.remove('active'));
  if(btn)btn.classList.add('active');
  const brushes=document.getElementById('photoBrushTools');
  if(brushes)brushes.classList.toggle('hidden',photoMode!=='brush');
  const tip=document.getElementById('photoEditorTip');
  if(tip)tip.textContent=photoMode==='rect'?'한 손가락으로 네모 영역 지정 · 두 손가락으로 확대/이동':'한 손가락으로 자유표시 · 두 손가락으로 확대/이동';
}
function setPhotoBrush(size,btn){
  photoBrush=size;
  document.querySelectorAll('[data-photo-brush]').forEach(b=>b.classList.remove('active'));
  if(btn)btn.classList.add('active');
}

function loadPhotoFile(event){
  const file=event.target.files&&event.target.files[0];
  if(!file)return;
  if(!file.type.startsWith('image/')){alert('이미지 파일을 선택해주세요.');return}
  photoOriginalFile=file;
  photoSourceName=file.name||'원본이미지';
  document.getElementById('photoFileName').textContent=photoSourceName;
  const reader=new FileReader();
  reader.onload=()=>{
    const img=new Image();
    img.onload=()=>{
      photoSourceImage=img;
      photoMarks=[];photoCurrentStroke=null;photoGuideConfirmed=false;
      document.getElementById('photoEmpty').style.display='none';
      document.getElementById('photoSummary').classList.add('show');
      document.getElementById('photoResolutionText').textContent=`원본 ${img.naturalWidth} × ${img.naturalHeight}px · 해상도 유지`;
      document.getElementById('photoGuideBadge').textContent='원본 준비 완료';
      document.getElementById('photoEditGuideBtn').textContent='수정 위치 표시하기';
      document.getElementById('photoDownloadGuideBtn').style.display='none';
      renderPhotoSummary(false);
    };
    img.onerror=()=>alert('이미지를 불러오지 못했습니다.');
    img.src=reader.result;
  };
  reader.readAsDataURL(file);
}

function fitPhotoView(){
  if(!photoSourceImage)return;
  const stage=document.getElementById('photoEditorStage');
  const rect=stage.getBoundingClientRect();
  const w=Math.max(1,rect.width),h=Math.max(1,rect.height);
  const iw=photoSourceImage.naturalWidth,ih=photoSourceImage.naturalHeight;
  const fit=Math.min(w/iw,h/ih);
  photoView.stageW=w;photoView.stageH=h;photoView.minScale=fit;photoView.scale=fit;
  photoView.offsetX=(w-iw*fit)/2;photoView.offsetY=(h-ih*fit)/2;
  resizePhotoEditorCanvas();
  renderPhotoEditor();
}

function resizePhotoEditorCanvas(){
  const canvas=document.getElementById('photoEditorCanvas');
  const stage=document.getElementById('photoEditorStage');
  if(!canvas||!stage)return;
  const rect=stage.getBoundingClientRect();
  const dpr=Math.min(window.devicePixelRatio||1,2);
  photoView.stageW=Math.max(1,rect.width);photoView.stageH=Math.max(1,rect.height);photoView.dpr=dpr;
  canvas.width=Math.max(1,Math.round(photoView.stageW*dpr));
  canvas.height=Math.max(1,Math.round(photoView.stageH*dpr));
}

function clampPhotoView(){
  if(!photoSourceImage)return;
  const iw=photoSourceImage.naturalWidth*photoView.scale,ih=photoSourceImage.naturalHeight*photoView.scale;
  const w=photoView.stageW,h=photoView.stageH;
  if(iw<=w)photoView.offsetX=(w-iw)/2;
  else photoView.offsetX=Math.min(0,Math.max(w-iw,photoView.offsetX));
  if(ih<=h)photoView.offsetY=(h-ih)/2;
  else photoView.offsetY=Math.min(0,Math.max(h-ih,photoView.offsetY));
}

function canvasPointToOriginal(clientX,clientY){
  const canvas=document.getElementById('photoEditorCanvas');
  const r=canvas.getBoundingClientRect();
  const x=clientX-r.left,y=clientY-r.top;
  return {x:(x-photoView.offsetX)/photoView.scale,y:(y-photoView.offsetY)/photoView.scale,screenX:x,screenY:y};
}
function pointInsideOriginal(p){return photoSourceImage&&p.x>=0&&p.y>=0&&p.x<=photoSourceImage.naturalWidth&&p.y<=photoSourceImage.naturalHeight}

function drawPhotoStrokeDisplay(ctx,stroke,isPrimary){
  const cv=p=>({x:photoView.offsetX+p.x*photoView.scale,y:photoView.offsetY+p.y*photoView.scale});
  ctx.save();ctx.lineCap='round';ctx.lineJoin='round';
  let anchor=null;
  if(stroke.type==='rect'){
    const a=cv({x:stroke.x1,y:stroke.y1}),b=cv({x:stroke.x2,y:stroke.y2});
    const x=Math.min(a.x,b.x),y=Math.min(a.y,b.y),w=Math.abs(b.x-a.x),h=Math.abs(b.y-a.y);
    ctx.fillStyle='rgba(255,55,55,.18)';ctx.strokeStyle='rgba(255,55,55,.78)';ctx.lineWidth=Math.max(2,stroke.width*photoView.scale);
    ctx.fillRect(x,y,w,h);ctx.strokeRect(x,y,w,h);anchor={x,y};
  }else{
    const pts=stroke.points||[];if(!pts.length){ctx.restore();return}
    ctx.lineWidth=Math.max(1,stroke.width*photoView.scale);
    ctx.strokeStyle='rgba(255,55,55,.42)';ctx.fillStyle='rgba(255,55,55,.42)';
    if(pts.length===1){const p=cv(pts[0]);ctx.beginPath();ctx.arc(p.x,p.y,ctx.lineWidth/2,0,Math.PI*2);ctx.fill()}
    else{const p0=cv(pts[0]);ctx.beginPath();ctx.moveTo(p0.x,p0.y);for(let i=1;i<pts.length;i++){const p=cv(pts[i]);ctx.lineTo(p.x,p.y)}ctx.stroke()}
    anchor=cv(pts[0]);
  }
  if(isPrimary&&anchor){
    const radius=15;ctx.fillStyle='rgba(220,32,32,.98)';ctx.beginPath();ctx.arc(anchor.x,anchor.y,radius,0,Math.PI*2);ctx.fill();
    ctx.fillStyle='#fff';ctx.font='900 16px sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText('1',anchor.x,anchor.y+1);
  }
  ctx.restore();
}

function renderPhotoEditor(){
  const canvas=document.getElementById('photoEditorCanvas');if(!canvas||!photoSourceImage)return;
  const ctx=canvas.getContext('2d');const dpr=photoView.dpr||1;
  ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,photoView.stageW,photoView.stageH);
  ctx.fillStyle='#0a0f18';ctx.fillRect(0,0,photoView.stageW,photoView.stageH);
  ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';
  ctx.drawImage(photoSourceImage,photoView.offsetX,photoView.offsetY,photoSourceImage.naturalWidth*photoView.scale,photoSourceImage.naturalHeight*photoView.scale);
  photoMarks.forEach((s,i)=>drawPhotoStrokeDisplay(ctx,s,i===0));
  if(photoCurrentStroke)drawPhotoStrokeDisplay(ctx,photoCurrentStroke,photoMarks.length===0);
  updatePhotoEditorStatus();
}

function updatePhotoEditorStatus(){
  const count=photoMarks.length+(photoCurrentStroke?1:0);
  const el=document.getElementById('photoEditorStatus');if(el)el.innerHTML=`<b>${count?'위치 표시됨':'표시 0개'}</b> · 저장 시 원본 ${photoSourceImage?photoSourceImage.naturalWidth+'×'+photoSourceImage.naturalHeight+'px':''}`;
  const confirm=document.getElementById('photoEditorConfirm');if(confirm)confirm.disabled=!photoMarks.length;
  const z=document.getElementById('photoZoomChip');if(z&&photoView.minScale)z.textContent=Math.round(photoView.scale/photoView.minScale*100)+'%';
}

function beginPhotoPinch(){
  if(photoPointers.size<2)return;
  const pts=[...photoPointers.values()].slice(0,2);const a=pts[0],b=pts[1];
  const dist=Math.hypot(b.x-a.x,b.y-a.y)||1;const mid={x:(a.x+b.x)/2,y:(a.y+b.y)/2};
  photoPinch={dist,startScale:photoView.scale,anchorX:(mid.x-photoView.offsetX)/photoView.scale,anchorY:(mid.y-photoView.offsetY)/photoView.scale};
  if(photoCurrentStroke){photoCurrentStroke=null;photoDrawing=false;renderPhotoEditor()}
}

function bindPhotoEditor(){
  if(photoEditorBound)return;photoEditorBound=true;
  const canvas=document.getElementById('photoEditorCanvas');
  const local=e=>{const r=canvas.getBoundingClientRect();return {x:e.clientX-r.left,y:e.clientY-r.top}};
  canvas.addEventListener('pointerdown',e=>{
    if(!photoSourceImage)return;e.preventDefault();canvas.setPointerCapture?.(e.pointerId);
    photoPointers.set(e.pointerId,local(e));
    if(photoPointers.size>=2){beginPhotoPinch();return}
    const p=canvasPointToOriginal(e.clientX,e.clientY);if(!pointInsideOriginal(p))return;
    if(photoMode==='rect')photoCurrentStroke={type:'rect',x1:p.x,y1:p.y,x2:p.x,y2:p.y,width:Math.max(2,3/photoView.scale)};
    else photoCurrentStroke={type:'brush',points:[{x:p.x,y:p.y}],width:photoBrush/photoView.scale};
    photoDrawing=true;renderPhotoEditor();
  });
  canvas.addEventListener('pointermove',e=>{
    if(!photoPointers.has(e.pointerId))return;e.preventDefault();photoPointers.set(e.pointerId,local(e));
    if(photoPointers.size>=2){
      if(!photoPinch)beginPhotoPinch();
      const pts=[...photoPointers.values()].slice(0,2),a=pts[0],b=pts[1];
      const dist=Math.hypot(b.x-a.x,b.y-a.y)||1,mid={x:(a.x+b.x)/2,y:(a.y+b.y)/2};
      const maxScale=photoView.minScale*6;photoView.scale=Math.min(maxScale,Math.max(photoView.minScale,photoPinch.startScale*(dist/photoPinch.dist)));
      photoView.offsetX=mid.x-photoPinch.anchorX*photoView.scale;photoView.offsetY=mid.y-photoPinch.anchorY*photoView.scale;clampPhotoView();renderPhotoEditor();return;
    }
    if(!photoDrawing||!photoCurrentStroke)return;
    const p=canvasPointToOriginal(e.clientX,e.clientY);if(!pointInsideOriginal(p))return;
    if(photoCurrentStroke.type==='rect'){photoCurrentStroke.x2=p.x;photoCurrentStroke.y2=p.y}
    else photoCurrentStroke.points.push({x:p.x,y:p.y});
    renderPhotoEditor();
  });
  const finish=e=>{
    if(!photoPointers.has(e.pointerId))return;e.preventDefault?.();photoPointers.delete(e.pointerId);
    if(photoPinch){if(photoPointers.size<2)photoPinch=null;return}
    if(photoDrawing&&photoCurrentStroke){photoMarks.push(photoCurrentStroke);photoCurrentStroke=null;photoDrawing=false;renderPhotoEditor()}
  };
  canvas.addEventListener('pointerup',finish);canvas.addEventListener('pointercancel',finish);
  window.addEventListener('resize',()=>{if(document.getElementById('photoFullEditor')?.classList.contains('show'))fitPhotoView()});
}

function openPhotoEditor(){
  if(!photoSourceImage){alert('먼저 원본 이미지를 선택해주세요.');return}
  photoEditorSnapshot=clonePhotoMarks(photoMarks);photoCurrentStroke=null;photoDrawing=false;photoPointers.clear();photoPinch=null;
  const editor=document.getElementById('photoFullEditor');editor.classList.add('show');editor.setAttribute('aria-hidden','false');document.body.classList.add('photo-editor-open');
  bindPhotoEditor();requestAnimationFrame(()=>requestAnimationFrame(fitPhotoView));
}
function closePhotoEditorVisual(){const editor=document.getElementById('photoFullEditor');editor.classList.remove('show');editor.setAttribute('aria-hidden','true');document.body.classList.remove('photo-editor-open');photoPointers.clear();photoPinch=null}
function cancelPhotoEditor(){photoMarks=clonePhotoMarks(photoEditorSnapshot);photoCurrentStroke=null;photoDrawing=false;closePhotoEditorVisual();renderPhotoSummary(photoGuideConfirmed)}
function confirmPhotoEditor(){
  if(!photoMarks.length){alert('수정할 위치를 표시해주세요.');return}
  photoGuideConfirmed=true;closePhotoEditorVisual();renderPhotoSummary(true);
  document.getElementById('photoGuideBadge').textContent='위치 표시 완료';document.getElementById('photoEditGuideBtn').textContent='다시 수정하기';document.getElementById('photoDownloadGuideBtn').style.display='inline-flex';
}
function undoPhotoMark(){if(photoCurrentStroke){photoCurrentStroke=null;photoDrawing=false}else photoMarks.pop();renderPhotoEditor()}
function clearPhotoMarks(){photoMarks=[];photoCurrentStroke=null;photoDrawing=false;renderPhotoEditor()}

function drawMarksAtOriginalResolution(ctx){
  photoMarks.forEach((mark,i)=>{
    ctx.save();let anchor=null;
    if(mark.type==='rect'){
      const x=Math.min(mark.x1,mark.x2),y=Math.min(mark.y1,mark.y2),w=Math.abs(mark.x2-mark.x1),h=Math.abs(mark.y2-mark.y1);
      ctx.fillStyle='rgba(255,38,38,.18)';ctx.strokeStyle='rgba(255,38,38,.82)';ctx.lineWidth=Math.max(2,mark.width||2);ctx.fillRect(x,y,w,h);ctx.strokeRect(x,y,w,h);anchor={x,y};
    }else{
      const pts=mark.points||[];if(!pts.length){ctx.restore();return}ctx.lineCap='round';ctx.lineJoin='round';ctx.lineWidth=mark.width;ctx.strokeStyle='rgba(255,38,38,.40)';ctx.fillStyle='rgba(255,38,38,.40)';
      if(pts.length===1){ctx.beginPath();ctx.arc(pts[0].x,pts[0].y,mark.width/2,0,Math.PI*2);ctx.fill()}else{ctx.beginPath();ctx.moveTo(pts[0].x,pts[0].y);for(let j=1;j<pts.length;j++)ctx.lineTo(pts[j].x,pts[j].y);ctx.stroke()}
      anchor=pts[0];
    }
    if(i===0&&anchor){const radius=Math.max(18,Math.min(56,16/(photoView.minScale||1)));ctx.fillStyle='rgba(220,32,32,.98)';ctx.beginPath();ctx.arc(anchor.x,anchor.y,radius,0,Math.PI*2);ctx.fill();ctx.fillStyle='#fff';ctx.font=`900 ${Math.max(18,radius*1.05)}px sans-serif`;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText('1',anchor.x,anchor.y+1)}ctx.restore();
  });
}

function createOriginalGuideCanvas(){
  if(!photoSourceImage)return null;const c=document.createElement('canvas');c.width=photoSourceImage.naturalWidth;c.height=photoSourceImage.naturalHeight;const ctx=c.getContext('2d');ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';ctx.drawImage(photoSourceImage,0,0,c.width,c.height);drawMarksAtOriginalResolution(ctx);return c;
}
function renderPhotoSummary(withMarks=photoGuideConfirmed){
  const canvas=document.getElementById('photoPreviewCanvas');if(!canvas||!photoSourceImage)return;const maxW=900,maxH=700;const scale=Math.min(1,maxW/photoSourceImage.naturalWidth,maxH/photoSourceImage.naturalHeight);canvas.width=Math.max(1,Math.round(photoSourceImage.naturalWidth*scale));canvas.height=Math.max(1,Math.round(photoSourceImage.naturalHeight*scale));const ctx=canvas.getContext('2d');ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';ctx.drawImage(photoSourceImage,0,0,canvas.width,canvas.height);
  if(withMarks&&photoMarks.length){ctx.save();ctx.scale(scale,scale);drawMarksAtOriginalResolution(ctx);ctx.restore()}
}
function downloadPhotoGuide(){
  if(!photoSourceImage){alert('먼저 원본 이미지를 선택해주세요.');return}if(!photoMarks.length||!photoGuideConfirmed){alert('먼저 전체화면에서 수정할 위치를 표시하고 확인해주세요.');return}
  const c=createOriginalGuideCanvas();if(!c)return;c.toBlob(blob=>{if(!blob){alert('가이드 이미지를 만들지 못했습니다.');return}const a=document.createElement('a');const url=URL.createObjectURL(blob);a.href=url;a.download='내말대로-수정위치-가이드.png';document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),800)},'image/png');
}

function makePhotoPrompt(){
  if(!photoSourceImage){alert('먼저 원본 이미지를 선택해주세요.');return}
  if(!photoMarks.length||!photoGuideConfirmed){alert('먼저 수정 위치를 표시하고 확인해주세요.');return}
  const core=document.getElementById('photoEditCore').value.trim();if(!core){alert('실제로 무엇을 바꿀지 적어주세요.');return}
  const keep=vals('photoKeep');const ai=val('photoAiChoices')||'GPT';
  let out=`이미지 편집 작업입니다.\n\n【첨부 이미지의 역할】\n1. 표시 없는 이미지 = 원본 이미지입니다. 실제 수정의 기준이며 가장 우선해서 사용하세요.\n2. 빨간 반투명 표시와 번호 1이 있는 이미지 = 수정 위치 안내 이미지입니다. 빨간 표시·번호·선 자체는 최종 결과에 포함하면 안 됩니다.\n\n【실제 수정 요청】\n${core}\n\n【부분수정 핵심 규칙】\n- 빨간 표시와 번호는 "어디를 볼지" 알려주는 위치 힌트일 뿐, 그 영역 안의 모든 요소를 수정하라는 뜻이 아닙니다.\n- 사용자가 위에서 말한 핵심 대상만 수정하세요.\n- 표시 영역 안에 우연히 포함된 글자, 숫자, 날짜, 얼굴, 제품, 배경, 장식, 로고, QR 등이 수정 요청 대상이 아니라면 원본 그대로 유지하세요.\n- 원본 이미지를 전체적으로 다시 그리거나 재구성하지 말고, 필요한 최소 범위만 편집하세요.\n- 요청하지 않은 구도, 크롭, 비율, 배치, 색감, 조명, 질감, 글자 위치, 제품 외형은 최대한 유지하세요.\n- 특정 실존 제품이나 모델이 보인다면 다른 세대·유사 모델처럼 임의로 재설계하지 마세요.\n- 재시도할 경우 이전 AI 수정본을 기준으로 이어서 수정하지 말고, 항상 첫 번째 첨부 원본에서 다시 시작하세요.\n- 최종 결과는 편집 완료 이미지 1장만 출력하세요.`;
  if(keep.length)out+=`\n\n【특히 반드시 유지】\n- ${keep.join('\n- ')}`;
  if(ai==='Gemini')out+=`\n\n【Gemini 추가 지시】\n- 두 첨부 이미지를 서로 다른 시안 2개로 해석하지 마세요. 첫 번째는 원본, 두 번째는 위치 안내용 가이드입니다.\n- 가이드 이미지의 빨간 표시를 디자인 요소로 재현하지 마세요.`;
  else if(ai==='Google Flow')out+=`\n\n【Google Flow 추가 지시】\n- 한 프레임의 편집 결과로 작업하고, 요청하지 않은 장면 확장이나 전체 재디자인은 하지 마세요.`;
  else if(ai==='Claude Code')out=`이미지 편집 작업을 수행하세요. 필요하면 연결된 이미지 편집/생성 도구를 사용하세요.\n\n${out}\n\n【작업 후 검증】\n- 원본과 비교해 요청하지 않은 부분이 바뀌지 않았는지 확인하세요.\n- 가이드의 빨간 표시나 번호가 결과에 남지 않았는지 확인하세요.`;
  document.getElementById('photoOutput').value=out;document.getElementById('photoResult').classList.add('show');document.getElementById('photoOpenAiBtn').textContent=ai+' 열기';document.getElementById('photoResult').scrollIntoView({behavior:'smooth',block:'start'});
}
function openPhotoAI(){if(!document.getElementById('photoOutput').value)makePhotoPrompt();const out=document.getElementById('photoOutput').value;if(!out)return;copyText('photoOutput');const ai=val('photoAiChoices')||'GPT';setTimeout(()=>window.open(AI_URLS[ai]||AI_URLS.GPT,'_blank'),100)}
