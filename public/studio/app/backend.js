(function(){
const C=window.CT_STUDIO_CONFIG||{};
const LS_USER='ctbs_user',LS_REQ='ctbs_requests_v1';
const SB=C.supabase&&C.supabase.url&&C.supabase.anonKey&&window.supabase;
const cloud=!!SB;
let api;
if(cloud){
  const sb=window.supabase.createClient(C.supabase.url,C.supabase.anonKey);
  let role=null;
  const fromRow=r=>({...r.data,id:r.id,uid:r.uid,email:r.email,status:r.status,comment:r.comment||'',at:r.at});
  async function resolve(session){if(!session)return {user:null};const u=session.user;
    const {data,error}=await sb.from('members').select('role,name').eq('email',u.email.toLowerCase()).maybeSingle();
    if(error||!data){await sb.auth.signOut();return {user:null,err:'This account has not been invited to Brand Studio. Ask '+(C.approverName||'Subomi')+' to add '+u.email+'.'};}
    role=data.role;const m=u.user_metadata||{};
    return {user:{uid:u.id,email:u.email,name:data.name||m.full_name||m.name||u.email.split('@')[0],photo:m.avatar_url||m.picture||null}};}
  api={mode:'cloud',isApprover:()=>role==='approver',
    onAuth(cb){let last;const go=async s=>{const k=s?s.user.id:'none';if(k===last)return;last=k;const r=await resolve(s);cb(r.user,r.err);};
      sb.auth.getSession().then(({data})=>go(data.session));
      const {data:{subscription}}=sb.auth.onAuthStateChange((_e,s)=>go(s));return()=>subscription.unsubscribe();},
    async signInGoogle(){const {error}=await sb.auth.signInWithOAuth({provider:'google',options:{redirectTo:location.origin+location.pathname,queryParams:{prompt:'select_account'}}});if(error)throw error;},
    async signInEmail(e,pw){const {error}=await sb.auth.signInWithPassword({email:e,password:pw});if(error)throw error;},
    async sendLink(e){const {error}=await sb.auth.signInWithOtp({email:e.trim().toLowerCase(),options:{emailRedirectTo:location.origin+location.pathname}});if(error)throw error;},
    async signUpEmail(e,pw){const {data,error}=await sb.auth.signUp({email:e,password:pw,options:{emailRedirectTo:location.origin+location.pathname}});if(error)throw error;if(!data.session)throw new Error('Check your inbox to confirm your email, then sign in.');},
    async resetPassword(e){const {error}=await sb.auth.resetPasswordForEmail(e,{redirectTo:location.origin+location.pathname});if(error)throw error;},
    signOut(){role=null;return sb.auth.signOut();},
    subscribe(user,cb){const load=async()=>{const {data,error}=await sb.from('requests').select('*').order('at',{ascending:false});if(error){console.error(error);cb([]);return;}cb(data.map(fromRow));};
      load();const ch=sb.channel('requests-'+user.uid).on('postgres_changes',{event:'*',schema:'public',table:'requests'},load).subscribe();return()=>{sb.removeChannel(ch);};},
    async add(r){let {id,uid,email,status,comment,at,...data}=r;const ok=JSON.stringify(data).length<=950000;if(!ok)data={...data,moodboard:[]};
      const {error}=await sb.from('requests').insert({data,email,status:'pending',comment:''});if(error)throw error;return ok;},
    async update(id,patch){const row={};if('status' in patch)row.status=patch.status;if('comment' in patch)row.comment=patch.comment;if(patch.decidedAt)row.decided_at=patch.decidedAt;const {error}=await sb.from('requests').update(row).eq('id',id);if(error)throw error;}};
}else{
  const SEED=[
  {id:'r1',tplId:'podcast',fields:{episode:'06',guest:'Heather Winkle',role:'VP of Digital Experience, Delta Air Lines',label:'New episode'},photo:'assets/imagery/portrait-cutout-woman-desaturated.png',moodboard:[],links:[],sizes:['post','story'],theme:0,note:'Guest announcement for Monday.',status:'approved',comment:'Looks great. Ship it.',by:'Ada Okafor',uid:'demo',at:'2026-10-26T10:12:00Z'},
  {id:'r2',tplId:'quote',fields:{quote:'Brand trust compounds. *Show up* every week, even when nobody is clapping.',name:'Subomi Archibong',role:'Founder & CEO, Colorteam'},photo:null,moodboard:[],links:['https://www.pinterest.com/'],sizes:['post'],theme:1,note:'',status:'changes',comment:'Shorten the quote so it sits on three lines.',by:'Ada Okafor',uid:'demo',at:'2026-10-27T15:40:00Z'}];
  let list;try{list=JSON.parse(localStorage.getItem(LS_REQ))||SEED;}catch(e){list=SEED;}
  const mk=e=>({uid:'demo',email:e,name:e.split('@')[0].replace(/[._]/g,' ').replace(/\b\w/g,c=>c.toUpperCase()),photo:null});
  const subs=new Set(),authSubs=new Set();
  const save=()=>{let ok=true;try{localStorage.setItem(LS_REQ,JSON.stringify(list));}catch(e){ok=false;try{localStorage.setItem(LS_REQ,JSON.stringify(list.map(r=>({...r,photo:r.photo&&r.photo.startsWith('data:')?null:r.photo,moodboard:[]}))));}catch(_){}}subs.forEach(f=>f(list.slice()));return ok;};
  const getU=()=>{try{const u=JSON.parse(localStorage.getItem(LS_USER));return u?(u.uid?u:mk(u.email||'designer@gmail.com')):null;}catch(e){return null;}};
  const setU=u=>{u?localStorage.setItem(LS_USER,JSON.stringify(u)):localStorage.removeItem(LS_USER);authSubs.forEach(f=>f(u));};
    api={mode:'local',isApprover:()=>true,
    onAuth(cb){authSubs.add(cb);cb(getU());return()=>authSubs.delete(cb);},
    async signInGoogle(){setU(mk('designer@gmail.com'));},
    async signInEmail(e){setU(mk(e||'designer@gmail.com'));},
    async sendLink(e){setU(mk(e||'designer@gmail.com'));},
    async signUpEmail(e){setU(mk(e||'designer@gmail.com'));},
    async resetPassword(){},
    async signOut(){setU(null);},
    subscribe(user,cb){subs.add(cb);cb(list.slice());return()=>subs.delete(cb);},
    async add(r){list=[{...r,id:'r'+Date.now()},...list];return save();},
    async update(id,patch){list=list.map(r=>r.id===id?{...r,...patch}:r);save();}};
}
api.approverName=C.approverName||'Subomi';api.google=!!C.googleSignIn;
window.CTB=api;
})();
