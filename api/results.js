'use strict';
const crypto=require('node:crypto');
const url=()=>String(process.env.SUPABASE_URL||'').replace(/\/$/,'');
const key=()=>process.env.SUPABASE_SERVICE_ROLE_KEY||'';
function json(res,status,body){res.status(status).setHeader('Content-Type','application/json; charset=utf-8').setHeader('Cache-Control','no-store');return res.end(JSON.stringify(body))}
function auth(password){const expected=process.env.TEACHER_REPORT_PASSWORD||'';if(expected.length<12||typeof password!=='string')return false;const a=crypto.createHash('sha256').update(password).digest(),b=crypto.createHash('sha256').update(expected).digest();return crypto.timingSafeEqual(a,b)}
function validText(s,max){return typeof s==='string'&&s.trim().length>0&&s.trim().length<=max&& !/[\x00-\x1f<>]/.test(s)}
module.exports=async function handler(req,res){
 if(!url()||!key())return json(res,503,{error:'Chưa kết nối cơ sở dữ liệu trên Vercel.'});
 if(req.method!=='POST')return json(res,405,{error:'Chỉ chấp nhận POST.'});
 const b=req.body||{};
 if(b.action==='submit'){
  if(!validText(b.name,70)||!validText(b.cls,20)||!['3','4','5'].includes(String(b.grade))||!validText(b.lesson,120)||!Number.isInteger(b.score)||!Number.isInteger(b.total)||b.total<1||b.total>100||b.score<0||b.score>b.total)return json(res,400,{error:'Thông tin kết quả không hợp lệ.'});
  const payload={student_name:b.name.trim(),class_name:b.cls.trim(),grade:String(b.grade),lesson:b.lesson.trim(),score:b.score,total:b.total};
  try{const r=await fetch(url()+'/rest/v1/learning_results',{method:'POST',headers:{apikey:key(),...(key().startsWith('sb_secret_')?{}:{Authorization:'Bearer '+key()}),'Content-Type':'application/json',Prefer:'return=minimal'},body:JSON.stringify(payload)});if(!r.ok)return json(res,503,{error:'Supabase từ chối lưu điểm (HTTP '+r.status+').',sourceStatus:r.status});return json(res,201,{ok:true})}catch{return json(res,503,{error:'Chưa lưu được kết quả lên hệ thống chung.'})}
 }
 if(b.action==='report'){
  if(!auth(b.password))return json(res,403,{error:'Mật khẩu giáo viên không đúng hoặc chưa cấu hình.'});
  const grade=['3','4','5'].includes(String(b.grade))?String(b.grade):'';
  const query='/rest/v1/learning_results?select=created_at,student_name,class_name,grade,lesson,score,total&order=created_at.desc&limit=1000'+(grade?'&grade=eq.'+grade:'');
  try{const r=await fetch(url()+query,{headers:{apikey:key(),...(key().startsWith('sb_secret_')?{}:{Authorization:'Bearer '+key()})}});if(!r.ok)return json(res,503,{error:'Supabase từ chối đọc báo cáo (HTTP '+r.status+').',sourceStatus:r.status});return json(res,200,{rows:await r.json(),limit:1000})}catch(e){const code=e?.cause?.code||e?.code||'FETCH_FAILED';const known=['ENOTFOUND','EAI_AGAIN','ECONNREFUSED','ETIMEDOUT','UND_ERR_CONNECT_TIMEOUT','CERT_HAS_EXPIRED','SELF_SIGNED_CERT_IN_CHAIN'];const safe=known.includes(code)?code:'FETCH_FAILED';console.error('Supabase report request failed:',safe);return json(res,503,{error:'Không kết nối được Supabase ('+safe+'). Vui lòng kiểm tra địa chỉ SUPABASE_URL và kết nối máy chủ.',diagnostic:safe})}
 }
 return json(res,400,{error:'Yêu cầu không hợp lệ.'});
};
