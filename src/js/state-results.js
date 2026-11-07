const STATES = [
  ["AC","Acre",1,5],["AM","Amazonas",2,3],["RR","Roraima",3,1],["PA","Pará",4,3],["AP","Amapá",5,1],
  ["RO","Rondônia",2,5],["MT","Mato Grosso",3,5],["TO","Tocantins",5,4],["MA","Maranhão",6,3],["PI","Piauí",7,4],
  ["CE","Ceará",8,3],["RN","Rio Grande do Norte",9,2],["PB","Paraíba",9,3],["PE","Pernambuco",8,4],["AL","Alagoas",9,5],
  ["SE","Sergipe",9,6],["BA","Bahia",7,5],["MS","Mato Grosso do Sul",4,6],["GO","Goiás",5,6],["DF","Distrito Federal",6,6],
  ["MG","Minas Gerais",7,6],["ES","Espírito Santo",8,6],["RJ","Rio de Janeiro",8,7],["SP","São Paulo",6,7],
  ["PR","Paraná",5,7],["SC","Santa Catarina",4,7],["RS","Rio Grande do Sul",3,7]
];


function allocate(total, weights) {
  const sum = weights.reduce((a,b)=>a+b,0);
  const quotas = weights.map(w => sum ? total*w/sum : total/weights.length);
  const values = quotas.map(Math.floor);
  let rest = total-values.reduce((a,b)=>a+b,0);
  const order = quotas.map((q,i)=>({i,f:q-values[i]})).sort((a,b)=>b.f-a.f);
  for(let i=0;i<rest;i++) values[order[i].i]++;
  return values;
}

export function simulateStateResults(candidates, parties, nationalVotes, random = Math.random) {
  if (!candidates.length) return [];
  const northeast = new Set(["MA","PI","CE","RN","PB","PE","AL","SE","BA"]);
  return STATES.map(([uf,name]) => {
    const weights = candidates.map(candidate => {
      const base = Math.max(0, Number(nationalVotes[candidate.id]) || 0);
      const party = parties.find(item => item.id === candidate.partyId);
      // Preferência regional fictícia: o PT recebe um impulso no Nordeste,
      // mas a variação aleatória mantém possível a vitória de outros partidos.
      const regionalFactor = northeast.has(uf) && party?.acronym?.toUpperCase() === "PT" ? 1.45 : 1;
      return Math.max(0.01, base * regionalFactor * (0.72 + random() * 0.56));
    });
    const total = 10000 + Math.floor(random() * 90001);
    const allocated = allocate(total, weights);
    const votes = candidates.map((candidate,index) => {
      const party = parties.find(item => item.id === candidate.partyId);
      return {
        candidateId:candidate.id,name:candidate.name,
        partyAcronym:party ? party.acronym : "IND",
        color:party ? party.color : "#718096",
        votes:allocated[index],percent:allocated[index]/total*100
      };
    }).sort((a,b)=>b.votes-a.votes);
    return {uf,name,totalVotes:total,winnerId:votes[0].candidateId,votes};
  });
}
