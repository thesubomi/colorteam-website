const PDS=window.ColorteamDesignSystem_c88c1f;
const STATUS={pending:{l:'Pending approval',tone:'yellow'},approved:{l:'Approved',tone:'correct'},changes:{l:'Changes requested',tone:'incorrect'}};
const fmtDate=s=>new Date(s).toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'});
const authMsg=e=>{const c=(e&&e.code)||'';if(c.includes('popup-closed'))return '';if(c.includes('wrong-password')||c.includes('invalid-credential')||c.includes('user-not-found'))return 'Email or password is incorrect.';if(c.includes('email-already'))return 'An account with this email already exists. Sign in instead.';if(c.includes('weak-password'))return 'Use at least 6 characters for the password.';return (e&&e.message)||'Something went wrong. Try again.';};
function Login({err}){const [email,setEmail]=React.useState('');const [msg,setMsg]=React.useState(err||'');const [sent,setSent]=React.useState(false);const [busy,setBusy]=React.useState(false);
React.useEffect(()=>{if(err)setMsg(err);},[err]);
const run=async fn=>{setBusy(true);setMsg('');try{await fn();}catch(e){setMsg(authMsg(e));}setBusy(false);};
return <div className="login"><div className="login-l"><PDS.Logo variant="full" tone="light" height={40} assetBase="assets/logo"/><h1 className="login-h">Brand <em>&amp;</em> Asset Studio</h1><p>Pick an asset, share your brief and moodboard, and download on-brand files for every platform.</p><div className="login-meta"><span>colorteam</span><span>Internal tool</span><span>2026</span></div></div>
{sent?<div className="login-r"><h2>Check your inbox</h2><p style={{margin:0,color:'#D5E9A8'}}>We sent a sign-in link to <b style={{color:'#fff'}}>{email}</b>. Open it on this device to get in.</p><button type="button" className="txt-btn" onClick={()=>setSent(false)}>Use a different email</button></div>:
<form className="login-r" onSubmit={e=>{e.preventDefault();if(!email.trim())return;run(async()=>{await CTB.sendLink(email);if(CTB.mode==='cloud')setSent(true);});}}><h2>Sign in</h2>
{CTB.google&&<><button type="button" className="g-btn" disabled={busy} onClick={()=>run(()=>CTB.signInGoogle())}><svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true"><path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9 3.5l6.7-6.7C35.6 2.4 30.2 0 24 0 14.6 0 6.6 5.4 2.6 13.3l7.8 6C12.3 13.6 17.7 9.5 24 9.5z"/><path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.7c-.6 3-2.3 5.5-4.8 7.2l7.5 5.8c4.4-4 7.1-10 7.1-17.5z"/><path fill="#FBBC05" d="M10.4 28.7c-.5-1.4-.8-3-.8-4.7s.3-3.2.8-4.7l-7.8-6C.9 16.6 0 20.2 0 24s.9 7.4 2.6 10.7l7.8-6z"/><path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.5-5.8c-2.1 1.4-4.9 2.3-8.4 2.3-6.3 0-11.7-4.1-13.6-9.8l-7.8 6C6.6 42.6 14.6 48 24 48z"/></svg>Continue with Google</button><div className="or"><span>or</span></div></>}
<PDS.Input onDark label="Email" type="email" placeholder="you@gmail.com" value={email} onChange={e=>setEmail(e.target.value)} required/>
<PDS.Button variant="primary" size="lg" type="submit" disabled={busy}>{busy?'Sending…':'Email me a sign-in link'}</PDS.Button>
{msg&&<p className="err">{msg}</p>}
<p className="hint">Any Gmail or work email works, as long as it has been invited.{CTB.mode==='local'&&' Demo mode: any email signs you in.'}</p></form>}</div>;}

function Requests({list,role,onOpen,onDecide}){const [f,setF]=React.useState('all');const [cmt,setCmt]=React.useState({});
const rows=list.filter(r=>f==='all'||r.status===f);
return <div className="page"><div className="page-h"><h1>{role==='approver'?'Approvals':'My requests'}</h1><div className="tabs">{[['all','All'],['pending','Pending'],['approved','Approved'],['changes','Changes requested']].map(([k,l])=><button key={k} className={'tab'+(f===k?' on':'')} onClick={()=>setF(k)}>{l} <span className="cnt">{k==='all'?list.length:list.filter(r=>r.status===k).length}</span></button>)}</div></div>
{rows.length===0&&<p className="empty">Nothing here yet.</p>}
<div className="req-list">{rows.map(r=>{const tpl=CT_TEMPLATES.find(x=>x.id===r.tplId);const s=r.sizes[0];const ph=tpl.photo?(r.photo?{src:r.photo}:CT_SAMPLE_PHOTO):null;const title=Object.values(r.fields)[tpl.id==='podcast'?1:0];
return <div key={r.id} className="req"><CtScaled W={CT_SIZES[s].W} H={CT_SIZES[s].H} bw={120} bh={140}><CtAsset tpl={tpl} size={s} fields={r.fields} theme={r.theme} photo={ph}/></CtScaled>
<div className="req-b"><div className="req-t">{String(title).replace(/\*/g,'')}</div><div className="req-m">{tpl.name} · {CT_THEMES[r.theme].name} · {r.sizes.map(x=>CT_SIZES[x].label).join(', ')}</div><div className="req-m">{r.by} · {fmtDate(r.at)}{r.moodboard?.length?` · ${r.moodboard.length} moodboard images`:''}{r.links?.length?` · ${r.links.length} links`:''}</div>
{r.note&&<p className="req-note"><b>Note:</b> {r.note}</p>}{r.comment&&<p className="req-note"><b>{CTB.approverName}:</b> {r.comment}</p>}
{role==='approver'&&r.status==='pending'&&<div className="req-act"><PDS.Input onDark placeholder="Comment (optional)" value={cmt[r.id]||''} onChange={e=>setCmt({...cmt,[r.id]:e.target.value})}/><PDS.Button size="sm" variant="primary" onClick={()=>onDecide(r.id,'approved',cmt[r.id])}>Approve</PDS.Button><PDS.Button size="sm" variant="secondary" onClick={()=>onDecide(r.id,'changes',cmt[r.id]||'Please revise.')}>Request changes</PDS.Button></div>}</div>
<div className="req-r"><PDS.Badge tone={STATUS[r.status].tone}>{STATUS[r.status].l}</PDS.Badge><PDS.Button size="sm" variant="ghost" onClick={()=>onOpen(r)}>{r.status==='approved'?'Open & download':'Open in studio'}</PDS.Button></div></div>;})}</div></div>;}

function Guide(){const sw=[['Lime Green','#A8FC78','#0C2621'],['Forest','#203C34','#fff'],['Deep Forest','#17483F','#fff'],['Black','#0A0A0A','#fff'],['Green','#5DBF2B','#0C2621'],['Vibrant Leaf','#83CF55','#0C2621'],['Soft Yellow-Green','#D5E9A8','#0C2621'],['Yellow','#F5E371','#0C2621'],['Sage Grey','#929A92','#0C2621'],['Paper','#F3F4EE','#0C2621']];
return <div className="page guide"><div className="page-h"><h1>Brand guide</h1><p className="hint">Quick reference for briefs. Every template already follows these rules.</p></div>
<h2 className="g-h">Colour</h2><div className="sw">{sw.map(([n,h,i])=><div key={h} className="sw-i" style={{background:h,color:i}}><b>{n}</b><span>{h}</span></div>)}</div>
<h2 className="g-h">Type</h2><div className="g-type"><div><div className="g-big">Systems Over Speed</div><p>Inter Bold · tracking −3.5% · line-height 0.92 for display</p></div><div><div className="g-big">Layout <em>&amp;</em> Composition</div><p>Newsreader for the serif ampersand inside headlines</p></div></div>
<h2 className="g-h">Logos</h2><div className="g-logos"><div className="g-l" style={{background:'#0C2621'}}><PDS.Logo variant="full" tone="light" height={36} assetBase="assets/logo"/></div><div className="g-l" style={{background:'#A8FC78'}}><PDS.Logo variant="wordmark" tone="forest" height={30} assetBase="assets/logo"/></div><div className="g-l" style={{background:'#0A0A0A'}}><PDS.Logo variant="podcast" tone="lime" height={56} podcastLabel assetBase="assets/logo"/></div></div>
<h2 className="g-h">Rules</h2><div className="g-rules"><div><h3>Do</h3><ul><li>Use forest or black grounds with lime as the accent.</li><li>Highlight one or two key words in a headline.</li><li>Name people with their role in small uppercase.</li><li>Keep text inside each platform's safe zone.</li></ul></div><div><h3>Don't</h3><ul><li>Use off-palette colours or unapproved typefaces.</li><li>Stretch, recolour or add effects to the logo.</li><li>Add drop shadows to cards or type.</li><li>Use emoji in headlines.</li></ul></div></div></div>;}

function Toast({msg}){return msg?<div className="toast">{msg}</div>:null;}

function App(){
const [user,setUser]=React.useState(undefined);const [authErr,setAuthErr]=React.useState('');
const [route,setRoute]=React.useState('new');const [role,setRole]=React.useState('designer');
const [list,setList]=React.useState([]);const [draft,setDraft]=React.useState(null);const [dk,setDk]=React.useState(0);
const [msg,setMsg]=React.useState('');const tm=React.useRef();const toast=m=>{setMsg(m);clearTimeout(tm.current);tm.current=setTimeout(()=>setMsg(''),2600);};
React.useEffect(()=>CTB.onAuth((u,err)=>{setUser(u||null);setAuthErr(err||'');}),[]);
React.useEffect(()=>{if(!user)return;return CTB.subscribe(user,setList);},[user?(user.uid||user.email):null]);
const canApprove=user&&CTB.isApprover(user.email);
React.useEffect(()=>{if(user)setRole(canApprove&&CTB.mode==='cloud'?'approver':'designer');},[user?(user.uid||user.email):null]);
if(user===undefined)return <div className="boot"><PDS.Logo variant="mark" height={48} assetBase="assets/logo"/></div>;
if(!user)return <Login err={authErr}/>;
const shown=role==='approver'?list:list.filter(r=>CTB.mode==='local'||r.uid===user.uid);
const pend=role==='approver'?list.filter(r=>r.status==='pending').length:0;
const send=async d=>{try{const ok=await CTB.add({...d,status:'pending',comment:'',by:user.name,email:user.email,uid:user.uid,at:new Date().toISOString()});toast(ok?`Sent to ${CTB.approverName} for approval`:'Sent. Moodboard images were too large to attach.');}catch(e){console.error(e);toast('Could not send. Check your connection.');}};
const decide=async(id,status,comment)=>{try{await CTB.update(id,{status,comment:comment||'',decidedAt:new Date().toISOString()});toast(status==='approved'?'Approved':'Changes requested');}catch(e){toast('Could not update. Try again.');}};
const open=r=>{setDraft(r);setDk(k=>k+1);setRoute('new');};
return <div className="app"><header className="hdr"><div className="hdr-l"><PDS.Logo variant="full" tone="light" height={26} assetBase="assets/logo"/><span className="hdr-p">Brand Studio</span></div>
<nav className="nav">{[['new','New request'],['requests',role==='approver'?'Approvals':'My requests'],['guide','Brand guide']].map(([k,l])=><button key={k} className={'nav-i'+(route===k?' on':'')} onClick={()=>{if(k==='new'&&route!=='new'){setDraft(null);setDk(x=>x+1);}setRoute(k);}}>{l}{k==='requests'&&pend>0&&<span className="cnt">{pend}</span>}</button>)}</nav>
<div className="hdr-r">{canApprove&&<div className="seg">{[['designer','Designer'],['approver','Approver']].map(([k,l])=><button key={k} className={role===k?'on':''} onClick={()=>setRole(k)}>{l}</button>)}</div>}{user.photo?<img className="av" src={user.photo} alt="" referrerPolicy="no-referrer"/>:<span className="av">{user.name[0].toUpperCase()}</span>}<button className="txt-btn" onClick={()=>CTB.signOut()}>Sign out</button></div></header>
<main>{route==='new'&&<Studio key={dk} draft={draft} onSend={send} toast={toast}/>}{route==='requests'&&<Requests list={shown} role={role} onOpen={open} onDecide={decide}/>}{route==='guide'&&<Guide/>}</main><Toast msg={msg}/></div>;}
ReactDOM.createRoot(document.getElementById('root')).render(<App/>);
