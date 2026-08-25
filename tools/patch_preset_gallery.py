from pathlib import Path

index = Path('index.html')
html = index.read_text(encoding='utf-8')
anchor = '    <div class="field"><div class="label">어느 AI로 만들 건가요?</div><div class="choice" id="aiChoices"><button class="active" data-v="GPT">GPT</button><button data-v="Gemini">Gemini</button><button data-v="Google Flow">Google Flow</button><button data-v="Claude Code">Claude Code</button></div></div>'
gallery = '''    <div class="field preset-gallery-field">
      <div class="label">요즘 많이 쓰는 변환</div>
      <div class="hint">막막하면 하나 눌러보세요. 예시가 바로 채워져요.</div>
      <div class="preset-filter" id="presetFilter">
        <button type="button" class="active" data-preset-filter="all">전체</button>
        <button type="button" data-preset-filter="style">화풍 변환</button>
        <button type="button" data-preset-filter="fun">재미 변환</button>
        <button type="button" data-preset-filter="practical">실전 수정</button>
      </div>
      <div class="preset-grid" id="presetGrid"></div>
      <button type="button" class="preset-more" id="presetMoreBtn">예시 더 보기</button>
    </div>'''
if 'id="presetGrid"' not in html:
    if anchor not in html:
        raise SystemExit('AI choice anchor not found')
    html = html.replace(anchor, anchor + '\n' + gallery, 1)
html = html.replace('./assets/css/site.css?v=split4', './assets/css/site.css?v=split5', 1)
html = html.replace('./assets/js/app.js?v=split4', './assets/js/app.js?v=split5', 1)
index.write_text(html, encoding='utf-8')

cssp = Path('assets/css/site.css')
css = cssp.read_text(encoding='utf-8')
if '/* nmd-preset-gallery-v1 */' not in css:
    css += '''

/* nmd-preset-gallery-v1 */
.preset-gallery-field{margin-top:22px}
.preset-filter{display:flex;gap:7px;overflow-x:auto;padding:4px 0 10px;margin-top:10px;scrollbar-width:none}
.preset-filter::-webkit-scrollbar{display:none}
.preset-filter button{flex:0 0 auto;border:1px solid var(--line);background:#fff;color:#4f5967;border-radius:999px;min-height:34px;padding:0 12px;font-size:11px;font-weight:900;cursor:pointer}
.preset-filter button.active{background:var(--deep);border-color:var(--deep);color:#fff}
.preset-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px}
.preset-card{display:block;text-align:left;border:1px solid var(--line);background:#fff;border-radius:14px;padding:13px;min-height:104px;cursor:pointer;box-shadow:0 4px 14px rgba(7,27,59,.035)}
.preset-card .preset-category{display:block;color:#a27d10;font-size:10px;font-weight:900;margin-bottom:7px}
.preset-card strong{display:block;color:var(--deep);font-size:13px;line-height:1.28;margin-bottom:5px}
.preset-card small{display:block;color:#727b87;font-size:11px;line-height:1.4}
.preset-more{display:block;width:100%;margin-top:10px;min-height:42px;border:1px solid var(--line);background:#f8f6f0;color:var(--deep);border-radius:12px;font-size:12px;font-weight:900;cursor:pointer}
.preset-toast{position:fixed;left:50%;bottom:24px;transform:translateX(-50%);z-index:9999;background:#071b3b;color:#fff;border-radius:999px;padding:10px 14px;font-size:12px;font-weight:800;box-shadow:0 8px 26px rgba(0,0,0,.18);max-width:calc(100vw - 32px);text-align:center}
@media(max-width:680px){
  .preset-grid{grid-template-columns:repeat(2,minmax(0,1fr));gap:9px}
  .preset-card{min-height:96px;padding:12px;border-radius:13px}
  .preset-card strong{font-size:12px}
  .preset-card small{font-size:10px}
}
'''
    cssp.write_text(css, encoding='utf-8')

app = Path('assets/js/app.js')
js = app.read_text(encoding='utf-8')
if 'const PRESET_PROMPT_CARDS=' not in js:
    marker = 'function fillCreateExample(type){'
    if marker not in js:
        raise SystemExit('fillCreateExample marker not found')
    block = r'''const PRESET_PROMPT_CARDS=[
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
'''
    js = js.replace(marker, block + '\n' + marker, 1)
init = 'setupFreeToolSwitchers();\napplyStitchHomeStage1();'
if 'setupPresetGallery();' not in js:
    if init not in js:
        raise SystemExit('init anchor not found')
    js = js.replace(init, 'setupFreeToolSwitchers();\nsetupPresetGallery();\napplyStitchHomeStage1();', 1)
app.write_text(js, encoding='utf-8')

# clean temporary files created during this stage
for p in [
    Path('.github/workflows/add-preset-gallery-v1.yml'),
    Path('trigger-preset-gallery.txt'),
    Path('trigger-preset-gallery-2.txt'),
    Path('trigger-preset-gallery-3.txt'),
    Path('tools/patch_preset_gallery.py'),
]:
    if p.exists():
        p.unlink()
