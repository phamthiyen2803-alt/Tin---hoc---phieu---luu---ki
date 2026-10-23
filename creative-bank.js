(()=>{'use strict';
const key='thdk_teacher_drafts_v1',get=id=>document.getElementById(id);
function lessonId(raw){const m=String(raw||'').trim().match(/^(?:bài\s*)?(\d{1,2}[a-b]?)\b/i);return m?m[1].toUpperCase():null}
function lessons(grade){const a=Array.from({length:16},(_,i)=>String(i+1));if(grade==='4')a.splice(12,0,'12A','12B');if(grade==='5'){a.splice(9,0,'9A','9B');a.splice(8,0,'8A','8B')}return a}
function load(){try{const a=JSON.parse(localStorage.getItem(key)||'[]');return Array.isArray(a)?a.filter(q=>Array.isArray(q)&&q.length>=8):[]}catch{return []}}
let shared=[];
function mapQuestion(q){return [q[2],q.slice(3,7),Number(q[7]),'Đáp án đúng: '+q[Number(q[7])+3]]}
window.thdkExtraQuestions=function(grade,lesson){try{
 const local=load().filter(q=>String(q[0])===String(grade)&&lessonId(q[1])===String(lesson).toUpperCase()&&q[8]!==false&&q.slice(2,7).every(x=>typeof x==='string'&&x.trim())&&/^[0-3]$/.test(String(q[7])));
 const global=shared.filter(q=>String(q.grade)===String(grade)&&String(q.lesson).toUpperCase()===String(lesson).toUpperCase()).map(q=>[q.grade,'Bài '+q.lesson,q.question,...q.answers,q.correct,true]);
 const ids=new Set();return local.concat(global).filter(q=>{const id=String(q[0])+'|'+String(q[1])+'|'+String(q[2]).trim().toLocaleLowerCase('vi');if(ids.has(id))return false;ids.add(id);return true}).map(mapQuestion)
}catch{return []}};
async function refreshShared(){const r=await fetch('/api/shared-questions',{cache:'no-store'});if(!r.ok)throw Error('Chưa kết nối kho câu hỏi chung');const data=await r.json();if(!Array.isArray(data.questions))throw Error('Dữ liệu kho chung chưa hợp lệ');shared=data.questions.filter(q=>q&&Array.isArray(q.answers)&&q.answers.length===4);return shared.length}
refreshShared().catch(()=>{});

const box=get('creative-question-content');if(!box)return;
const grade=get('creative-grade'),lesson=get('creative-lesson'),preview=get('creative-preview-output'),actions=box.querySelector('.creative-actions');
const hint=document.createElement('p');hint.className='creative-note';hint.textContent='Bước 1: Chọn khối và bài học → Bước 2: Nhập câu hỏi → Bước 3: Xem trước và lưu. Chọn Bật để câu hỏi xuất hiện trong lượt luyện tập trên thiết bị này.';
box.insertBefore(hint,box.querySelector('.creative-fields'));
const list=document.createElement('datalist');list.id='creative-lesson-options';lesson.setAttribute('list',list.id);lesson.setAttribute('placeholder','Chọn hoặc nhập: Bài 1');lesson.after(list);
const tip=document.createElement('small');tip.style.color='#536ca3';lesson.after(tip);
function refreshLessons(){list.replaceChildren();const valid=lessons(grade.value);valid.forEach(n=>{const o=document.createElement('option');o.value='Bài '+n;list.append(o)});tip.textContent='Các bài gợi ý: '+valid.map(x=>'Bài '+x).join(', ')}
grade.addEventListener('change',()=>{lesson.value='';refreshLessons();preview.hidden=true});refreshLessons();
const save=document.createElement('button');save.type='button';save.textContent='💾 Lưu câu hỏi';
actions.append(save);
const reset=document.createElement('button');reset.type='button';reset.textContent='➕ Câu hỏi mới';actions.append(reset);
const section=document.createElement('div');section.className='creative-bank';section.innerHTML='<h3>📚 Câu hỏi của tôi</h3><p class="creative-note">Lưu trên trình duyệt này; chưa đồng bộ tới các thiết bị khác. Có thể sửa, xóa hoặc bật/tắt từng câu. Câu hỏi gốc không bị thay đổi.</p><div id="creative-bank-items"></div>';
box.append(section);
const backup=document.createElement('div');backup.className='creative-backup';backup.innerHTML='<h4>📦 Sao lưu và chuyển bộ câu hỏi</h4><p class="creative-note">Tải tệp dự phòng về máy; khi đổi trình duyệt hoặc chuyển thiết bị, có thể nhập lại tệp này. Không nhập tệp từ nguồn không tin cậy.</p>';
const exportBtn=document.createElement('button');exportBtn.type='button';exportBtn.textContent='⬇️ Xuất bộ câu hỏi (.json)';
const importBtn=document.createElement('button');importBtn.type='button';importBtn.textContent='⬆️ Nhập bộ câu hỏi (.json)';
const fileInput=document.createElement('input');fileInput.type='file';fileInput.accept='.json,application/json';fileInput.hidden=true;
backup.append(exportBtn,importBtn,fileInput);box.append(backup);
const cloud=document.createElement('div');cloud.className='creative-backup';
const cloudHeader=document.createElement('h4');cloudHeader.textContent='☁️ Đồng bộ câu hỏi nhiều thiết bị';
const cloudInfo=document.createElement('p');cloudInfo.className='creative-note';cloudInfo.textContent='Quản trị viên nhập mã quản trị báo cáo để đưa câu hỏi vào kho chung. Học sinh trên các máy khác sẽ thấy câu hỏi sau khi tải lại website. Câu gốc không thay đổi.';
const cloudPass=document.createElement('input');cloudPass.type='password';cloudPass.placeholder='Mã quản trị báo cáo';cloudPass.autocomplete='off';cloudPass.setAttribute('aria-label','Mã quản trị để đồng bộ câu hỏi');cloudPass.style.cssText='padding:10px;border:1px solid #ccd6ef;border-radius:10px;max-width:250px';
const upload=document.createElement('button');upload.type='button';upload.textContent='☁️ Đồng bộ câu hỏi đã lưu';
const reload=document.createElement('button');reload.type='button';reload.textContent='🔄 Kiểm tra kho chung';
const cloudStatus=document.createElement('p');cloudStatus.className='creative-note';cloudStatus.setAttribute('role','status');
cloud.append(cloudHeader,cloudInfo,cloudPass,upload,reload,cloudStatus);box.append(cloud);
upload.onclick=async()=>{const all=load();if(!all.length){cloudStatus.textContent='Chưa có câu hỏi để đồng bộ.';return}if(!cloudPass.value){cloudStatus.textContent='Vui lòng nhập mã quản trị.';return}upload.disabled=true;try{const r=await fetch('/api/shared-questions',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({password:cloudPass.value,questions:all})});const v=await r.json();if(!r.ok)throw Error(v.error||'Đồng bộ không thành công');cloudStatus.textContent='✅ Đã đồng bộ '+v.count+' câu hỏi lên kho chung. Hãy tải lại trang trên máy học sinh.';cloudPass.value='';await refreshShared()}catch(e){cloudStatus.textContent='⚠️ '+e.message}finally{upload.disabled=false}};
reload.onclick=async()=>{try{const n=await refreshShared();cloudStatus.textContent='✅ Kho chung có '+n+' câu đang bật.'}catch(e){cloudStatus.textContent='⚠️ '+e.message}};

function validRow(row){if(!Array.isArray(row)||row.length<8)return null;const q=row.slice(0,8).map(v=>String(v||'').trim());const n=lessonId(q[1]);if(!['3','4','5'].includes(q[0])||!n||!lessons(q[0]).includes(n)||!q[2]||q.slice(3,7).some(x=>!x)||!/^[0-3]$/.test(q[7]))return null;if(new Set(q.slice(3,7).map(x=>x.toLocaleLowerCase('vi'))).size!==4)return null;if(q.some(x=>x.length>600))return null;q[1]='Bài '+n;q[8]=row[8]!==false;return q}
function rowKey(q){return q[0]+'|'+lessonId(q[1])+'|'+q[2].trim().toLocaleLowerCase('vi')}
exportBtn.addEventListener('click',()=>{const rows=load();if(!rows.length){status.textContent='Chưa có câu hỏi nào để xuất.';return}const blob=new Blob([JSON.stringify({format:'thdk-teacher-questions',version:1,exportedAt:new Date().toISOString(),questions:rows},null,2)],{type:'application/json;charset=utf-8'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='tin-hoc-dieu-ky-cau-hoi-'+new Date().toISOString().slice(0,10)+'.json';document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);status.textContent='✅ Đã chuẩn bị tệp sao lưu '+rows.length+' câu hỏi.'});
importBtn.addEventListener('click',()=>fileInput.click());
fileInput.addEventListener('change',async()=>{const file=fileInput.files&&fileInput.files[0];fileInput.value='';if(!file)return;if(file.size>1024*1024){status.textContent='⚠️ Tệp vượt quá 1 MB. Vui lòng chọn tệp sao lưu nhỏ hơn.';return}try{const data=JSON.parse(await file.text());if(!data||data.format!=='thdk-teacher-questions'||data.version!==1||!Array.isArray(data.questions)){status.textContent='⚠️ Không đúng định dạng tệp sao lưu Tin học diệu kỳ.';return}if(data.questions.length>300){status.textContent='⚠️ Tệp chứa quá 300 câu hỏi.';return}const incoming=data.questions.map(validRow);if(incoming.some(q=>!q)){status.textContent='⚠️ Tệp có câu hỏi không hợp lệ. Chưa nhập dữ liệu.';return}const old=load(),keys=new Set(old.map(rowKey));let added=0,skipped=0;const merged=old.slice();for(const q of incoming){const k=rowKey(q);if(keys.has(k)){skipped++;continue}if(merged.length>=300){status.textContent='⚠️ Đã đạt tối đa 300 câu hỏi. Hãy xóa bớt trước khi nhập.';return}keys.add(k);merged.push(q);added++}if(added&&!store(merged))return;render();status.textContent='✅ Đã nhập '+added+' câu mới; bỏ qua '+skipped+' câu trùng. Các câu hỏi cũ được giữ nguyên.'}catch(e){status.textContent='⚠️ Không thể đọc tệp JSON. Chưa thay đổi dữ liệu.'}});

const status=document.createElement('p');status.setAttribute('role','status');status.setAttribute('aria-live','polite');status.className='creative-save-status';actions.after(status);
let edit=-1;const ids=['creative-grade','creative-lesson','creative-question','creative-a','creative-b','creative-c','creative-d','creative-correct'];
function store(v){try{localStorage.setItem(key,JSON.stringify(v));return true}catch{status.textContent='⚠️ Không thể lưu trên trình duyệt này. Kiểm tra dung lượng và chế độ riêng tư.';return false}}
function clean(){edit=-1;ids.slice(1).forEach(id=>get(id).value='');get('creative-correct').value='0';preview.hidden=true;save.textContent='💾 Lưu câu hỏi mới';status.textContent='';lesson.focus()}
function data(){const q=ids.map(id=>get(id).value.trim());if(!q[1]||!q[2]||q.slice(3,7).some(v=>!v)){status.textContent='⚠️ Hãy nhập bài học, nội dung và đầy đủ bốn đáp án.';return null}const n=lessonId(q[1]);if(!n||!lessons(q[0]).includes(n)){status.textContent='⚠️ Bài học chưa hợp lệ với khối đã chọn. Hãy chọn theo danh sách gợi ý.';return null}if(new Set(q.slice(3,7).map(v=>v.toLocaleLowerCase('vi'))).size<4){status.textContent='⚠️ Chưa thể lưu: các đáp án A, B, C, D phải khác nhau. Ví dụ, không nhập A và B cùng là “a” hoặc C và D cùng là “d”. Hãy chỉnh lại rồi xem trước hoặc lưu.';status.scrollIntoView({behavior:'smooth',block:'nearest'});return null}q[1]='Bài '+n;return q}
function render(){const items=get('creative-bank-items');items.replaceChildren();const all=load();const summary=document.createElement('p');summary.className='creative-note';summary.textContent=all.length+' câu đã lưu • '+all.filter(q=>q[8]!==false).length+' câu đang bật';items.append(summary);
all.forEach((q,i)=>{const el=document.createElement('div');el.className='creative-saved-item';const label=document.createElement('p');label.textContent=(q[8]===false?'🔘 Tạm tắt • ':'✅ Đang bật • ')+'Tin học '+q[0]+' • '+q[1]+' — '+q[2];el.append(label);
const e=document.createElement('button');e.type='button';e.textContent='✏️ Sửa';e.onclick=()=>{edit=i;ids.forEach((id,j)=>get(id).value=q[j]);refreshLessons();save.textContent='💾 Lưu thay đổi';status.textContent='Đang sửa câu hỏi '+(i+1)+'.';preview.hidden=true;box.scrollIntoView({behavior:'smooth',block:'start'});get('creative-question').focus()};
const toggle=document.createElement('button');toggle.type='button';toggle.textContent=q[8]===false?'🔘 Bật câu hỏi':'✅ Tắt câu hỏi';toggle.onclick=()=>{const a=load();if(!a[i])return;a[i][8]=a[i][8]===false;if(store(a)){render();status.textContent=a[i][8]?'Đã tắt câu hỏi, bản lưu vẫn còn.':'Đã bật câu hỏi cho bài học tương ứng trên thiết bị này.'}};
const del=document.createElement('button');del.type='button';del.textContent='🗑 Xóa';del.onclick=()=>{if(!confirm('Xóa vĩnh viễn câu hỏi này khỏi trình duyệt?'))return;const a=load();a.splice(i,1);if(store(a)){clean();render();status.textContent='Đã xóa câu hỏi.'}};
el.append(e,toggle,del);items.append(el)});if(!all.length){const p=document.createElement('p');p.textContent='Chưa có câu hỏi nào. Hãy tạo câu hỏi đầu tiên ở phía trên.';items.append(p)}}
save.onclick=()=>{const q=data();if(!q)return;const a=load();if(edit<0&&a.length>=300){status.textContent='⚠️ Thiết bị đã có 300 câu hỏi; hãy xóa câu không dùng trước khi thêm.';return}const duplicate=a.findIndex((v,i)=>i!==edit&&v[0]===q[0]&&lessonId(v[1])===lessonId(q[1])&&String(v[2]).trim().toLocaleLowerCase('vi')===q[2].toLocaleLowerCase('vi'));if(duplicate>=0){status.textContent='⚠️ Câu hỏi này đã có trong kho của bạn ('+a[duplicate][1]+').';return}
const changed=edit>=0&&edit<a.length;if(changed){q[8]=a[edit][8]!==false;a[edit]=q}else{q[8]=true;a.unshift(q)}if(store(a)){clean();render();status.textContent=changed?'✅ Đã lưu thay đổi.':'✅ Đã lưu câu hỏi mới và bật trong đúng bài học trên trình duyệt này.';section.scrollIntoView({behavior:'smooth',block:'nearest'})}};
reset.onclick=clean;
const previewButton=get('creative-preview');previewButton.addEventListener('click',()=>{const q=data();if(!q){preview.hidden=true;return}preview.textContent='TIN HỌC '+q[0]+' • '+q[1]+'\n\n'+q[2]+'\n\n'+q.slice(3,7).map((v,i)=>String.fromCharCode(65+i)+'. '+v).join('\n')+'\n\n✔ Đáp án đúng: '+String.fromCharCode(65+Number(q[7]));preview.hidden=false;status.textContent='Đã xem trước. Nếu đúng, nhấn Lưu câu hỏi.'});
render();
})();