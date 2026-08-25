const AI_URLS={GPT:'https://chatgpt.com/',Gemini:'https://gemini.google.com/','Google Flow':'https://labs.google/fx/tools/flow/','Claude Code':'https://claude.ai/code'};
const EXAMPLES={
 edit:{title:'바꿀 건 이것만.',desc:'선택한 부분만 수정하고 나머지는 그대로.',html:'<img src="./assets/examples/example-edit.webp?v=nmd9" alt="부분 수정 대표 예시">',dot:0},
 accuracy:{title:'비슷하게 말고, 정확하게.',desc:'제품 외형이 중요하면 공식 자료 기준으로 확인.',html:'<div class="accuracy-placeholder"><div><b>정확성 예시는 실제 제품 이미지로 교체 예정</b><p>현재 임의로 그린 휴대폰 그림은 제거했습니다.<br>실존 제품은 공식 외형을 확인한 뒤 비교 사례로 넣습니다.</p><span>공식 자료 기준 · 유사 모델 대체 금지</span></div></div>',dot:1},
 restore:{title:'기억은 그대로.',desc:'새로 그리지 않고 손상과 선명도만 복원.',html:'<img src="./assets/examples/example-restore.webp?v=nmd9" alt="사진 복원 대표 예시">',dot:2},
 video:{title:'사진에서 움직이는 순간까지.',desc:'복원한 사진을 자연스러운 짧은 영상으로.',html:'<img src="./assets/examples/example-video.webp?v=nmd9" alt="영상화 대표 예시">',dot:3}
};
function showExample(key,btn){const e=EXAMPLES[key];if(!e)return;document.getElementById('exampleMedia').innerHTML=e.html;document.getElementById('exampleTitle').textContent=e.title;document.getElementById('exampleDesc').textContent=e.desc;document.querySelectorAll('#exampleTabs button').forEach(x=>x.classList.remove('active'));if(btn)btn.classList.add('active');document.querySelectorAll('#exampleDots span').forEach((x,i)=>x.classList.toggle('on',i===e.dot))}
function setupSingleChoice(id,change){const wrap=document.getElementById(id);if(!wrap)return;wrap.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;wrap.querySelectorAll('button').forEach(x=>x.classList.remove('active'));b.classList.add('active');if(change)change(b.dataset.v,b)})}
function setupMulti(id){const wrap=document.getElementById(id);if(!wrap)return;wrap.addEventListener('click',e=>{const b=e.target.closest('button');if(b)b.classList.toggle('active')})}
function val(id){const e=document.querySelector('#'+id+' button.active');return e?e.dataset.v:''}
function vals(id){return [...document.querySelectorAll('#'+id+' button.active')].map(e=>e.dataset.v)}
function normalizeSize(raw){raw=(raw||'').trim();if(!raw)return '';const u=raw.toUpperCase().replace(/\s+/g,' ');const sizes={A1:'594×841mm',A2:'420×594mm',A3:'297×420mm',A4:'210×297mm',A5:'148×210mm',A6:'105×148mm'};const m=u.match(/\b(A[1-6])\b/);if(m&&sizes[m[1]]){const [w,h]=sizes[m[1]].replace('mm','').split('×');const landscape=/가로|LANDSCAPE/.test(raw);return `${m[1]} ${landscape?`가로 (${h}×${w}mm)`:`세로 (${w}×${h}mm)`}`;}return raw}
setupSingleChoice('useChoices');setupSingleChoice('textChoices');setupSingleChoice('outputChoices');setupSingleChoice('accuracyChoices');
setupSingleChoice('ratioChoices',v=>document.getElementById('customRatio').classList.toggle('show',v==='__custom_ratio__'));
setupSingleChoice('moodChoices',v=>document.getElementById('customMood').classList.toggle('show',v==='__custom_mood__'));
setupSingleChoice('aiChoices',v=>{const tips={GPT:'✨ GPT용: 핵심 목적·정확성·구성 조건을 분명하게 하되 필요 이상으로 장황하지 않게 만들어요.',Gemini:'✨ Gemini용: 결과물 정의와 만들면 안 되는 장면·물체를 더 구체적으로 막아줘요. 한 장에 여러 시안을 만들지 않도록 별도 제한도 추가해요.','Google Flow':'✨ Google Flow용: 결과물 형식·프레임·고정 요소를 명확하게 나누어 제작 지시처럼 정리해요.','Claude Code':'✨ Claude Code용: 이미지 생성 도구/스킬을 사용할 때 읽기 쉬운 작업지시서와 생성 후 검증 항목으로 정리해요.'};document.getElementById('aiTip').textContent=tips[v]||'';document.getElementById('openSelectedAiBtn').textContent=v+' 열기'});
['similarKeep','recoverProblems','videoMove','videoKeep','protectKeep','photoKeep'].forEach(setupMulti);
setupSingleChoice('photoAiChoices',v=>{const b=document.getElementById('photoOpenAiBtn');if(b)b.textContent=v+' 열기'});
function buildAccuracy(core,accuracy){const specific=/(아이폰\s*\d+|iphone\s*\d+|갤럭시\s*[a-z]?\s*\d+|galaxy\s*[a-z]?\s*\d+|맥북|macbook|테슬라|bmw|benz|메르세데스|현대\s*\w+|기아\s*\w+)/i.test(core);if(accuracy==='similar')return '';if(accuracy==='exact'||specific)return `\n【실존 제품·모델 정확성】\n- 핵심 내용에 특정 실존 제품이나 모델명이 있다면 기억이나 추측에 의존하지 마세요.\n- 웹 검색이 가능한 경우 제조사 공식 제품 페이지나 공식 자료를 먼저 확인한 뒤 실제 외형을 기준으로 표현하세요.\n- 다른 세대·다른 모델·비슷한 제품으로 임의 대체하지 마세요.\n- 카메라 배열, 렌즈 위치, 프레임, 전면 형태, 버튼 등 모델을 식별하는 특징을 임의로 창작하지 마세요.\n- 공식 외형을 확인하기 어렵다면 다른 모델의 외형을 섞어서 그리지 마세요.\n`;return ''}
function layoutGuide(core){const hasPrice=/가격|만원|원\b|할인|혜택|지원금|조건/i.test(core);if(!hasPrice)return '';return `\n【정보 배치 가이드】\n- 핵심 가격·혜택·조건이 있다면 서로 따로 노는 요소처럼 두지 말고 하나의 정보 묶음처럼 구성하세요.\n- 가장 중요한 가격 또는 핵심 메시지는 가장 강하게 강조하세요.\n- 공시지원금, 카드사용조건처럼 가격에 붙는 조건은 가격 아래 또는 가까운 보조 정보 영역에 정돈해 배치하세요.\n- 조건 문구는 가격보다 덜 강조하되 실제 홍보물에서 읽기 쉬운 크기와 대비를 확보하세요.\n- 관련 조건들은 크기·정렬·간격을 통일해 하나의 세트처럼 보이게 해주세요.\n`}
const PRESET_PROMPT_CARDS=[
{id:'watercolor',category:'style',categoryLabel:'화풍 변환',module:'create',title:'수채화풍',desc:'부드럽고 따뜻하게',prompt:'이 이미지의 구도와 주요 대상은 유지하고, 전체를 부드러운 수채화 일러스트 느낌으로 바꿔줘. 색감은 자연스럽고 따뜻하게 표현해줘.'},
{id:'figure-box',category:'fun',categoryLabel:'재미 변환',module:'create',title:'피규어 박스',desc:'장난감 패키지 느낌',prompt:'이 인물을 장난감 피규어 패키지 상품처럼 보이게 만들어줘. 전체적으로 귀엽고 완성도 높은 상품 이미지처럼 표현해줘.'},
{id:'movie-poster',category:'fun',categoryLabel:'재미 변환',module:'create',title:'영화 포스터',desc:'시네마틱하게',prompt:'이 장면을 영화 포스터 같은 분위기로 재구성해줘. 핵심 대상이 먼저 눈에 들어오게 하고 드라마틱하고 시네마틱하게 표현해줘.'},
{id:'price-change',category:'practical',categoryLabel:'실전 수정',module:'photo',title:'가격만 변경',desc:'기존 디자인은 그대로',prompt:'기존 디자인은 그대로 유지하고 가격만 바꿔줘. 다른 문구, 레이아웃, 제품, 배경은 변경하지 말아줘.'},
{id:'background-change',category:'practical',categoryLabel:'실전 수정',module:'photo',title:'배경만 변경',desc:'피사체는 그대로',prompt:'인물과 의상, 포즈는 그대로 유지하고 배경만 바꿔줘. 인물 외의 나머지 부분만 자연스럽게 변경해줘.'},
{id:'topping-change',category:'practical',categoryLabel:'실전 수정',module:'photo',title:'이것만 바꾸기',desc:'대표 부분수정 예시',prompt:'케이크 본체, 접시, 배경, 구도, 조명은 그대로 유지하고 케이크 위 딸기 토핑만 블루베리로 바꿔줘.'},
{id:'webtoon',category:'style',categoryLabel:'화풍 변환',module:'create',title:'웹툰풍',desc:'또렷한 만화 느낌',prompt:'인물과 배경의 구도는 유지하고 전체 이미지를 웹툰 스타일 일러스트처럼 바꿔줘. 윤곽선은 또렷하게, 색은 깔끔하게 표현해줘.'},
{id:'pixelart',category:'style',categoryLabel:'화풍 변환',module:'create',title:'픽셀아트',desc:'레트로 게임 감성',prompt:'원본 이미지의 핵심 요소는 유지하고 전체를 픽셀아트 스타일로 바꿔줘. 레트로 게임 느낌이 나도록 단순화해줘.'},
{id:'clay',category:'style',categoryLabel:'화풍 변환',module:'create',title:'클레이풍',desc:'둥글고 귀엽게',prompt:'사진 속 대상과 구도는 유지하고 전체를 부드러운 클레이 아트 느낌으로 바꿔줘. 점토처럼 둥글고 귀엽게 표현해줘.'},
{id:'magazine-cover',category:'fun',categoryLabel:'재미 변환',module:'create',title:'잡지 표지',desc:'세련된 커버 느낌',prompt:'이 이미지를 세련된 매거진 표지 스타일로 만들어줘. 주요 피사체가 중심에 잘 보이도록 하고 고급스럽고 화보 같은 분위기로 표현해줘.'},
{id:'sticker-set',category:'fun',categoryLabel:'재미 변환',module:'create',title:'스티커 세트',desc:'귀엽고 활용도 높게',prompt:'이 사진 속 대상을 귀여운 스티커 세트처럼 만들어줘. 각각 다른 표정이나 포즈 느낌이 나도록 정리하고 배경은 깔끔하게 처리해줘.'},
{id:'text-date-change',category:'practical',categoryLabel:'실전 수정',module:'photo',title:'문구/날짜 변경',desc:'지정한 글자만 바꾸기',prompt:'기존 디자인의 전체 분위기와 레이아웃은 그대로 유지하고 내가 지정한 문구나 날짜만 바꿔줘. 다른 글자, 숫자, 배경, 제품은 변경하지 말아줘.'}
];
let presetExpanded=false,presetFilter='all';
function showPresetToast(text){document.querySelector('.preset-toast')?.remove();const el=document.createElement('div');el.className='preset-toast';el.textContent=text;document.body.appendChild(el);setTimeout(()=>el.remove(),2200)}
function applyPresetCard(id){const card=PRESET_PROMPT_CARDS.find(x=>x.id===id);if(!card)return;switchFreeTool(card.module);setTimeout(()=>{const box=document.getElementById(card.module==='create'?'createCore':'photoEditCore');if(!box)return;box.value=card.prompt;box.focus();box.setSelectionRange(box.value.length,box.value.length);showPresetToast(card.module==='create'?'예시가 입력됐어요. 그대로 쓰거나 조금만 고쳐보세요.':'예시가 입력됐어요. 원본을 올리고 바꿀 위치를 표시하면 더 정확해져요.')},60)}
function renderPresetCards(){const grid=document.getElementById('presetGrid'),more=document.getElementById('presetMoreBtn');if(!grid||!more)return;const filtered=PRESET_PROMPT_CARDS.filter(x=>presetFilter==='all'||x.category===presetFilter),visible=presetExpanded?filtered:filtered.slice(0,6);grid.innerHTML='';visible.forEach(card=>{const btn=document.createElement('button');btn.type='button';btn.className='preset-card';btn.innerHTML=`<span class="preset-category">${card.categoryLabel}</span><strong>${card.title}</strong><small>${card.desc}</small>`;btn.addEventListener('click',()=>applyPresetCard(card.id));grid.appendChild(btn)});more.style.display=filtered.length>6?'block':'none';more.textContent=presetExpanded?'접기':'예시 더 보기'}
function setupPresetGallery(){document.querySelectorAll('[data-preset-filter]').forEach(btn=>btn.addEventListener('click',()=>{presetFilter=btn.dataset.presetFilter||'all';presetExpanded=false;document.querySelectorAll('[data-preset-filter]').forEach(x=>x.classList.toggle('active',x===btn));renderPresetCards()}));document.getElementById('presetMoreBtn')?.addEventListener('click',()=>{presetExpanded=!presetExpanded;renderPresetCards()});renderPresetCards()}

function fillCreateExample(type){
  const examples={
    product:'갤럭시 S26 행사 이미지 만들고 싶어. 단골 1400명 돌파 기념이고 공시지원금, 제휴카드 사용조건으로 기계가격 1,000원을 가장 잘 보이게 하고 싶어. 매장 앞에 붙일 거라 고급스럽고 눈에 잘 띄게.',
    poster:'카페 여름 신메뉴 포스터 만들고 싶어. 망고빙수 8,900원 강조하고 시원하고 깔끔한 느낌. 매장 유리창에 붙일 거라 멀리서도 가격이 잘 보였으면 좋겠어.',
    sns:'인스타에 올릴 이벤트 이미지 만들고 싶어. 이번 주말만 20% 할인, 기간은 8월 29일부터 30일까지. 너무 광고 같지는 않고 밝고 세련되게.'
  };
  const box=document.getElementById('createCore');
  if(!box||!examples[type])return;
  box.value=examples[type];
  box.focus();
  box.setSelectionRange(box.value.length,box.value.length);
}
function makeCreatePrompt(){const core=document.getElementById('createCore').value.trim();if(!core){alert('만들고 싶은 내용을 적어주세요.');return}let ratio=val('ratioChoices');if(ratio==='__custom_ratio__')ratio=normalizeSize(document.getElementById('customRatio').value);let mood=val('moodChoices');if(mood==='__custom_mood__')mood=document.getElementById('customMood').value.trim();const use=val('useChoices'),text=val('textChoices'),output=val('outputChoices'),accuracy=val('accuracyChoices'),ai=val('aiChoices');let outputText=output==='design'?'- 실제 설치 장면이나 목업이 아닌, 바로 사용할 수 있는 최종 그래픽 디자인 자체':output==='mockup'?'- 완성 디자인이 실제 공간·기기·인쇄물 등에 적용된 사용 모습을 보여주는 목업':'- 핵심 내용과 용도를 보고 최종 디자인 자체와 실제 사용 목업 중 더 적절한 형태를 선택';let base=`${use} 용도의 이미지를 만들어 주세요.\n\n【핵심 내용】\n${core}\n\n【출력 형태】\n${outputText}\n\n【기본 조건】\n- 출력 규격: ${ratio||'자동'}\n- 분위기: ${mood||'요청 내용에 어울리게'}\n- ${text==='글자 없음'?'이미지 안에 글자를 넣지 말 것':text==='지정 문구만'?'사용자가 지정한 문구만 사용하고 임의 문구를 추가하지 말 것':'사용자가 요청하지 않은 글자, 숫자, 로고는 넣지 말 것'}\n`+buildAccuracy(core,accuracy)+`\n【구성 원칙】\n- 핵심 메시지와 주요 피사체가 첫눈에 들어오도록 정보 위계를 분명하게 구성하세요.\n- 제목 → 핵심 조건/혜택 → 주요 제품 또는 피사체 → 가장 중요한 가격/메시지 순으로 자연스러운 시선 흐름을 만드세요.\n- 충분한 여백을 두고 실제 사용 가능한 완성도를 우선하세요.\n- 특히 VMD·포스터·홍보물이라는 표현을 실제 매장 내부나 진열대 설치 장면으로 해석하지 마세요. 최종 광고 그래픽 자체를 요청한 경우 그 디자인 자체를 만들어 주세요.\n`+layoutGuide(core);
if(ai==='Gemini')base+=`\n【Gemini에서 임의로 확장하지 말 것】\n- 요청하지 않은 매장 내부, 건물, 공간 배경\n- 직원, 고객, 모델 등 요청하지 않은 사람\n- 실물 POP 스탠드, 진열대, 테이블, 받침대, 설치 구조물\n- 요청하지 않은 여러 대의 제품이나 색상 변형 제품 나열\n- 사용자가 요청하지 않은 로고, 브랜드 마크, 아이콘\n- 사용자가 제공하지 않은 문구, 숫자, 할인 조건, 설명 문장\n- 제품을 다른 모델처럼 보이게 하는 임의 재디자인\n\n【한 장만 생성】\n- 최종 결과는 사용 가능한 완성 디자인 1안, 이미지 1장으로만 생성하세요.\n- 한 이미지 안에 2개·3개 이상의 시안을 나란히 보여주지 마세요.\n- 비교용 시안, 분할 화면, 콜라주, 디자인 보드 형태로 만들지 마세요.\n- 지정한 출력 규격 전체를 하나의 디자인이 사용하도록 하세요.\n`;
else if(ai==='Google Flow')base+=`\n【Google Flow 작업 기준】\n- 하나의 최종 프레임으로 사용할 수 있도록 산출물 형태를 명확하게 유지하세요.\n- 핵심 피사체, 텍스트, 가격, 조건의 위치 관계를 임의로 확장하지 마세요.\n- 장면을 추가하기보다 요청한 그래픽 자체의 완성도를 높이세요.\n`;
else if(ai==='Claude Code')base=`이미지 생성 작업을 수행하세요. 필요하면 연결된 이미지 생성 도구/스킬을 사용하세요.\n\n${base}\n【작업 후 검증】\n- 요청하지 않은 요소가 추가됐는지 확인하세요.\n- 실존 제품 모델이 다른 세대나 다른 모델로 대체되지 않았는지 확인하세요.\n- 사용자가 요청한 규격과 출력 형태를 지켰는지 확인하세요.\n- 문제가 있으면 최종 산출물을 내기 전에 수정하세요.\n`;
base+=`\n【매우 중요】\n- 사용자가 요청한 요소만 이미지에 포함하세요.\n- 더 그럴듯하게 보이게 하려고 장면이나 물체를 임의로 추가하지 마세요.\n- 사용자가 명시한 문구와 숫자는 의미를 바꾸거나 새로운 내용으로 대체하지 마세요.\n- 최종 결과는 한 장의 완성 이미지로 제작하세요.`;
document.getElementById('createOutput').value=base;document.getElementById('createResult').classList.add('show');document.getElementById('createResult').scrollIntoView({behavior:'smooth',block:'start'})}
async function copyText(id){const t=document.getElementById(id).value;try{await navigator.clipboard.writeText(t);alert('복사했어요.')}catch(e){const el=document.getElementById(id);el.select();document.execCommand('copy');alert('복사했어요.')}}
function openSelectedAI(){const ai=val('aiChoices');const out=document.getElementById('createOutput');if(!out.value)makeCreatePrompt();copyText('createOutput');setTimeout(()=>window.open(AI_URLS[ai]||AI_URLS.GPT,'_blank'),100)}
function makeSimplePrompt(type){let out='';if(type==='similar'){const core=document.getElementById('similarCore').value.trim(),k=vals('similarKeep');out=`함께 첨부한 참고 이미지의 ${k.length?k.join(', '):'전체적인 분위기'}를 참고해서 새로운 이미지를 만들어 주세요.\n\n새로 만들 내용: ${core||'첨부 이미지와 비슷한 톤의 새 이미지'}\n\n참고 이미지를 그대로 복제하지 말고 선택한 시각적 특성만 참고하세요.`}if(type==='recover'){const p=vals('recoverProblems'),core=document.getElementById('recoverCore').value.trim();out=`이전 AI 편집 결과를 이어서 수정하지 말고, 처음 첨부한 원본 이미지에서 다시 작업해 주세요.\n\n원래 하려던 수정: ${core||'제가 요청한 수정만 적용'}\n이전 결과의 문제: ${p.length?p.join(', '):'원본에서 불필요한 부분까지 변형됨'}\n\n요청한 핵심 대상만 수정하고 그 외 원본은 유지하세요.`}if(type==='video'){const m=vals('videoMove'),k=vals('videoKeep');out=`첨부한 사진을 기반으로 짧고 자연스러운 영상을 만들어 주세요.\n\n움직임: ${m.length?m.join(', '):'과하지 않은 자연스러운 움직임'}\n바꾸면 안 되는 것: ${k.length?k.join(', '):'원본의 얼굴, 구도, 배경, 주요 특징'}\n\n원본을 새로 그리지 말고 자연스럽게 살아나는 정도로 움직임을 추가하세요.`}if(type==='protect'){const core=document.getElementById('protectCore').value.trim(),k=vals('protectKeep');out=`첨부한 원본 이미지를 편집해 주세요.\n\n실제 수정 요청: ${core||'제가 지정한 부분만 수정'}\n반드시 유지: ${k.length?k.join(', '):'요청하지 않은 모든 부분'}\n\n원본 이미지를 실제 수정 기준으로 사용하고 필요한 최소 영역만 수정하세요.`}document.getElementById(type+'Output').value=out;document.getElementById(type+'Result').classList.add('show')}

function toggleHomeMenu(force){const el=document.getElementById('homeMenu');const show=typeof force==='boolean'?force:!el.classList.contains('show');el.classList.toggle('show',show);document.body.style.overflow=show?'hidden':''}
const MODULE_NAMES=new Set(['photo','create','similar','recover','video','protect']);const PAGE_NAMES=new Set(['tools','studio','restore','upscale','animate']);
let currentScreen='home';let fallbackStack=['home'];
function allScreens(){return [document.getElementById('home'),...document.querySelectorAll('.page-screen[id^="page-"]'),...document.querySelectorAll('.module')]}
function renderScreen(screen){allScreens().forEach(el=>{if(!el)return;el.classList.remove('active');if(el.id==='home')el.style.display='none'});let target=screen==='home'?document.getElementById('home'):screen.startsWith('page-')?document.getElementById(screen):screen.startsWith('module-')?document.getElementById(screen):null;if(!target){screen='home';target=document.getElementById('home')}if(target.id==='home')target.style.display='block';target.classList.add('active');currentScreen=screen;window.scrollTo(0,0)}
function pushScreen(screen){if(screen===currentScreen)return;fallbackStack.push(screen);try{history.pushState({nmdScreen:screen},'',location.href.split('#')[0])}catch(e){}renderScreen(screen)}
function openPage(name){if(PAGE_NAMES.has(name))pushScreen('page-'+name)}
function openModule(name){if(MODULE_NAMES.has(name))pushScreen('module-'+name)}
function switchFreeTool(name){
  if(!MODULE_NAMES.has(name))return;
  const screen='module-'+name;
  if(screen===currentScreen)return;
  if(fallbackStack.length)fallbackStack[fallbackStack.length-1]=screen;else fallbackStack=[screen];
  try{history.replaceState({nmdScreen:screen},'',location.href.split('#')[0])}catch(e){}
  renderScreen(screen)
}
function goBack(){if(fallbackStack.length>1){const before=fallbackStack[fallbackStack.length-2];try{history.back();setTimeout(()=>{if(currentScreen!==before){fallbackStack.pop();renderScreen(before)}},120)}catch(e){fallbackStack.pop();renderScreen(before)}}else renderScreen('home')}
function goHome(){if(currentScreen==='home'){window.scrollTo(0,0);return}fallbackStack=['home'];try{history.pushState({nmdScreen:'home'},'',location.href.split('#')[0])}catch(e){}renderScreen('home')}
function scrollHome(id){if(currentScreen!=='home'){goHome();setTimeout(()=>document.getElementById(id)?.scrollIntoView({behavior:'smooth'}),120)}else document.getElementById(id)?.scrollIntoView({behavior:'smooth'})}
window.addEventListener('popstate',e=>{if(fallbackStack.length>1)fallbackStack.pop();const screen=(e.state&&e.state.nmdScreen)||fallbackStack[fallbackStack.length-1]||'home';if(!fallbackStack.includes(screen))fallbackStack.push(screen);renderScreen(screen)});
renderScreen('home');

function applyNaemaldaeroBrand(){
  const iconHref='./assets/brand/logo-character.webp?v=brand1';
  let icon=document.querySelector('link[rel="icon"]');
  if(!icon){icon=document.createElement('link');icon.rel='icon';document.head.appendChild(icon)}
  icon.type='image/webp';icon.href=iconHref;
  let shortcut=document.querySelector('link[rel="shortcut icon"]');
  if(!shortcut){shortcut=document.createElement('link');shortcut.rel='shortcut icon';document.head.appendChild(shortcut)}
  shortcut.type='image/webp';shortcut.href=iconHref;
  const sub=document.querySelector('.brand-new small');
  if(sub)sub.textContent='AI 요청 · 이미지 편집 · 사진 복원 · 영상화';
}
applyNaemaldaeroBrand();

function setupFreeToolSwitchers(){
  const tools=[['module-create','create'],['module-photo','photo']];
  tools.forEach(([id,active])=>{
    const module=document.getElementById(id);
    if(!module||module.querySelector('.free-tool-switcher'))return;
    const head=module.querySelector('.module-head');
    if(!head)return;
    const nav=document.createElement('div');
    nav.className='free-tool-switcher';
    nav.setAttribute('aria-label','무료 도구 전환');
    [['create','새 이미지 요청문'],['photo','이미지 부분수정']].forEach(([name,label])=>{
      const btn=document.createElement('button');
      btn.type='button';
      btn.textContent=label;
      btn.classList.toggle('active',name===active);
      btn.addEventListener('click',()=>switchFreeTool(name));
      nav.appendChild(btn);
    });
    head.insertAdjacentElement('afterend',nav);
  });
}

function applyStitchHomeStage1(){
  if(document.getElementById('nmdStitchStage1'))return;
  const css=document.createElement('link');
  css.id='nmdStitchStage1';css.rel='stylesheet';css.href='./assets/css/home-stitch.css?v=stage1fix5';document.head.appendChild(css);

  const oldHeader=document.querySelector('header.topbar');
  if(oldHeader){oldHeader.outerHTML=`<header class="nmd-header">
    <div class="nmd-header-inner">
      <button class="nmd-brand" onclick="goHome()" aria-label="홈으로"><img src="./assets/brand/logo-character.webp?v=brand1" alt="내말대로 로고"><span>내말대로</span></button>
      <nav class="nmd-desktop-nav" aria-label="주요 메뉴">
        <div class="nmd-services"><button class="nmd-services-toggle" type="button">서비스</button><div class="nmd-services-menu">
          <small>무료 도구</small><button onclick="openModule('create')">요청문 만들기</button><button onclick="openModule('photo')">이미지 부분수정</button>
          <small class="paid">결과 서비스</small><button onclick="openPage('restore')">사진 복원</button><button onclick="openPage('animate')">사진 영상화</button>
        </div></div>
        <button class="nmd-nav-link" onclick="scrollHome('examples')">사용 방법</button>
        <button class="nmd-nav-link" onclick="openPage('studio')">가격·이용안내</button>
        <button class="nmd-nav-link" type="button">자주 묻는 질문</button>
      </nav>
      <button class="nmd-header-cta" onclick="openModule('create')">무료로 시작하기</button>
      <button class="nmd-mobile-menu-btn" onclick="toggleHomeMenu()" aria-label="메뉴 열기"><span></span></button>
    </div>
  </header>`}

  const menu=document.getElementById('homeMenu');
  if(menu){menu.className='mobile-menu nmd-mobile-menu';menu.innerHTML=`<div class="nmd-mobile-sheet">
    <div class="nmd-drawer-head"><strong>내말대로</strong><button class="nmd-drawer-close" onclick="toggleHomeMenu(false)" aria-label="메뉴 닫기">×</button></div>
    <div class="nmd-drawer-nav">
      <div class="nmd-drawer-group"><small>무료 도구</small><button class="active" onclick="toggleHomeMenu(false);openModule('create')">요청문 만들기</button><button onclick="toggleHomeMenu(false);openModule('photo')">이미지 부분수정</button></div>
      <div class="nmd-drawer-group"><small class="paid">결과 서비스</small><button onclick="toggleHomeMenu(false);openPage('restore')">사진 복원</button><button onclick="toggleHomeMenu(false);openPage('animate')">사진 영상화</button></div>
      <div class="nmd-drawer-group nmd-drawer-plain"><button onclick="toggleHomeMenu(false);scrollHome('examples')">사용 방법</button><button onclick="toggleHomeMenu(false);openPage('studio')">가격·이용안내</button><button type="button">자주 묻는 질문</button><button onclick="toggleHomeMenu(false);openPage('studio')">문의하기</button></div>
    </div>
    <div class="nmd-drawer-foot"><button onclick="toggleHomeMenu(false);openModule('create')">무료로 시작하기 →</button></div>
  </div>`}

  const oldHero=document.querySelector('#home .hero-v3');
  if(oldHero){oldHero.outerHTML=`<section class="nmd-hero">
    <div class="nmd-hero-copy">
      <div class="nmd-hero-badge"><img src="./assets/brand/logo-character.webp?v=brand1" alt=""><span>네, 말씀하신 부분만 바꿀게요.</span></div>
      <h1>AI가 멋대로 말고,<br><em>내말대로.</em></h1>
      <p class="nmd-hero-lead">하고 싶은 말만 적으세요.<br class="mobile-only"> 바꿀 건 정확하게, 나머지는 그대로 지키도록 정리해드려요.</p>
    </div>
    <div class="nmd-proof-desktop">
      <div class="nmd-proof-grid">
        <div class="nmd-proof-card before"><img src="./assets/examples/hero-before-v3.webp?v=hero-v3-1" alt="원본 이미지"><span class="nmd-proof-label">ORIGINAL</span></div>
        <div class="nmd-proof-card after"><img src="./assets/examples/hero-after-v3.webp?v=hero-v3-1" alt="수정 결과 이미지"><span class="nmd-proof-label">RESULT</span></div>
      </div>
      <div class="nmd-proof-summary"><div><span class="icon">✎</span><span>변경 1: 딸기 토핑 → 블루베리</span></div><span class="divider"></span><div class="muted"><span class="icon">▣</span><span>유지 6: 케이크 · 접시 · 배경 · 구도 · 조명 · 색감</span></div></div>
    </div>
    <div class="nmd-proof-mobile">
      <div class="nmd-compare-card">
        <div class="nmd-compare">
          <img src="./assets/examples/hero-before-v3.webp?v=hero-v3-1" alt="원본 이미지">
          <img class="nmd-compare-after" src="./assets/examples/hero-after-v3.webp?v=hero-v3-1" alt="수정 결과 이미지">
          <span class="nmd-compare-tag before">ORIGINAL</span><span class="nmd-compare-tag after">RESULT</span><span class="nmd-compare-line"></span><span class="nmd-compare-knob">↔</span>
        </div>
      </div>
      <div class="nmd-mobile-proof-info"><div><span class="icon">✎</span><span>변경 1: 딸기 토핑 → 블루베리</span></div><div><span class="icon">▣</span><span>유지 6: 케이크 · 접시 · 배경 · 구도 · 조명 · 색감</span></div></div>
    </div>
    <div class="nmd-hero-actions"><button class="nmd-hero-primary" onclick="openModule('photo')">이미지 부분수정 시작하기 <span>→</span></button></div>
  </section>`}

  setupStitchCompare();
}

function setupStitchCompare(){
  const compare=document.querySelector('.nmd-compare');if(!compare)return;
  const after=compare.querySelector('.nmd-compare-after'),line=compare.querySelector('.nmd-compare-line'),knob=compare.querySelector('.nmd-compare-knob');if(!after||!line||!knob)return;
  let dragging=false;
  const setAt=x=>{const r=compare.getBoundingClientRect();const p=Math.max(0,Math.min(100,((x-r.left)/r.width)*100));after.style.clipPath=`inset(0 0 0 ${p}%)`;line.style.left=p+'%';knob.style.left=p+'%'};
  compare.addEventListener('pointerdown',e=>{dragging=true;compare.setPointerCapture?.(e.pointerId);setAt(e.clientX)});
  compare.addEventListener('pointermove',e=>{if(dragging)setAt(e.clientX)});
  compare.addEventListener('pointerup',()=>dragging=false);compare.addEventListener('pointercancel',()=>dragging=false);
}

setupFreeToolSwitchers();
setupPresetGallery();
applyStitchHomeStage1();
