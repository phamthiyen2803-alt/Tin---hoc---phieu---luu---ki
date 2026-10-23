'use strict';
const crypto=require('node:crypto');
const base=()=>String(process.env.SUPABASE_URL||'').replace(/\/$/,'');
const secret=()=>process.env.SUPABASE_SERVICE_ROLE_KEY||'';
function reply(res,status,data){res.setHeader('Cache-Control','no-store');res.setHeader('Content-Type','application/json; charset=utf-8');return res.status(status).end(JSON.stringify(data))}
function authorized(password){const expected=process.env.TEACHER_REPORT_PASSWORD||'';if(typeof password!=='string'||expected.length<12)return false;return crypto.timingSafeEqual(crypto.createHash('sha256').update(password).digest(),crypto.createHash('sha256').update(expected).digest())}
const valid=(s,n)=>typeof s==='string'&&s.trim().length>0&&s.trim().length<=n&&!/[<>\x00-\x1f]/.test(s);
const lesson=(s)=>{const m=String(s||'').trim().match(/^(?:bài\s*)?(\d{1,2}[a-b]?)\b/i);return m?m[1].toUpperCase():''};
async function rest(path,method,body){const key=secret(),r=await fetch(base()+'/rest/v1/'+path,{method,headers:{apikey:key,...(key.startsWith('sb_secret_')?{}:{Authorization:'Bearer '+key}),'Content-Type':'application/json',...(method==='POST'?{Prefer:'resolution=merge-duplicates,return=minimal'}:{})},...(body?{body:JSON.stringify(body)}:{})});if(!r.ok)throw Error('DATABASE_'+r.status);if(method==='GET')return r.json();return null}
module.exports=async(req,res)=>{
 if(!base()||!secret())return reply(res,503,{error:'Chưa kết nối Supabase.'});
 if(req.method==='GET'){
   try{const rows=await rest('thdk_shared_questions?select=grade,lesson,question,answers,correct&enabled=eq.true&order=created_at.asc&limit=2000','GET');return reply(res,200,{questions:rows})}
   catch(e){console.error('Shared question read unavailable',String(e.message).slice(0,50));return reply(res,503,{error:'Chưa khởi tạo kho câu hỏi chung trên Supabase.'})}
 }
 if(req.method!=='POST')return reply(res,405,{error:'Phương thức không được hỗ trợ.'});
 if(!authorized(req.body?.password))return reply(res,403,{error:'Mã quản trị không đúng.'});
 const rows=req.body?.questions;
 if(!Array.isArray(rows)||rows.length<1||rows.length>300)return reply(res,400,{error:'Chỉ đồng bộ từ 1 đến 300 câu mỗi lần.'});
 const out=[];let idx=0;
 for(const q of rows){
   if(!Array.isArray(q)||q.length<8||!['3','4','5'].includes(String(q[0]))||!lesson(q[1])||!valid(q[2],600)||q.slice(3,7).some(x=>!valid(x,200))||!Number.isInteger(Number(q[7]))||Number(q[7])<0||Number(q[7])>3)return reply(res,400,{error:'Câu hỏi '+(++idx)+' không hợp lệ.'});
   if(new Set(q.slice(3,7).map(x=>x.trim().toLocaleLowerCase('vi'))).size!==4)return reply(res,400,{error:'Có câu hỏi trùng đáp án.'});
   const id=crypto.createHash('sha256').update(String(q[0])+'|'+lesson(q[1])+'|'+q[2].trim().toLocaleLowerCase('vi')).digest('hex');
   out.push({id,grade:String(q[0]),lesson:lesson(q[1]),question:q[2].trim(),answers:q.slice(3,7).map(x=>x.trim()),correct:Number(q[7]),enabled:q[8]!==false});
   idx++;
 }
 try{await rest('thdk_shared_questions?on_conflict=id','POST',out);return reply(res,200,{ok:true,count:out.length})}
 catch(e){console.error('Shared question publish unavailable',String(e.message).slice(0,50));return reply(res,503,{error:'Chưa lưu được lên kho chung. Kiểm tra SQL Supabase.'})}
};
