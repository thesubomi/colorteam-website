const CT_THEMES=[
{id:'forest',name:'Forest',bg:'#0C2621',ink:'#FFFFFF',acc:'#A8FC78',sub:'#D5E9A8',lab:'#A8FC78',line:'rgba(168,252,120,.8)',hair:'rgba(255,255,255,.22)',panel:'#17483F',panelInk:'#FFFFFF',logo:'assets/logo/wordmark-white.png',pod:'assets/logo/podcast-mark-lime.png',chipBg:'#A8FC78',chipInk:'#0C2621'},
{id:'black',name:'Black',bg:'#0A0A0A',ink:'#FFFFFF',acc:'#A8FC78',sub:'#D5E9A8',lab:'#A8FC78',line:'rgba(255,255,255,.8)',hair:'rgba(255,255,255,.22)',panel:'radial-gradient(70% 60% at 55% 40%,#E6F5A8 0%,#2BE36B 62%,#10C24E 100%)',panelInk:'#0B1F1A',logo:'assets/logo/wordmark-white.png',pod:'assets/logo/podcast-mark-lime.png',chipBg:'#A8FC78',chipInk:'#0A0A0A'},
{id:'lime',name:'Lime',bg:'#A8FC78',ink:'#0C2621',acc:'#17483F',sub:'#17483F',lab:'#0C2621',line:'rgba(12,38,33,.7)',hair:'rgba(12,38,33,.3)',panel:'#17483F',panelInk:'#FFFFFF',logo:'assets/logo/wordmark-forest.png',pod:'assets/logo/podcast-mark-inverse.png',chipBg:'#0C2621',chipInk:'#A8FC78',serifAcc:true}];
const CT_SIZES={post:{label:'Post 4:5',W:1080,H:1350},square:{label:'Square 1:1',W:1080,H:1080},story:{label:'Story 9:16',W:1080,H:1920},yt:{label:'Thumbnail 16:9',W:1280,H:720},wide:{label:'Landscape 16:9',W:1600,H:900},li:{label:'Personal banner',W:1584,H:396},lic:{label:'Company cover',W:1128,H:191}};
const ctLines=s=>String(s||'').split('\n').map(x=>x.trim()).filter(Boolean);
const ctFit=(base,text,chars)=>{const n=String(text||'').replace(/\*/g,'').length||1;return base*Math.min(1,Math.sqrt(chars/n));};
const ctD=(size,t,x)=>({margin:0,fontWeight:700,fontSize:size,lineHeight:.94,letterSpacing:'-0.035em',color:t.ink,textWrap:'balance',...x});
function ctRich(text,t){return String(text||'').split(/(\*[^*]+\*)/).map((s,i)=>s.length>2&&s[0]==='*'&&s[s.length-1]==='*'?<span key={i} style={t.serifAcc?{color:t.acc,fontFamily:'var(--font-serif),Newsreader,serif',fontStyle:'italic',fontWeight:400,letterSpacing:'-0.02em'}:{color:t.acc}}>{s.slice(1,-1)}</span>:<React.Fragment key={i}>{s}</React.Fragment>);}
function CtPhoto({p,t,style,pos}){return <div style={{position:'absolute',overflow:'hidden',background:t.panel,...style}}>{p&&p.src&&<img src={p.src} alt="" style={p.cutout?{position:'absolute',bottom:0,left:'50%',transform:'translateX(-50%)',height:'96%'}:{width:'100%',height:'100%',objectFit:'cover',objectPosition:pos||'50% 25%',display:'block'}}/>}</div>;}
function CtPill({t,u,children,style}){return <div style={{border:`${1.5*u}px solid ${t.line}`,borderRadius:999,padding:`${8*u}px ${22*u}px`,fontSize:24*u,color:t.ink,whiteSpace:'nowrap',...style}}>{children}</div>;}
function CtChip({t,u,children,size=24}){return <span style={{alignSelf:'flex-start',display:'inline-block',background:t.chipBg,color:t.chipInk,borderRadius:2*u,padding:`${8*u}px ${16*u}px`,fontSize:size*u,fontWeight:600,lineHeight:1.2}}>{children}</span>;}
function CtTop({t,u,pod,top=64}){return <><div style={{position:'absolute',left:72*u,top:top*u,display:'flex',alignItems:'center',gap:18*u}}>{pod?<><img src={t.pod} alt="" style={{height:84*u}}/><span style={{fontWeight:600,fontSize:28*u,lineHeight:1.02,color:t.ink}}>The<br/>Colorteam<br/>Podcast</span></>:<img src={t.logo} alt="colorteam" style={{height:44*u}}/>}</div><div style={{position:'absolute',right:72*u,top:(top+(pod?22:0))*u}}><CtPill t={t} u={u}>colorteam.io</CtPill></div></>;}
const ctLab=(u,t,x)=>({textTransform:'uppercase',letterSpacing:'.08em',fontSize:22*u,color:t.lab,...x});
const ctSvgCache={};
function CtSvgIcon({name,size,color}){const [svg,setSvg]=React.useState(ctSvgCache[name]||'');React.useEffect(()=>{if(ctSvgCache[name]){setSvg(ctSvgCache[name]);return;}fetch(`https://unpkg.com/lucide-static@0.460.0/icons/${name}.svg`).then(r=>r.text()).then(s=>{s=s.replace(/width="24"/,'width="100%"').replace(/height="24"/,'height="100%"');ctSvgCache[name]=s;setSvg(s);}).catch(()=>{});},[name]);return <span style={{display:'block',width:size,height:size,color}} dangerouslySetInnerHTML={{__html:svg}}></span>;}
const CT_ICON_MAP=[[/work|portfolio|case/,'briefcase'],[/service/,'layers'],[/podcast|listen/,'mic'],[/team|people|about/,'users'],[/review|testimon/,'star'],[/contact|mail/,'mail'],[/blog|insight|read/,'pen-line'],[/brand/,'sparkles'],[/design/,'pen-tool'],[/web|site/,'globe'],[/market/,'megaphone'],[/hir|career|job/,'user-plus'],[/event|webinar/,'calendar'],[/tip|learn/,'lightbulb']];
const ctIconFor=l=>{const s=l.toLowerCase();const m=CT_ICON_MAP.find(([r])=>r.test(s));return m?m[1]:'heart';};

const CT_TEMPLATES=[
{id:'podcast',name:'Podcast guest announcement',icon:'mic',sizes:['post','story'],photo:true,fields:[{k:'episode',label:'Episode number',def:'06'},{k:'guest',label:'Guest name',def:'Heather Winkle'},{k:'role',label:'Guest role',def:'VP of Digital Experience, Delta Air Lines'},{k:'label',label:'Label',def:'New episode'}],
render(f,{W,H,t,p}){const u=W/1080,tall=H>1500,top=tall?300:216,ph=tall?1060:780;return [<>
<CtTop t={t} u={u} pod top={tall?96:64}/>
<CtPhoto p={p} t={t} style={{left:72*u,right:72*u,top:top*u,height:ph*u}}/>
<div style={{position:'absolute',left:52*u,top:(top+ph-262)*u,color:'#A8FC78',fontWeight:800,fontSize:300*u,letterSpacing:'-0.055em',lineHeight:.8}}>EP{f.episode}</div>
<div style={{position:'absolute',left:72*u,right:72*u,bottom:(tall?200:72)*u,display:'flex',justifyContent:'space-between',alignItems:'flex-end',gap:40*u,flexWrap:tall?'wrap':'nowrap'}}>
<div style={{display:'flex',flexDirection:'column',gap:20*u}}><div style={ctLab(u,t)}>{f.label}</div><h1 style={ctD(ctFit(tall?132:104,f.guest,14)*u,t)}>{ctRich(f.guest,t)}</h1></div>
<p style={{margin:0,textTransform:'uppercase',letterSpacing:'.06em',fontSize:24*u,lineHeight:1.4,color:t.sub,textAlign:tall?'left':'right',maxWidth:440*u}}>{f.role}</p></div></>];}},
{id:'quote',name:'Quote card',icon:'quote',sizes:['post','square'],photo:true,fields:[{k:'quote',label:'Quote',type:'area',def:'Brand trust compounds. *Show up* every week.'},{k:'name',label:'Name',def:'Subomi Archibong'},{k:'role',label:'Role',def:'Founder & CEO, Colorteam'}],
render(f,{W,H,t,p}){const u=W/1080,sq=H<1200;return [<>
<CtTop t={t} u={u}/>
<div style={{position:'absolute',left:64*u,top:(sq?130:170)*u,fontFamily:'var(--font-serif),Newsreader,serif',fontSize:(sq?260:320)*u,lineHeight:1,color:t.acc}}>“</div>
<p style={{...ctD(ctFit(sq?68:80,f.quote,90)*u,t,{lineHeight:1.04,fontWeight:600}),position:'absolute',left:72*u,right:72*u,top:(sq?360:440)*u}}>{ctRich(f.quote,t)}</p>
<div style={{position:'absolute',left:72*u,right:72*u,bottom:72*u,display:'flex',alignItems:'center',gap:24*u}}>
{p&&p.src&&<CtPhoto p={p} t={t} style={{position:'relative',width:120*u,height:120*u,borderRadius:'50%',flex:'none'}}/>}
<div><div style={{fontWeight:700,fontSize:28*u,textTransform:'uppercase',letterSpacing:'.04em',color:t.ink}}>{f.name}</div><div style={{fontSize:24*u,color:t.sub,marginTop:6*u}}>{f.role}</div></div></div></>];}},
{id:'carousel',name:'Carousel',icon:'gallery-horizontal',sizes:['post','square'],fields:[{k:'kicker',label:'Series label',def:'Marketing tips'},{k:'title',label:'Cover title',def:'*Systems* Over Speed'},{k:'points',label:'Slides (one per line, "Title — detail")',type:'area',def:'Plan the month — Set three priorities and cut the rest.\nBatch the work — Write, design and schedule in one block.\nReview weekly — Keep what moved the needle.'},{k:'cta',label:'Closing slide',def:'Follow @yourcolorteam for more'}],
render(f,{W,H,t}){const u=W/1080,sq=H<1200,pts=ctLines(f.points),N=pts.length+2;
const foot=i=><div style={{position:'absolute',left:72*u,right:72*u,bottom:64*u,display:'flex',justifyContent:'space-between',fontSize:24*u,color:t.sub}}><span>{String(i+1).padStart(2,'0')} / {String(N).padStart(2,'0')}</span><span>{i<N-1?'swipe →':'colorteam.io'}</span></div>;
const cover=<><CtTop t={t} u={u}/><div style={{position:'absolute',left:72*u,right:72*u,bottom:170*u,display:'flex',flexDirection:'column',gap:32*u}}>{f.kicker&&<CtChip t={t} u={u}>{f.kicker}</CtChip>}<h1 style={ctD(ctFit(sq?130:150,f.title,20)*u,t)}>{ctRich(f.title,t)}</h1></div>{foot(0)}</>;
const body=pts.map((s,i)=>{const [h,...r]=s.split(/\s[—–-]\s/);return <><img src={t.logo} alt="" style={{position:'absolute',left:72*u,top:64*u,height:36*u}}/><div style={{position:'absolute',left:60*u,top:(sq?150:200)*u,fontWeight:800,fontSize:(sq?260:320)*u,lineHeight:.8,letterSpacing:'-0.055em',color:t.acc}}>{String(i+1).padStart(2,'0')}</div><div style={{position:'absolute',left:72*u,right:120*u,top:(sq?480:600)*u,display:'flex',flexDirection:'column',gap:28*u}}><h2 style={ctD(ctFit(88,h,36)*u,t)}>{ctRich(h,t)}</h2>{r.length>0&&<p style={{margin:0,fontSize:34*u,lineHeight:1.35,color:t.sub,textWrap:'pretty'}}>{r.join(' — ')}</p>}</div>{foot(i+1)}</>;});
const end=<><div style={{position:'absolute',left:72*u,right:72*u,top:0,bottom:0,display:'flex',flexDirection:'column',justifyContent:'center',gap:44*u}}><div style={{width:150*u,height:150*u,borderRadius:'24%',background:t.acc}}></div><h2 style={ctD(ctFit(96,f.cta,30)*u,t)}>{ctRich(f.cta,t)}</h2><CtPill t={t} u={u} style={{alignSelf:'flex-start'}}>colorteam.io</CtPill></div>{foot(N-1)}</>;
return [cover,...body,end];}},
{id:'reel',name:'Reel cover',icon:'clapperboard',sizes:['story'],photo:true,fields:[{k:'series',label:'Series label',def:'Behind The Design Series'},{k:'title',label:'Title',def:'How We Built a *Brand* in 10 Days'}],
render(f,{W,H,t,p}){const u=W/1080;return [<>
<CtPhoto p={p} t={t} style={{left:0,right:0,top:0,height:1340*u}}/>
<div style={{position:'absolute',left:0,right:0,top:880*u,height:462*u,background:`linear-gradient(to bottom,${t.bg}00,${t.bg})`}}></div>
<CtTop t={t} u={u} top={96}/>
<div style={{position:'absolute',left:72*u,right:72*u,top:1220*u,display:'flex',flexDirection:'column',gap:32*u}}><CtChip t={t} u={u} size={28}>{f.series}</CtChip><h1 style={ctD(ctFit(132,f.title,24)*u,t)}>{ctRich(f.title,t)}</h1></div></>];}},
{id:'story',name:'Story',icon:'smartphone',sizes:['story'],photo:true,fields:[{k:'headline',label:'Headline',def:'New Work: *Lagos* Food Week'},{k:'body',label:'Body',type:'area',def:'Identity, campaign and site for the city\'s biggest food festival.'},{k:'cta',label:'Call to action',def:'Link in bio'}],
render(f,{W,H,t,p}){const u=W/1080;return [<>
<CtTop t={t} u={u} top={110}/>
<div style={{position:'absolute',left:72*u,right:72*u,top:300*u,display:'flex',flexDirection:'column',gap:32*u}}><h1 style={ctD(ctFit(120,f.headline,24)*u,t)}>{ctRich(f.headline,t)}</h1><p style={{margin:0,fontSize:34*u,lineHeight:1.35,color:t.sub,maxWidth:820*u,textWrap:'pretty'}}>{f.body}</p></div>
<CtPhoto p={p} t={t} style={{left:72*u,right:72*u,top:880*u,height:560*u,borderRadius:20*u}}/>
<div style={{position:'absolute',left:0,right:0,top:1490*u,display:'flex',justifyContent:'center'}}><span style={{background:t.chipBg,color:t.chipInk,borderRadius:999,padding:`${18*u}px ${44*u}px`,fontSize:34*u,fontWeight:600}}>{f.cta} ↑</span></div></>];}},
{id:'team',name:'Team spotlight',icon:'user-round',sizes:['post'],photo:true,fields:[{k:'headline',label:'Headline',type:'area',def:'Meet the\ngenius Behind\nThe magic'},{k:'name',label:'Name',def:'Funmibi Samuel'},{k:'role',label:'Role',def:'Marketing Lead, Colorteam'}],
render(f,{W,H,t,p}){const u=W/1080,ink=t.panelInk;return [<>
<CtPill t={t} u={u} style={{position:'absolute',right:64*u,top:56*u}}>colorteam.io</CtPill>
<img src={t.logo} alt="colorteam" style={{position:'absolute',left:'50%',top:130*u,transform:'translateX(-50%)',height:150*u}}/>
<CtPhoto p={p} t={t} style={{left:96*u,right:96*u,top:330*u,bottom:96*u}}/>
<div style={{position:'absolute',left:140*u,top:374*u,color:ink,fontWeight:600,fontSize:40*u,lineHeight:1.1,whiteSpace:'pre-line'}}>{f.headline}</div>
<div style={{position:'absolute',right:140*u,top:374*u,color:ink,fontWeight:600,fontSize:30*u,lineHeight:1.1,textAlign:'right',textTransform:'uppercase',maxWidth:300*u}}>{f.name}</div>
<div style={{position:'absolute',left:140*u,bottom:136*u,color:ink,fontSize:24*u,lineHeight:1.25,maxWidth:420*u}}>{f.role}</div>
<div style={{position:'absolute',right:140*u,bottom:136*u,color:ink,fontSize:34*u}}>swipe</div></>];}},
{id:'youtube',name:'YouTube thumbnail',icon:'youtube',sizes:['yt'],photo:true,fields:[{k:'label',label:'Label',def:'EP06'},{k:'title',label:'Title',def:'Designing for *50 Million* Flyers'}],
render(f,{W,H,t,p}){const u=H/720;return [<>
<CtPhoto p={p} t={t} style={{right:0,top:0,bottom:0,width:W*0.46}}/>
<div style={{position:'absolute',left:W*0.54-140*u,top:0,bottom:0,width:140*u,background:`linear-gradient(to right,${t.bg},${t.bg}00)`}}></div>
<div style={{position:'absolute',left:56*u,top:56*u,width:W*0.56,display:'flex',flexDirection:'column',gap:28*u}}>{f.label&&<CtChip t={t} u={u} size={40}>{f.label}</CtChip>}<h1 style={ctD(ctFit(104,f.title,26)*u,t)}>{ctRich(f.title,t)}</h1></div>
<img src={t.logo} alt="" style={{position:'absolute',left:56*u,bottom:52*u,height:34*u}}/></>];}},
{id:'linkedin',name:'LinkedIn banner',icon:'linkedin',sizes:['li','lic'],fields:[{k:'headline',label:'Headline',def:'Branding, Design, *Marketing* & Web'},{k:'sub',label:'Sub-line',def:'360° creative agency · Warsaw & Lagos · colorteam.io'}],
render(f,{W,H,t,size}){const u=H/396,co=size==='lic';return [<>
<div style={{position:'absolute',right:-90*u,top:'50%',width:560*u,height:560*u,marginTop:-280*u,borderRadius:'24%',background:t.acc}}></div>
<div style={{position:'absolute',right:250*u,top:'50%',width:200*u,height:200*u,marginTop:-100*u,borderRadius:'24%',border:`${2*u}px solid ${t.acc}`}}></div>
<div style={{position:'absolute',left:co?72*u:W*0.33,right:560*u,top:0,bottom:0,display:'flex',flexDirection:'column',justifyContent:'center',gap:20*u}}><img src={t.logo} alt="" style={{height:30*u,alignSelf:'flex-start'}}/><h1 style={ctD(ctFit(68,f.headline,30)*u,t)}>{ctRich(f.headline,t)}</h1><p style={{margin:0,fontSize:24*u,color:t.sub}}>{f.sub}</p></div></>];}},
{id:'highlights',name:'Highlight covers',icon:'circle-dot',sizes:['story'],fields:[{k:'labels',label:'Highlights (comma separated)',def:'Work, Services, Podcast, Team, Reviews',hint:'Icons are matched to each label.'}],
render(f,{W,H,t}){const u=W/1080;const ls=String(f.labels||'').split(',').map(s=>s.trim()).filter(Boolean);return ls.map(l=><><div style={{position:'absolute',left:'50%',top:'50%',width:560*u,height:560*u,marginLeft:-280*u,marginTop:-280*u,borderRadius:'50%',background:t.chipBg,display:'grid',placeItems:'center'}}><CtSvgIcon name={ctIconFor(l)} size={240*u} color={t.chipInk}/></div></>);}},
{id:'event',name:'Event / webinar',icon:'calendar',sizes:['post','wide'],photo:true,fields:[{k:'format',label:'Format',def:'Live webinar'},{k:'title',label:'Title',def:'Brand Trust in the *Age of AI*'},{k:'date',label:'Date',def:'Thu, 12 November'},{k:'time',label:'Time',def:'4 PM WAT · 4 PM CET'},{k:'speaker',label:'Speaker',def:'Subomi Archibong'},{k:'speakerRole',label:'Speaker role',def:'Founder & CEO, Colorteam'}],
render(f,{W,H,t,p,size}){const wide=size==='wide';const u=wide?H/900:W/1080;
const meta=<div style={{display:'grid',gridTemplateColumns:'1fr 1fr',borderTop:`1px solid ${t.hair}`}}>{[['Date',f.date],['Time',f.time]].map(([k,v])=><div key={k} style={{padding:`${22*u}px 0`,display:'flex',flexDirection:'column',gap:8*u}}><span style={ctLab(u,t,{fontSize:20*u})}>{k}</span><span style={{fontSize:34*u,fontWeight:600,color:t.ink}}>{v}</span></div>)}</div>;
const spk=(ph)=><div style={{display:'flex',alignItems:'center',gap:24*u}}>{ph&&<CtPhoto p={p} t={t} style={{position:'relative',width:130*u,height:130*u,borderRadius:'50%',flex:'none'}}/>}<div><div style={{fontWeight:700,fontSize:28*u,textTransform:'uppercase',letterSpacing:'.04em',color:t.ink}}>{f.speaker}</div><div style={{fontSize:24*u,color:t.sub,marginTop:6*u}}>{f.speakerRole}</div></div></div>;
if(wide)return [<><CtTop t={t} u={u}/><div style={{position:'absolute',left:72*u,top:200*u,width:W*0.5,display:'flex',flexDirection:'column',gap:32*u}}><CtChip t={t} u={u} size={26}>{f.format}</CtChip><h1 style={ctD(ctFit(108,f.title,28)*u,t)}>{ctRich(f.title,t)}</h1></div><div style={{position:'absolute',left:72*u,width:W*0.5,bottom:72*u,display:'flex',flexDirection:'column',gap:32*u}}>{spk(false)}{meta}</div><CtPhoto p={p} t={t} style={{right:72*u,top:170*u,bottom:72*u,width:W*0.34,borderRadius:20*u}}/></>];
return [<><CtTop t={t} u={u}/><div style={{position:'absolute',left:72*u,right:72*u,top:220*u,display:'flex',flexDirection:'column',gap:32*u}}><CtChip t={t} u={u} size={26}>{f.format}</CtChip><h1 style={ctD(ctFit(124,f.title,26)*u,t)}>{ctRich(f.title,t)}</h1></div><div style={{position:'absolute',left:72*u,right:72*u,bottom:72*u,display:'flex',flexDirection:'column',gap:40*u}}>{spk(true)}{meta}</div></>];}},
{id:'hiring',name:'Hiring post',icon:'user-plus',sizes:['post','square'],fields:[{k:'headline',label:'Headline',def:'We\'re *Hiring*'},{k:'role',label:'Role',def:'Senior Brand Designer'},{k:'details',label:'Details (one per line)',type:'area',def:'Remote · Warsaw or Lagos\nFull-time\n5+ years in brand identity'},{k:'cta',label:'How to apply',def:'Apply at colorteam.io/careers'}],
render(f,{W,H,t}){const u=W/1080,sq=H<1200;return [<>
<CtTop t={t} u={u}/>
{!t.serifAcc&&<img src="assets/graphics/sparkle-lime.png" alt="" style={{position:'absolute',right:80*u,top:(sq?170:230)*u,width:150*u}}/>}
<h1 style={{...ctD((sq?190:220)*u,t),position:'absolute',left:64*u,right:72*u,top:(sq?170:230)*u}}>{ctRich(f.headline,t)}</h1>
<div style={{position:'absolute',left:72*u,right:72*u,bottom:72*u,display:'flex',flexDirection:'column',gap:28*u}}>
<span style={ctLab(u,t)}>Open role</span><h2 style={ctD(ctFit(84,f.role,22)*u,t)}>{f.role}</h2>
<div style={{display:'flex',flexDirection:'column'}}>{ctLines(f.details).map((d,i)=><div key={i} style={{borderTop:`1px solid ${t.hair}`,padding:`${14*u}px 0`,fontSize:28*u,color:t.sub}}>{d}</div>)}</div>
<div style={{fontSize:30*u,fontWeight:600,color:t.ink}}>{f.cta} →</div></div></>];}},
{id:'case',name:'Case study',icon:'briefcase',sizes:['post'],photo:true,fields:[{k:'client',label:'Client',def:'Netflix'},{k:'headline',label:'Headline',def:'How We Built a Content Syndication Engine for *Netflix*'},{k:'stat',label:'Result figure',def:'3.2×'},{k:'statLabel',label:'Result label',def:'Increase in organic reach in 90 days'}],
render(f,{W,H,t,p}){const u=W/1080;return [<>
<CtTop t={t} u={u}/>
<CtPhoto p={p} t={t} style={{left:72*u,right:72*u,top:170*u,height:700*u}}/>
<div style={{position:'absolute',left:104*u,top:202*u}}><CtChip t={t} u={u} size={26}>Case study · {f.client}</CtChip></div>
<h1 style={{...ctD(ctFit(84,f.headline,48)*u,t),position:'absolute',left:72*u,right:72*u,top:930*u}}>{ctRich(f.headline,t)}</h1>
<div style={{position:'absolute',left:72*u,right:72*u,bottom:64*u,display:'flex',justifyContent:'space-between',fontSize:24*u,color:t.sub}}><span>01 / 02</span><span>swipe →</span></div></>,
<><CtTop t={t} u={u}/>
<div style={{position:'absolute',left:72*u,right:72*u,top:300*u,display:'flex',flexDirection:'column',gap:36*u}}><span style={ctLab(u,t)}>Result</span><div style={{fontWeight:800,fontSize:ctFit(380,f.stat,4)*u,lineHeight:.85,letterSpacing:'-0.055em',color:t.acc}}>{f.stat}</div><h2 style={ctD(ctFit(72,f.statLabel,40)*u,t)}>{f.statLabel}</h2></div>
<div style={{position:'absolute',left:72*u,right:72*u,bottom:64*u,display:'flex',justifyContent:'space-between',fontSize:24*u,color:t.sub}}><span>02 / 02</span><span>Full case study at colorteam.io</span></div></>];}}];

function CtAsset({tpl,size,fields,theme,photo,page=0}){const s=CT_SIZES[size],t=CT_THEMES[theme]||CT_THEMES[0];const pages=tpl.render(fields,{W:s.W,H:s.H,t,p:photo,size});const pg=pages[Math.min(page,pages.length-1)]||null;return <div style={{position:'relative',width:s.W,height:s.H,background:t.bg,color:t.ink,overflow:'hidden',fontFamily:'var(--font-sans),Inter,sans-serif'}}>{pg}</div>;}
const ctPageCount=(tpl,size,fields)=>{const s=CT_SIZES[size];return tpl.render(fields,{W:s.W,H:s.H,t:CT_THEMES[0],p:null,size}).length;};
function CtScaled({W,H,bw,bh,children,style}){const s=Math.min(bw/W,bh/H);return <div style={{width:W*s,height:H*s,position:'relative',overflow:'hidden',flex:'none',...style}}><div style={{width:W,height:H,transform:`scale(${s})`,transformOrigin:'0 0'}}>{children}</div></div>;}
const ctDefaults=tpl=>Object.fromEntries(tpl.fields.map(x=>[x.k,x.def]));
const CT_SAMPLE_PHOTO={src:'assets/imagery/portrait-cutout-woman-desaturated.png',cutout:true,sample:true};
Object.assign(window,{CT_THEMES,CT_SIZES,CT_TEMPLATES,CtAsset,CtScaled,ctPageCount,ctDefaults,CT_SAMPLE_PHOTO});
