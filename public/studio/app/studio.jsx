const SDS=window.ColorteamDesignSystem_c88c1f;
const readFiles=(files)=>Promise.all([...files].map(f=>new Promise(r=>{const fr=new FileReader();fr.onload=()=>r(fr.result);fr.readAsDataURL(f);})));
function shrinkImage(dataUrl,max=1600){return new Promise(r=>{const i=new Image();i.onload=()=>{const s=Math.min(1,max/Math.max(i.width,i.height));const c=document.createElement('canvas');c.width=i.width*s;c.height=i.height*s;c.getContext('2d').drawImage(i,0,0,c.width,c.height);r(c.toDataURL('image/jpeg',.86));};i.onerror=()=>r(dataUrl);i.src=dataUrl;});}

function Studio({draft,onSend,toast}){
const [tplId,setTplId]=React.useState(draft?.tplId||'podcast');
const tpl=CT_TEMPLATES.find(x=>x.id===tplId);
const [fieldsBy,setFieldsBy]=React.useState(draft?{[draft.tplId]:draft.fields}:{});
const fields=fieldsBy[tplId]||ctDefaults(tpl);
const [photo,setPhoto]=React.useState(draft?.photo||null);
const [mood,setMood]=React.useState(draft?.moodboard||[]);
const [links,setLinks]=React.useState(draft?.links||[]);
const [linkIn,setLinkIn]=React.useState('');
const [sizesBy,setSizesBy]=React.useState(draft?{[draft.tplId]:draft.sizes}:{});
const sizes=sizesBy[tplId]||tpl.sizes;
const [theme,setTheme]=React.useState(draft?.theme??0);
const [active,setActive]=React.useState(sizes[0]);
const [page,setPage]=React.useState(0);
const [busy,setBusy]=React.useState('');
const [askOpen,setAskOpen]=React.useState(false);
const [note,setNote]=React.useState('');
const aSize=sizes.includes(active)?active:sizes[0];
const pc=ctPageCount(tpl,aSize,fields);const pg=Math.min(page,pc-1);
const ph=tpl.photo?(photo?{src:photo}:CT_SAMPLE_PHOTO):null;
const boxRef=React.useRef(null);const pbox=usePBox(boxRef);
const stageRef=React.useRef(null);
const setField=(k,v)=>setFieldsBy(s=>({...s,[tplId]:{...fields,[k]:v}}));
const toggleSize=k=>{const n=sizes.includes(k)?sizes.filter(x=>x!==k):[...sizes,k];if(!n.length)return;setSizesBy(s=>({...s,[tplId]:tpl.sizes.filter(x=>n.includes(x))}));};
const pickType=id=>{setTplId(id);setPage(0);const t=CT_TEMPLATES.find(x=>x.id===id);setActive((sizesBy[id]||t.sizes)[0]);};
const fname=(s,i)=>`colorteam-${tpl.id}-${s}-${CT_THEMES[theme].id}${i!=null?'-'+String(i+1).padStart(2,'0'):''}`;
async function snap(s,i){const n=stageRef.current.querySelector(`[data-ex="${s}-${i}"]`);const d=CT_SIZES[s];return htmlToImage.toPng(n.firstChild,{width:d.W,height:d.H,pixelRatio:1,cacheBust:true});}
async function dlPng(){setBusy('png');try{const url=await snap(aSize,pg);const a=document.createElement('a');a.href=url;a.download=fname(aSize,pc>1?pg:null)+'.png';a.click();toast('PNG downloaded');}catch(e){console.error(e);toast('Export failed — try again');}setBusy('');}
async function dlPdf(){setBusy('pdf');try{const {jsPDF}=window.jspdf;let doc=null;for(const s of sizes){const d=CT_SIZES[s];const n=ctPageCount(tpl,s,fields);for(let i=0;i<n;i++){const url=await snap(s,i);const o=d.W>d.H?'l':'p';if(!doc)doc=new jsPDF({unit:'px',format:[d.W,d.H],orientation:o,hotfixes:['px_scaling']});else doc.addPage([d.W,d.H],o);doc.addImage(url,'PNG',0,0,d.W,d.H);}}doc.save(`colorteam-${tpl.id}-${CT_THEMES[theme].id}.pdf`);toast('PDF downloaded');}catch(e){console.error(e);toast('Export failed — try again');}setBusy('');}
function send(){onSend({tplId,fields,photo,moodboard:mood,links,sizes,theme,note});setAskOpen(false);setNote('');}
const fieldEls=tpl.fields.map(x=><SDS.Input key={tplId+x.k} onDark label={x.label} hint={x.hint} multiline={x.type==='area'} rows={x.type==='area'?3:undefined} value={fields[x.k]} onChange={e=>setField(x.k,e.target.value)}/>);
return <div className="studio">
<aside className="types"><div className="sect-h">Asset type</div>
<div className="type-list">{CT_TEMPLATES.map(x=><button key={x.id} className={'type'+(x.id===tplId?' on':'')} onClick={()=>pickType(x.id)}><span className="type-ic"><SDS.Icon name={x.icon} size={18} color={x.id===tplId?'#0C2621':'#A8FC78'}/></span><span className="type-tx"><span className="type-n">{x.name}</span><span className="type-s">{x.sizes.map(s=>CT_SIZES[s].label).join(' · ')}</span></span></button>)}</div></aside>
<section className="brief">
<div className="sect-h">Brief</div>
<div className="stack">{fieldEls}<p className="hint">Wrap words in *asterisks* to highlight them in the accent colour.</p></div>
{tpl.photo&&<><div className="sect-h">Photo</div>
<label className="drop">{photo?<img src={photo} alt=""/>:<span><SDS.Icon name="image-plus" size={20} color="#A8FC78"/> Upload a photo <em>Using a sample photo until you add one</em></span>}<input type="file" accept="image/*" hidden onChange={async e=>{const [d]=await readFiles(e.target.files);if(d)setPhoto(await shrinkImage(d));e.target.value='';}}/></label>
{photo&&<button className="txt-btn" onClick={()=>setPhoto(null)}>Remove photo</button>}</>}
<div className="sect-h">Moodboard <span>Reference only · goes to the approver</span></div>
<div className="mood">{mood.map((m,i)=><div key={i} className="mood-i"><img src={m} alt=""/><button aria-label="Remove" onClick={()=>setMood(mood.filter((_,j)=>j!==i))}>×</button></div>)}
<label className="mood-add"><SDS.Icon name="plus" size={20} color="#A8FC78"/><input type="file" accept="image/*" multiple hidden onChange={async e=>{const ds=await readFiles(e.target.files);const sm=await Promise.all(ds.map(d=>shrinkImage(d,800)));setMood(m=>[...m,...sm].slice(0,8));e.target.value='';}}/></label></div>
<div className="sect-h">Reference links</div>
<form className="link-row" onSubmit={e=>{e.preventDefault();if(linkIn.trim()){setLinks([...links,linkIn.trim()]);setLinkIn('');}}}><SDS.Input onDark placeholder="Paste a link (Pinterest, Behance, Instagram…)" value={linkIn} onChange={e=>setLinkIn(e.target.value)}/><SDS.Button size="sm" variant="secondary" type="submit">Add</SDS.Button></form>
{links.length>0&&<ul className="links">{links.map((l,i)=><li key={i}><a href={l} target="_blank" rel="noreferrer">{l}</a><button onClick={()=>setLinks(links.filter((_,j)=>j!==i))}>×</button></li>)}</ul>}
<div className="sect-h">Platforms &amp; sizes</div>
<div className="chips">{tpl.sizes.map(s=><button key={s} className={'chip'+(sizes.includes(s)?' on':'')} onClick={()=>toggleSize(s)}>{CT_SIZES[s].label} <span>{CT_SIZES[s].W}×{CT_SIZES[s].H}</span></button>)}</div>
</section>
<section className="preview">
<div className="pv-top"><div className="tabs">{sizes.map(s=><button key={s} className={'tab'+(s===aSize?' on':'')} onClick={()=>{setActive(s);setPage(0);}}>{CT_SIZES[s].label}</button>)}</div>
{pc>1&&<div className="pager"><button disabled={pg===0} onClick={()=>setPage(pg-1)}>‹</button><span>{pg+1} / {pc}</span><button disabled={pg>=pc-1} onClick={()=>setPage(pg+1)}>›</button></div>}</div>
<div className="pv-box" ref={boxRef}><CtScaled W={CT_SIZES[aSize].W} H={CT_SIZES[aSize].H} bw={pbox.w} bh={pbox.h}><CtAsset tpl={tpl} size={aSize} fields={fields} theme={theme} photo={ph} page={pg}/></CtScaled></div>
<div className="sect-h">Variations</div>
<div className="vars">{CT_THEMES.map((t,i)=><button key={t.id} className={'var'+(i===theme?' on':'')} onClick={()=>setTheme(i)}><CtScaled W={CT_SIZES[aSize].W} H={CT_SIZES[aSize].H} bw={120} bh={110}><CtAsset tpl={tpl} size={aSize} fields={fields} theme={i} photo={ph} page={pg}/></CtScaled><span>{t.name}</span></button>)}</div>
<div className="actions">
<SDS.Button variant="secondary" size="md" iconLeft={<SDS.Icon name="download" size={16} color="currentColor"/>} disabled={!!busy} onClick={dlPng}>{busy==='png'?'Exporting…':'PNG'}</SDS.Button>
<SDS.Button variant="secondary" size="md" iconLeft={<SDS.Icon name="file-down" size={16} color="currentColor"/>} disabled={!!busy} onClick={dlPdf}>{busy==='pdf'?'Exporting…':'PDF · all sizes'}</SDS.Button>
<SDS.Button variant="primary" size="md" iconRight={<SDS.Icon name="arrow-up-right" size={16} color="currentColor"/>} onClick={()=>setAskOpen(true)}>Send for approval</SDS.Button></div>
</section>
<div ref={stageRef} className="stage" aria-hidden="true">{sizes.map(s=>Array.from({length:ctPageCount(tpl,s,fields)},(_,i)=><div key={s+i} data-ex={`${s}-${i}`}><CtAsset tpl={tpl} size={s} fields={fields} theme={theme} photo={ph} page={i}/></div>))}</div>
<SDS.Dialog open={askOpen} onClose={()=>setAskOpen(false)} title="Send for approval" width={520} actions={<><SDS.Button variant="ghost" onClick={()=>setAskOpen(false)}>Cancel</SDS.Button><SDS.Button variant="primary" onClick={send}>Send to {CTB.approverName}</SDS.Button></>}>
<div className="ask"><CtScaled W={CT_SIZES[aSize].W} H={CT_SIZES[aSize].H} bw={150} bh={190}><CtAsset tpl={tpl} size={aSize} fields={fields} theme={theme} photo={ph} page={0}/></CtScaled>
<dl><dt>Approver</dt><dd>{CTB.approverName} · Creative Director</dd><dt>Asset</dt><dd>{tpl.name} · {CT_THEMES[theme].name}</dd><dt>Sizes</dt><dd>{sizes.map(s=>CT_SIZES[s].label).join(', ')}</dd><dt>Moodboard</dt><dd>{mood.length} image{mood.length===1?'':'s'} · {links.length} link{links.length===1?'':'s'}</dd></dl></div>
<SDS.Input onDark label={"Note for "+CTB.approverName} multiline rows={3} placeholder="Anything she should know?" value={note} onChange={e=>setNote(e.target.value)}/>
</SDS.Dialog>
</div>;}
function usePBox(ref){const [b,setB]=React.useState({w:600,h:560});React.useLayoutEffect(()=>{const el=ref.current;if(!el)return;const m=()=>{const r=el.getBoundingClientRect();if(r.width&&r.height)setB(o=>o.w===r.width&&o.h===r.height?o:{w:r.width,h:r.height});};m();const ro=new ResizeObserver(m);ro.observe(el);window.addEventListener('resize',m);const t=setTimeout(m,100);return()=>{ro.disconnect();window.removeEventListener('resize',m);clearTimeout(t);};},[]);return b;}
Object.assign(window,{Studio});
