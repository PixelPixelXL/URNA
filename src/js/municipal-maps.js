const STATES = {
  AC: { code: 12, name: "Acre", count: 22 },
  AL: { code: 27, name: "Alagoas", count: 102 },
  AP: { code: 16, name: "Amapá", count: 16 },
  AM: { code: 13, name: "Amazonas", count: 62 },
  BA: { code: 29, name: "Bahia", count: 417 },
  CE: { code: 23, name: "Ceará", count: 184 },
  DF: { code: 53, name: "Distrito Federal", count: 1 },
  ES: { code: 32, name: "Espírito Santo", count: 78 },
  GO: { code: 52, name: "Goiás", count: 246 },
  MA: { code: 21, name: "Maranhão", count: 217 },
  MT: { code: 51, name: "Mato Grosso", count: 142 },
  MS: { code: 50, name: "Mato Grosso do Sul", count: 79 },
  MG: { code: 31, name: "Minas Gerais", count: 853 },
  PA: { code: 15, name: "Pará", count: 144 },
  PB: { code: 25, name: "Paraíba", count: 223 },
  PR: { code: 41, name: "Paraná", count: 399 },
  PE: { code: 26, name: "Pernambuco", count: 185 },
  PI: { code: 22, name: "Piauí", count: 224 },
  RJ: { code: 33, name: "Rio de Janeiro", count: 92 },
  RN: { code: 24, name: "Rio Grande do Norte", count: 167 },
  RS: { code: 43, name: "Rio Grande do Sul", count: 497 },
  RO: { code: 11, name: "Rondônia", count: 52 },
  RR: { code: 14, name: "Roraima", count: 15 },
  SC: { code: 42, name: "Santa Catarina", count: 295 },
  SP: { code: 35, name: "São Paulo", count: 645 },
  SE: { code: 28, name: "Sergipe", count: 75 },
  TO: { code: 17, name: "Tocantins", count: 139 }
};

const $ = id => document.getElementById(id);

const esc = value =>
  String(value).replace(/[&<>"']/g, character => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[character]);

const hash = value => {
  let result = 2166136261;

  for (const character of String(value)) {
    result ^= character.charCodeAt(0);
    result = Math.imul(result, 16777619);
  }

  return result >>> 0;
};

function allocate(total, weights) {
  if (weights.length === 0) {
    return [];
  }

  const sum = weights.reduce((accumulator, weight) => accumulator + weight, 0);
  const quotas = weights.map(weight =>
    sum ? (total * weight) / sum : total / weights.length
  );
  const allocated = quotas.map(Math.floor);
  const remainder = total - allocated.reduce((accumulator, value) => accumulator + value, 0);

  quotas
    .map((quota, index) => ({
      index,
      fraction: quota - allocated[index]
    }))
    .sort((a, b) => b.fraction - a.fraction)
    .slice(0, remainder)
    .forEach(item => {
      allocated[item.index]++;
    });

  return allocated;
}

const rings = geometry => {
  if (geometry.type === "Polygon") {
    return [geometry.coordinates];
  }

  if (geometry.type === "MultiPolygon") {
    return geometry.coordinates;
  }

  return [];
};

const normalize = value =>
  String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();

export async function renderMunicipalMap({
  place,
  candidates,
  parties,
  votes,
  round
}) {
  const uf = normalize(place);
  const entry = Object.entries(STATES).find(([key, state]) =>
    normalize(key) === uf || normalize(state.name) === uf
  );

  const state = entry?.[1];
  const map = $("municipalMapCanvas");
  const legend = $("municipalMapLegend");
  const detail = $("municipalMapDetail");
  const summary = $("municipalMapSummary");

  if (!state || !map || !legend || !detail || !summary) {
    return;
  }

  if (!candidates?.length) {
    map.innerHTML = '<p class="empty">Não há candidatos para montar o mapa.</p>';
    legend.innerHTML = "";
    detail.innerHTML = "";
    summary.innerHTML = "";
    return;
  }

  $("municipalMapTitle").textContent =
    state.name + " · " + state.count + " municípios";
  $("municipalMapRoundLabel").textContent = "MAPA · " + round + "º TURNO";
  map.innerHTML = '<p class="empty">Carregando a malha municipal do IBGE…</p>';

  try {
    const base = "https://servicodados.ibge.gov.br/api/";
    const [geometryResponse, namesResponse] = await Promise.all([
      fetch(
        base +
          "v3/malhas/estados/" +
          state.code +
          "?formato=application/vnd.geo+json&qualidade=minima&intrarregiao=municipio"
      ),
      fetch(base + "v1/localidades/estados/" + state.code + "/municipios")
    ]);

    if (!geometryResponse.ok || !namesResponse.ok) {
      throw new Error("Falha ao consultar o IBGE.");
    }

    const [geo, names] = await Promise.all([
      geometryResponse.json(),
      namesResponse.json()
    ]);

    const features = (geo.features || []).filter(
      feature => feature.geometry && feature.properties?.codarea
    );

    if (features.length !== state.count) {
      throw new Error(
        "A malha retornou " +
          features.length +
          " municípios; eram esperados " +
          state.count +
          "."
      );
    }

    const nameByCode = new Map(
      names.map(item => [String(item.id), item.nome])
    );
    const results = new Map();

    for (const feature of features) {
      const code = String(feature.properties.codarea);
      const name = nameByCode.get(code) || "Município " + code;

      const weights = candidates.map(candidate =>
        Math.max(
          0.01,
          (Number(votes[candidate.id]) || 0) *
            (0.62 + (hash(code + candidate.id) % 7600) / 10000)
        )
      );

      const total = 1800 + (hash(code + "turnout") % 68000);
      const allocated = allocate(total, weights);

      const rows = candidates
        .map((candidate, index) => {
          const party = parties.find(item => item.id === candidate.partyId);

          return {
            name: candidate.name,
            party: party?.acronym || "IND",
            color: party?.color || "#718096",
            votes: allocated[index],
            percent: (allocated[index] / total) * 100
          };
        })
        .sort((a, b) => b.votes - a.votes);

      results.set(code, { code, name, total, rows });
    }

    const points = [];

    features.forEach(feature => {
      rings(feature.geometry).forEach(polygon => {
        (polygon[0] || []).forEach(point => points.push(point));
      });
    });

    if (points.length === 0) {
      throw new Error("A malha do IBGE não contém coordenadas válidas.");
    }

    const latitude =
      state.code === 31
        ? -19.5
        : state.code === 33
          ? -22
          : state.code === 35
            ? -22.5
            : -12;

    const project = ([longitude, lat]) => [
      longitude * Math.cos((latitude * Math.PI) / 180),
      lat
    ];

    // Calcula os limites em um loop para evitar estouro de argumentos
    // em estados com muitos vértices na malha municipal.
    let minX = Infinity;
    let maxX = -Infinity;
    let minY = Infinity;
    let maxY = -Infinity;

    points.forEach(point => {
      const [x, y] = project(point);

      minX = Math.min(minX, x);
      maxX = Math.max(maxX, x);
      minY = Math.min(minY, y);
      maxY = Math.max(maxY, y);
    });

    const width = 900;
    const height = 760;
    const padding = 12;
    const scale = Math.min(
      (width - 2 * padding) / (maxX - minX),
      (height - 2 * padding) / (maxY - minY)
    );
    const offsetX = (width - (maxX - minX) * scale) / 2;
    const offsetY = (height - (maxY - minY) * scale) / 2;

    const toSvgCoordinates = point => {
      const [x, y] = project(point);

      return [
        offsetX + (x - minX) * scale,
        height - offsetY - (y - minY) * scale
      ];
    };

    const ringPath = ring =>
      ring
        .map((point, index) => {
          const [x, y] = toSvgCoordinates(point);
          return (index ? "L" : "M") + x.toFixed(1) + " " + y.toFixed(1);
        })
        .join(" ") + " Z";

    const geometryPath = geometry =>
      rings(geometry)
        .map(polygon => polygon.map(ringPath).join(" "))
        .join(" ");

    map.innerHTML =
      '<svg viewBox="0 0 ' +
      width +
      " " +
      height +
      '" role="group" aria-label="' +
      esc(state.name) +
      " dividido em " +
      state.count +
      ' municípios">' +
      features
        .map(feature => {
          const code = String(feature.properties.codarea);
          const result = results.get(code);
          const winner = result.rows[0];

          return (
            '<path class="municipality-shape" d="' +
            geometryPath(feature.geometry) +
            '" fill="' +
            winner.color +
            '" data-municipality="' +
            code +
            '" tabindex="0" role="button" aria-label="' +
            esc(result.name) +
            ": " +
            esc(winner.name) +
            ' venceu"><title>' +
            esc(result.name) +
            " — " +
            esc(winner.name) +
            "</title></path>"
          );
        })
        .join("") +
      "</svg>";

    const winners = [
      ...new Map(
        [...results.values()].map(result => [
          result.rows[0].name,
          result.rows[0]
        ])
      ).values()
    ];

    legend.innerHTML = winners
      .map(
        winner =>
          '<span class="map-legend-item"><i style="background:' +
          winner.color +
          '"></i>' +
          esc(winner.name) +
          " (" +
          esc(winner.party) +
          ")</span>"
      )
      .join("");

    const showMunicipality = code => {
      const result = results.get(code);

      if (!result) {
        return;
      }

      detail.innerHTML =
        "<h3>" +
        esc(result.name) +
        " · " +
        entry[0] +
        '</h3><p class="state-detail-total">' +
        result.total.toLocaleString("pt-BR") +
        " votos simulados</p>" +
        result.rows
          .map(
            row =>
              '<div class="state-result-row"><span><i style="background:' +
              row.color +
              '"></i>' +
              esc(row.name) +
              " · " +
              esc(row.party) +
              "</span><strong>" +
              row.votes.toLocaleString("pt-BR") +
              " · " +
              row.percent.toFixed(1).replace(".", ",") +
              "%</strong></div>"
          )
          .join("");

      map.querySelectorAll("[data-municipality]").forEach(path => {
        path.classList.toggle(
          "is-selected",
          path.dataset.municipality === code
        );
      });
    };

    map.querySelectorAll(".municipality-shape").forEach(path => {
      path.addEventListener("click", () => {
        showMunicipality(path.dataset.municipality);
      });

      path.addEventListener("keydown", event => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          showMunicipality(path.dataset.municipality);
        }
      });
    });

    const statewide = new Map();
    let statewideVotes = 0;

    results.forEach(result => {
      statewideVotes += result.total;
      result.rows.forEach((row, index) => {
        const key = row.name + "|" + row.party;
        const aggregate = statewide.get(key) || {
          name: row.name,
          party: row.party,
          color: row.color,
          votes: 0,
          municipalitiesWon: 0
        };

        aggregate.votes += row.votes;
        if (index === 0) aggregate.municipalitiesWon++;
        statewide.set(key, aggregate);
      });
    });

    const statewideRows = [...statewide.values()]
      .map(row => ({
        ...row,
        percent: statewideVotes ? row.votes / statewideVotes * 100 : 0
      }))
      .sort((a, b) => b.votes - a.votes);

    summary.innerHTML =
      '<h3>Resumo estadual · ' + esc(state.name) + '</h3>' +
      '<p class="state-detail-total">' +
      statewideVotes.toLocaleString("pt-BR") +
      ' votos simulados somados nos ' + state.count + ' municípios</p>' +
      '<div class="municipal-summary-grid">' +
      '<div class="municipal-summary-card"><strong>' +
      esc(statewideRows[0].name) +
      '</strong><span>Mais votado no total estadual</span></div>' +
      '<div class="municipal-summary-card"><strong>' +
      statewideRows[0].municipalitiesWon +
      ' de ' + state.count +
      '</strong><span>Municípios vencidos pelo líder</span></div>' +
      '</div>' +
      '<h4 class="municipal-summary-heading">Votação estadual simulada</h4>' +
      statewideRows.map(row =>
        '<div class="state-result-row"><span><i style="background:' +
        row.color + '"></i>' + esc(row.name) + ' · ' + esc(row.party) +
        '</span><strong>' + row.votes.toLocaleString("pt-BR") + ' · ' +
        row.percent.toFixed(1).replace(".", ",") + '% · ' +
        row.municipalitiesWon + ' municípios</strong></div>'
      ).join("") +
      '<p class="municipal-summary-note">Os totais acima agregam os votos fictícios gerados para cada município. Clique no mapa para abrir o detalhamento local.</p>';
  } catch (error) {
    map.innerHTML =
      '<p class="empty">Não foi possível montar o mapa: ' +
      esc(error.message) +
      "</p>";
    legend.innerHTML =
      '<span class="empty">Mapa indisponível; confira a conexão e atualize.</span>';
  }
}


export async function renderPresidentialMunicipalMap({ candidates, parties, votes, round }) {
  const map=$("municipalMapCanvas"), legend=$("municipalMapLegend"), detail=$("municipalMapDetail"), summary=$("municipalMapSummary");
  if(!map||!legend||!detail||!summary||!candidates?.length)return;
  $("municipalMapTitle").textContent="Brasil · mapa presidencial por município";
  $("municipalMapRoundLabel").textContent="MAPA · "+round+"º TURNO";
  map.innerHTML='<p class="empty">Carregando os municípios brasileiros pelo IBGE…</p>';
  legend.innerHTML=""; detail.innerHTML=""; summary.innerHTML="";
  try {
    const groups=await Promise.all(Object.entries(STATES).map(async ([uf,state])=>{
      const base="https://servicodados.ibge.gov.br/api/";
      const [gr,nr]=await Promise.all([
        fetch(base+"v3/malhas/estados/"+state.code+"?formato=application/vnd.geo+json&qualidade=minima&intrarregiao=municipio"),
        fetch(base+"v1/localidades/estados/"+state.code+"/municipios")
      ]);
      if(!gr.ok||!nr.ok)throw Error("Falha ao consultar a malha do IBGE ("+uf+").");
      const [geo,names]=await Promise.all([gr.json(),nr.json()]);
      const nameMap=new Map(names.map(x=>[String(x.id),x.nome]));
      const geometryByCode=new Map((geo.features||[])
        .filter(f=>f.geometry&&f.properties?.codarea)
        .map(f=>[String(f.properties.codarea),f.geometry]));
      const missing=names.filter(item=>!geometryByCode.has(String(item.id)));
      if(missing.length){
        const recovered=await Promise.all(missing.map(async item=>{
          const response=await fetch(base+"v3/malhas/municipios/"+item.id+"?formato=application/vnd.geo+json&qualidade=minima");
          if(!response.ok)return null;
          const payload=await response.json();
          const feature=payload?.type==="Feature" ? payload :
            payload?.type==="FeatureCollection" ? payload.features?.[0] : null;
          return feature?.geometry ? [String(item.id),feature.geometry] : null;
        }));
        recovered.filter(Boolean).forEach(([code,geometry])=>geometryByCode.set(code,geometry));
      }
      const absent=names.filter(item=>!geometryByCode.has(String(item.id)));
      const features=names.filter(item=>geometryByCode.has(String(item.id)));
      absent.forEach(item=>console.warn("URNA: geometria municipal indisponível no IBGE:",uf,item.nome,item.id));
      return features.map(item=>({uf,code:String(item.id),name:item.nome,geometry:geometryByCode.get(String(item.id))}));
    }));
    const features=groups.flat(), results=new Map();
    for(const f of features){
      const weights=candidates.map(c=>Math.max(.01,(Number(votes[c.id])||0)*(.62+(hash(f.code+c.id)%7600)/10000)));
      const total=1800+(hash(f.code+"turnout")%68000), allocated=allocate(total,weights);
      const rows=candidates.map((c,i)=>{const p=parties.find(x=>x.id===c.partyId);return {id:c.id,name:c.name,party:p?.acronym||"IND",color:p?.color||"#718096",votes:allocated[i],percent:allocated[i]/total*100};}).sort((a,b)=>b.votes-a.votes);
      results.set(f.code,{...f,total,rows});
    }
    const points=[];
    features.forEach(f=>rings(f.geometry).forEach(poly=>(poly[0]||[]).forEach(p=>points.push(p))));
    if(!points.length)throw Error("Malha sem coordenadas.");
    const project=([lon,lat])=>[lon*Math.cos(-14*Math.PI/180),lat];
    let minX=Infinity,maxX=-Infinity,minY=Infinity,maxY=-Infinity;
    points.forEach(p=>{const [x,y]=project(p);minX=Math.min(minX,x);maxX=Math.max(maxX,x);minY=Math.min(minY,y);maxY=Math.max(maxY,y);});
    const W=1000,H=1050,pad=14,scale=Math.min((W-2*pad)/(maxX-minX),(H-2*pad)/(maxY-minY));
    const ox=(W-(maxX-minX)*scale)/2,oy=(H-(maxY-minY)*scale)/2;
    const xy=p=>{const [x,y]=project(p);return [ox+(x-minX)*scale,H-oy-(y-minY)*scale];};
    const ringPath=r=>r.map((p,i)=>{const [x,y]=xy(p);return (i?"L":"M")+x.toFixed(1)+" "+y.toFixed(1);}).join(" ")+" Z";
    const geomPath=g=>rings(g).map(poly=>poly.map(ringPath).join(" ")).join(" ");
    map.innerHTML='<svg viewBox="0 0 '+W+" "+H+'" role="group" aria-label="Brasil dividido em municípios">'+features.map(f=>{
      const r=results.get(f.code),w=r.rows[0];
      return '<path class="municipality-shape" d="'+geomPath(f.geometry)+'" fill="'+w.color+'" data-municipality="'+f.code+'" tabindex="0" role="button" aria-label="'+esc(r.name)+" ("+f.uf+"): "+esc(w.name)+' venceu"><title>'+esc(r.name)+" ("+f.uf+") — "+esc(w.name)+"</title></path>";
    }).join("")+"</svg>";
    const winners=[...new Map([...results.values()].map(r=>[r.rows[0].id,r.rows[0]])).values()];
    legend.innerHTML=winners.map(w=>'<span class="map-legend-item"><i style="background:'+w.color+'"></i>'+esc(w.name)+" ("+esc(w.party)+")</span>").join("");
    const show=code=>{
      const r=results.get(code);if(!r)return;
      detail.innerHTML="<h3>"+esc(r.name)+" · "+r.uf+"</h3><p class=\"state-detail-total\">"+r.total.toLocaleString("pt-BR")+" votos simulados</p>"+r.rows.map(x=>'<div class="state-result-row"><span><i style="background:'+x.color+'"></i>'+esc(x.name)+" · "+esc(x.party)+"</span><strong>"+x.votes.toLocaleString("pt-BR")+" · "+x.percent.toFixed(1).replace(".",",")+"%</strong></div>").join("");
      map.querySelectorAll("[data-municipality]").forEach(p=>p.classList.toggle("is-selected",p.dataset.municipality===code));
    };
    map.querySelectorAll(".municipality-shape").forEach(p=>{
      p.addEventListener("click",()=>show(p.dataset.municipality));
      p.addEventListener("keydown",e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();show(p.dataset.municipality);}});
    });
    const totals=new Map();let allVotes=0;
    results.forEach(r=>{allVotes+=r.total;r.rows.forEach((x,i)=>{const a=totals.get(x.id)||{...x,votes:0,municipalitiesWon:0};a.votes+=x.votes;if(i===0)a.municipalitiesWon++;totals.set(x.id,a);});});
    const rows=[...totals.values()].map(x=>({...x,percent:x.votes/allVotes*100})).sort((a,b)=>b.votes-a.votes);
    summary.innerHTML="<h3>Resumo nacional · "+features.length.toLocaleString("pt-BR")+" municípios</h3><p class=\"state-detail-total\">"+allVotes.toLocaleString("pt-BR")+" votos simulados</p>"+rows.map(x=>'<div class="state-result-row"><span><i style="background:'+x.color+'"></i>'+esc(x.name)+" · "+esc(x.party)+"</span><strong>"+x.votes.toLocaleString("pt-BR")+" · "+x.percent.toFixed(1).replace(".",",")+"% · "+x.municipalitiesWon+" municípios</strong></div>").join("")+'<p class="municipal-summary-note">Distribuição municipal fictícia derivada dos totais nacionais simulados. Não representa resultados oficiais.</p>';
  } catch(e) {
    map.innerHTML='<p class="empty">Não foi possível montar o mapa nacional: '+esc(e.message)+"</p>";
    legend.innerHTML='<span class="empty">Mapa indisponível; confira a conexão e atualize.</span>';
  }
}
