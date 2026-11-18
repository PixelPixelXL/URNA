const MESH = "https://servicodados.ibge.gov.br/api/v3/malhas/estados/33?formato=application/vnd.geo+json&qualidade=minima&intrarregiao=municipio";
const NAMES = "https://servicodados.ibge.gov.br/api/v1/localidades/estados/33/municipios";
const $ = id => document.getElementById(id);
const esc = s => String(s).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
function hash(s){let h=2166136261;for(const c of String(s)){h^=c.charCodeAt(0);h=Math.imul(h,16777619);}return h>>>0;}
function allocate(total,weights){const sum=weights.reduce((a,b)=>a+b,0);const q=weights.map(w=>sum?total*w/sum:total/weights.length);const v=q.map(Math.floor);let rest=total-v.reduce((a,b)=>a+b,0);q.map((x,i)=>({i,f:x-v[i]})).sort((a,b)=>b.f-a.f).slice(0,rest).forEach(x=>v[x.i]++);return v;}
function rings(g){return g.type==="Polygon"?[g.coordinates]:g.type==="MultiPolygon"?g.coordinates:[];}
export async function renderRioMunicipalMap({candidates,parties,votes,round}){
 const map=$("rioMunicipalMap"),legend=$("rioMunicipalMapLegend"),detail=$("rioMunicipalDetail");
 if(!map||!legend||!detail)return;
 $("rioMunicipalMapRoundLabel").textContent="MAPA · "+round+"º TURNO";
 map.innerHTML='<p class="empty">Carregando a malha municipal do IBGE…</p>';
 try{
  const [a,b]=await Promise.all([fetch(MESH),fetch(NAMES)]);
  if(!a.ok||!b.ok)throw new Error("Falha ao consultar o IBGE.");
  const [geo,names]=await Promise.all([a.json(),b.json()]);
  const features=(geo.features||[]).filter(f=>f.geometry&&f.properties?.codarea);
  if(features.length!==92)throw new Error("A malha retornou "+features.length+" municípios; eram esperados 92.");
  const nameByCode=new Map(names.map(x=>[String(x.id),x.nome]));
  const results=new Map();
  for(const f of features){
   const code=String(f.properties.codarea),name=nameByCode.get(code)||("Município "+code);
   const weights=candidates.map(c=>Math.max(.01,(Number(votes[c.id])||0)*(.62+(hash(code+c.id)%7600)/10000)));
   const total=1800+hash(code+"turnout")%68000,allocated=allocate(total,weights);
   const rows=candidates.map((c,i)=>{const p=parties.find(x=>x.id===c.partyId);return {name:c.name,party:p?.acronym||"IND",color:p?.color||"#718096",votes:allocated[i],percent:allocated[i]/total*100};}).sort((x,y)=>y.votes-x.votes);
   results.set(code,{code,name,total,rows});
  }
  const pts=[];features.forEach(f=>rings(f.geometry).forEach(poly=>(poly[0]||[]).forEach(p=>pts.push(p))));
  const lat=-19.5,proj=([x,y])=>[x*Math.cos(lat*Math.PI/180),y],pp=pts.map(proj);
  const minX=Math.min(...pp.map(p=>p[0])),maxX=Math.max(...pp.map(p=>p[0])),minY=Math.min(...pp.map(p=>p[1])),maxY=Math.max(...pp.map(p=>p[1]));
  const W=900,H=760,pad=12,scale=Math.min((W-2*pad)/(maxX-minX),(H-2*pad)/(maxY-minY));
  const ox=(W-(maxX-minX)*scale)/2,oy=(H-(maxY-minY)*scale)/2;
  const xy=p=>{const [x,y]=proj(p);return [ox+(x-minX)*scale,H-oy-(y-minY)*scale];};
  const ringPath=r=>r.map((p,i)=>{const [x,y]=xy(p);return (i?"L":"M")+x.toFixed(1)+" "+y.toFixed(1);}).join(" ")+" Z";
  const path=g=>rings(g).map(poly=>poly.map(ringPath).join(" ")).join(" ");
  map.innerHTML='<svg viewBox="0 0 '+W+' '+H+'" role="group" aria-label="Rio de Janeiro dividido em 92 municípios">'+features.map(f=>{
   const code=String(f.properties.codarea),r=results.get(code),w=r.rows[0];
   return '<path class="municipality-shape" d="'+path(f.geometry)+'" fill="'+w.color+'" data-municipality="'+code+'" tabindex="0" role="button" aria-label="'+esc(r.name)+': '+esc(w.name)+' venceu"><title>'+esc(r.name)+' — '+esc(w.name)+'</title></path>';
  }).join("")+'</svg>';
  const winners=[...new Map([...results.values()].map(r=>[r.rows[0].name,r.rows[0]])).values()];
  legend.innerHTML=winners.map(w=>'<span class="map-legend-item"><i style="background:'+w.color+'"></i>'+esc(w.name)+' ('+esc(w.party)+')</span>').join("");
  const show=code=>{const r=results.get(code);if(!r)return;detail.innerHTML='<h3>'+esc(r.name)+' · RJ</h3><p class="state-detail-total">'+r.total.toLocaleString("pt-BR")+' votos simulados</p>'+r.rows.map(x=>'<div class="state-result-row"><span><i style="background:'+x.color+'"></i>'+esc(x.name)+' · '+esc(x.party)+'</span><strong>'+x.votes.toLocaleString("pt-BR")+' · '+x.percent.toFixed(1).replace(".",",")+'%</strong></div>').join("");map.querySelectorAll("[data-municipality]").forEach(p=>p.classList.toggle("is-selected",p.dataset.municipality===code));};
  map.querySelectorAll(".municipality-shape").forEach(p=>{p.addEventListener("click",()=>show(p.dataset.municipality));p.addEventListener("keydown",e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();show(p.dataset.municipality);}});});
  detail.innerHTML='<p class="empty">Mapa pronto. Clique em qualquer município para consultar os votos simulados.</p>';
 }catch(e){map.innerHTML='<p class="empty">Não foi possível montar o mapa: '+esc(e.message)+'</p>';legend.innerHTML='<span class="empty">Mapa indisponível; confira a conexão e atualize.</span>';}
}
