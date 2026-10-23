'use strict';
const base=()=>String(process.env.SUPABASE_URL||'').replace(/\/$/,'');
const secret=()=>process.env.SUPABASE_SERVICE_ROLE_KEY||'';
const send=(res,status,data)=>{res.status(status).setHeader('Cache-Control','no-store');res.setHeader('Content-Type','application/json; charset=utf-8');res.end(JSON.stringify(data))};
const good=(v,max)=>typeof v==='string'&&v.trim().length>0&&v.trim().length<=max&&!/[<>\x00-\x1f]/.test(v);
async function call(route,method,body,token,prefer){
 const r=await fetch(base()+route,{method,headers:{apikey:secret(),...(secret().startsWith('sb_secret_')?{}:{Authorization:'Bearer '+secret()}),'Content-Type':'application/json',...(prefer?{Prefer:prefer}:{})},...(body?{body:JSON.stringify(body)}:{})});
 const txt=await r.text();let data=null;try{data=txt?JSON.parse(txt):null}catch{}
 if(!r.ok)throw Object.assign(new Error('REMOTE'),{status:r.status,remoteCode:String(data?.code||data?.error_code||'').slice(0,100)});return data;
}
module.exports=async(req,res)=>{
 if(req.method!=='POST')return send(res,405,{error:'Chỉ hỗ trợ POST.'});
 if(!base()||!secret())return send(res,503,{error:'Chưa cấu hình Supabase.'});
 const b=req.body||{},action=String(b.action||'');
 try{
  if(action==='register'||action==='login'){
   if(!good(b.email,254)||!/^\S+@\S+\.\S+$/.test(b.email)||typeof b.password!=='string'||b.password.length<10||b.password.length>128)return send(res,400,{error:'Email hoặc mật khẩu không hợp lệ (tối thiểu 10 ký tự).'});
   if(action==='register'&&(!good(b.name,100)||!good(b.school,150)))return send(res,400,{error:'Nhập tên giáo viên và tên trường.'});
   const url=action==='register'?'/auth/v1/signup':'/auth/v1/token?grant_type=password';
   let auth;try{auth=await call(url,'POST',{email:b.email.trim().toLowerCase(),password:b.password,...(action==='register'?{data:{display_name:b.name.trim(),school_name:b.school.trim()}}:{})})}catch(err){
    const code=err?.remoteCode||'';
    let message=action==='register'?'Không thể đăng ký tài khoản. Vui lòng kiểm tra địa chỉ email và thử lại.':'Email, mật khẩu không đúng hoặc email chưa được xác nhận.';
    if(err?.status===429||/rate_limit|over_email_send/i.test(code))message='Có quá nhiều yêu cầu. Hãy thử lại sau ít phút.';
    else if(/signup_disabled/i.test(code))message='Hệ thống chưa bật cho phép đăng ký tài khoản giáo viên trong Supabase Auth.';
    else if(/email_exists|user_already_exists|user_already_registered/i.test(code))message='Email này đã được đăng ký. Hãy dùng nút Đăng nhập hoặc đặt lại mật khẩu.';
    else if(/email_address_invalid|email_provider_disabled/i.test(code))message='Địa chỉ email không hợp lệ hoặc hệ thống chưa cấu hình gửi email xác nhận.';
    else if(/captcha/i.test(code))message='Hệ thống đang yêu cầu CAPTCHA nhưng giao diện đăng ký chưa hỗ trợ. Cần kiểm tra cấu hình Supabase Auth.';
    else if(err?.status>=500)message='Dịch vụ xác thực đang gặp lỗi cấu hình hoặc lỗi máy chủ. Cần kiểm tra Supabase Auth.';
    return send(res,err?.status===429?429:400,{error:message,authCode:code||undefined});
   }
   return send(res,200,{ok:true,token:auth?.access_token||null,requiresConfirmation:!auth?.access_token,expiresIn:auth?.expires_in||3600});
  }
  const token=String(req.headers.authorization||'').replace(/^Bearer\s+/i,'');
  if(!token||token.length>5000)return send(res,401,{error:'Vui lòng đăng nhập.'});
  const userResponse=await fetch(base()+'/auth/v1/user',{headers:{apikey:secret(),Authorization:'Bearer '+token}});
  if(!userResponse.ok)return send(res,401,{error:'Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.'});
  const u=await userResponse.json();if(!u?.id||!u?.email)return send(res,401,{error:'Phiên đăng nhập không hợp lệ.'});
  const uid=u.id;
  const tbl=t=>'/rest/v1/'+t;
  const eq=x=>encodeURIComponent(x);
  const teachers=await call(tbl('thdk_teachers')+'?user_id=eq.'+eq(uid)+'&select=*','GET');
  let profile=teachers?.[0];
  if(!profile){
   const name=u.user_metadata?.display_name,school=u.user_metadata?.school_name;
   if(!good(name,100)||!good(school,150))return send(res,403,{error:'Tài khoản chưa có thông tin trường. Đăng ký tài khoản mới để sử dụng.'});
   const rows=await call(tbl('thdk_teachers'),'POST',{user_id:uid,teacher_name:name,school_name:school},null,'return=representation');profile=rows?.[0];
  }
  if(action==='me')return send(res,200,{profile});
  if(action==='list'){
   const [classes,questions]=await Promise.all([
    call(tbl('thdk_classes')+'?teacher_id=eq.'+eq(uid)+'&select=*&order=created_at.desc&limit=100','GET'),
    call(tbl('thdk_questions')+'?teacher_id=eq.'+eq(uid)+'&select=*&order=created_at.desc&limit=500','GET')
   ]);return send(res,200,{profile,classes,questions});
  }
  if(action==='createClass'){
   if(!good(b.name,40)||!['3','4','5'].includes(String(b.grade))||typeof b.year!=='string'||b.year.length>20)return send(res,400,{error:'Dữ liệu lớp không hợp lệ.'});
   const rows=await call(tbl('thdk_classes'),'POST',{teacher_id:uid,school_name:profile.school_name,class_name:b.name.trim(),grade:String(b.grade),school_year:b.year.trim()},null,'return=representation');return send(res,200,{item:rows?.[0]});
  }
  if(action==='deleteClass'){
   if(!/^[0-9a-f-]{36}$/i.test(String(b.id)))return send(res,400,{error:'Mã lớp không hợp lệ.'});
   await call(tbl('thdk_classes')+'?teacher_id=eq.'+eq(uid)+'&id=eq.'+eq(b.id),'DELETE');return send(res,200,{ok:true});
  }
  if(action==='saveQuestion'){
   const classes=await call(tbl('thdk_classes')+'?id=eq.'+eq(String(b.classId||''))+'&teacher_id=eq.'+eq(uid)+'&select=*','GET');
   const cls=classes?.[0];if(!cls)return send(res,403,{error:'Bạn không có quyền sử dụng lớp này.'});
   if(!good(b.lesson,100)||!good(b.question,600)||!Array.isArray(b.answers)||b.answers.length!==4||b.answers.some(x=>!good(x,200))||!Number.isInteger(b.correct)||b.correct<0||b.correct>3)return send(res,400,{error:'Nội dung câu hỏi hoặc đáp án không hợp lệ.'});
   const payload={teacher_id:uid,class_id:cls.id,grade:cls.grade,lesson:b.lesson.trim(),question:b.question.trim(),answers:b.answers.map(x=>x.trim()),correct:b.correct,enabled:b.enabled!==false};
   let item;
   if(b.id){if(!/^[0-9a-f-]{36}$/i.test(b.id))return send(res,400,{error:'Mã câu hỏi không hợp lệ.'});const rows=await call(tbl('thdk_questions')+'?id=eq.'+eq(b.id)+'&teacher_id=eq.'+eq(uid),'PATCH',payload,null,'return=representation');item=rows?.[0];if(!item)return send(res,404,{error:'Không tìm thấy câu hỏi thuộc tài khoản.'})}
   else{const rows=await call(tbl('thdk_questions'),'POST',payload,null,'return=representation');item=rows?.[0]}
   return send(res,200,{item});
  }
  if(action==='deleteQuestion'){
   if(!/^[0-9a-f-]{36}$/i.test(String(b.id)))return send(res,400,{error:'Mã câu hỏi không hợp lệ.'});
   await call(tbl('thdk_questions')+'?teacher_id=eq.'+eq(uid)+'&id=eq.'+eq(b.id),'DELETE');return send(res,200,{ok:true});
  }
  return send(res,400,{error:'Thao tác chưa hỗ trợ.'});
 }catch(e){console.error('teacher-space backend error',{status:e?.status||500,action});return send(res,503,{error:e?.status===404?'Không tìm thấy dữ liệu.':'Chưa kết nối được kho giáo viên. Kiểm tra bảng Supabase và cấu hình.'})}
};
