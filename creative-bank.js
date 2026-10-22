(()=>{'use strict';
const key='thdk_teacher_drafts_v1',get=id=>document.getElementById(id);
function lessonId(raw){const m=String(raw||'').trim().match(/^(?:bài\s*)?(\d{1,2}[a-b]?)\b/i);return m?m[1].toUpperCase():null}
window.thdkExtraQuestions=function(grade,lesson){
 try{const a=JSON.parse(localStorage.getItem(key)||'[]');if(!Array.isArray(a))return [];
 return a.filter(q=>Array.isArray(q)&&String(q[0])===String(grade)&&lessonId(q[1])===String(lesson).toUpperCase()&&q[8]!==false&&q.slice(2,7).every(x=>typeof x==='string'&&x.trim())&&/^[0-3]$/.test(String(q[7])))
 .map(q=>[q[2],q.slice(3,7),Number(q[7]),'Đáp án đúng: '+q[Number(q[7])+3]]);
 }catch{return []}
};
const box=get('creative-question-content');if(!box)return;
const actions=box.querySelector('.creative-actions');
const save=document.createElement('button');save.type='button';save.textContent='💾 Lưu câu hỏi';
actions.appendChild(save);
const reset=document.createElement('button');reset.type='button';reset.textContent='➕ Câu hỏi mới';actions.appendChild(reset);
const section=document.createElement('div');section.className='creative-bank';section.innerHTML='<h3>📚 Câu hỏi đã lưu trên thiết bị này</h3><p class="creative-note">Câu hỏi bật sẽ được thêm vào lượt luyện tập của đúng khối và bài trên trình duyệt này; chưa đồng bộ sang thiết bị khác.</p><div id="creative-bank-items"></div>';
box.appendChild(section);
const status=document.createElement('p');status.setAttribute('role','status');status.setAttribute('aria-live','polite');status.style.cssText='color:#145b44;font-weight:800;margin:10px 0';actions.after(status);
let edit=-1;
const ids=['creative-grade','creative-lesson','creative-question','creative-a','creative-b','creative-c','creative-d','creative-correct'];
function load(){try{let v=JSON.parse(localStorage.getItem(key)||'[]');return Array.isArray(v)?v:[]}catch{return []}}
function store(v){try{localStorage.setItem(key,JSON.stringify(v));return true}catch{alert('Không thể lưu trên trình duyệt này.');return false}}
function clean(){edit=-1;status.textContent='';ids.slice(1).forEach(id=>get(id).value='');get('creative-correct').value='0';get('creative-preview-output').hidden=true}
function render(){const items=get('creative-bank-items');items.replaceChildren();load().forEach((q,i)=>{const el=document.createElement('div');el.className='creative-saved-item';const text=document.createElement('p');text.textContent='Tin học '+q[0]+' • '+q[1]+' — '+q[2];const e=document.createElement('button');e.type='button';e.textContent='✏️ Sửa';e.onclick=()=>{edit=i;ids.forEach((id,j)=>get(id).value=q[j]);get('creative-question').focus()};const toggle=document.createElement('button');toggle.type='button';toggle.textContent=q[8]===false?'🔘 Đang tắt – Bật':'✅ Đang bật – Tắt';toggle.onclick=()=>{const a=load();if(!a[i])return;a[i][8]=a[i][8]===false?true:false;if(store(a))render()};const d=document.createElement('button');d.type='button';d.textContent='🗑 Xóa';d.onclick=()=>{if(confirm('Xóa câu hỏi này khỏi kho trên thiết bị?')){const a=load();a.splice(i,1);if(store(a)){clean();render()}}};el.append(text,e,toggle,d);items.appendChild(el)});if(!items.children.length)items.textContent='Chưa lưu câu hỏi nào.'}
save.onclick=()=>{const q=ids.map(id=>get(id).value.trim());if(q.slice(1,7).some(v=>!v)){alert('Hãy nhập bài học, nội dung và đủ 4 đáp án.');return}const a=load();const id=lessonId(q[1]);if(!id){alert('Vui lòng nhập đúng mã bài học, ví dụ: Bài 3 hoặc 12A.');return}q[1]='Bài '+id;if(edit>=0&&edit<a.length){q[8]=a[edit][8]!==false;a[edit]=q}else{q[8]=true;a.unshift(q)}if(store(a)){clean();render();status.textContent='✅ Đã lưu và bật câu hỏi trong bài học trên thiết bị này. Câu hỏi gốc không bị thay đổi; chưa đồng bộ tới các máy khác.';section.scrollIntoView({behavior:'smooth',block:'nearest'})}};
reset.onclick=clean;render();
})();