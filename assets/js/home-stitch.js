(function(){
  function setupCompare(){
    const compare=document.querySelector('.nmd-compare');
    if(!compare)return;
    const after=compare.querySelector('.nmd-compare-after');
    const line=compare.querySelector('.nmd-compare-line');
    const knob=compare.querySelector('.nmd-compare-knob');
    if(!after||!line||!knob)return;
    let dragging=false;
    const setAt=(clientX)=>{
      const r=compare.getBoundingClientRect();
      const pct=Math.max(0,Math.min(100,((clientX-r.left)/r.width)*100));
      after.style.clipPath=`inset(0 0 0 ${pct}%)`;
      line.style.left=pct+'%';
      knob.style.left=pct+'%';
    };
    const point=(e)=>e.touches&&e.touches.length?e.touches[0].clientX:e.clientX;
    compare.addEventListener('pointerdown',e=>{dragging=true;compare.setPointerCapture?.(e.pointerId);setAt(e.clientX)});
    compare.addEventListener('pointermove',e=>{if(dragging)setAt(e.clientX)});
    compare.addEventListener('pointerup',()=>dragging=false);
    compare.addEventListener('pointercancel',()=>dragging=false);
    compare.addEventListener('touchstart',e=>setAt(point(e)),{passive:true});
    compare.addEventListener('touchmove',e=>setAt(point(e)),{passive:true});
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',setupCompare);
  else setupCompare();
})();
