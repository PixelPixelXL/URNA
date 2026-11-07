const STATES = {
  GO: ["Goiás", ["goias", "go"]],
  MT: ["Mato Grosso", ["mato grosso", "mt"]],
  MS: ["Mato Grosso do Sul", ["mato grosso do sul", "ms"]],
  DF: ["Distrito Federal", ["distrito federal", "df"]],
  SP: ["São Paulo", ["sao paulo", "sp"]],
  RJ: ["Rio de Janeiro", ["rio de janeiro", "rj"]],
  BA: ["Bahia", ["bahia", "ba"]],
  CE: ["Ceará", ["ceara", "ce"]],
  MA: ["Maranhão", ["maranhao", "ma"]],
  PI: ["Piauí", ["piaui", "pi"]],
  RN: ["Rio Grande do Norte", ["rio grande do norte", "rn"]],
  PB: ["Paraíba", ["paraiba", "pb"]],
  PE: ["Pernambuco", ["pernambuco", "pe"]],
  AL: ["Alagoas", ["alagoas", "al"]],
  SE: ["Sergipe", ["sergipe", "se"]]
};

const PARTY_COLORS = {
  MDB: "#168a54", PCO: "#c62828", UP: "#d52b2b", PT: "#e32636",
  PSDB: "#2876bd", PL: "#244a9b", PSD: "#168a54", MOB: "#6c63a8",
  REP: "#3156a5", "MISSÃO": "#f2c230", AGIR: "#e66b32", PRD: "#4d6a91",
  DC: "#2855a6", PP: "#2876bd", NOVO: "#f28c28", PSB: "#e34b72",
  PSTU: "#b51f2b", PSOL: "#e3a52c", PCB: "#b82c2c",
  "UNIÃO": "#2455a4", DEMOCRATA: "#5b6f91", PRTB: "#3156a5"
};

const CANDIDATES = {
  GO: [
    ["Daniel Vilela", "MDB", "15"],
    ["Danilo da Silva", "PCO", "29"],
    ["Luciana Amorim", "UP", "80"],
    ["Luis Cesar Bueno", "PT", "13"],
    ["Marconi Perillo", "PSDB", "45"],
    ["Wilder Morais", "PL", "22"]
  ],
  MT: [
    ["Doutora Natasha", "PSD", "55"],
    ["Mauricio Coelho", "MOB", "33"],
    ["Otaviano Pivetta", "REP", "10"],
    ["Rafaell Milas", "MISSÃO", "14"],
    ["Sargento Laudicério", "AGIR", "36"],
    ["Wellington Fagundes", "PL", "22"]
  ],
  MS: [
    ["Daniel Lemes", "PCO", "29"],
    ["Delcídio Amaral", "PRD", "25"],
    ["Economista Renato Gomes", "DC", "27"],
    ["Eduardo Riedel", "PP", "11"],
    ["Fábio Trad", "PT", "13"],
    ["Jeferson Bezerra", "AGIR", "36"],
    ["João Henrique Catan", "NOVO", "30"],
    ["Lucien Rezende", "PSOL", "50"]
  ],
  DF: [
    ["Cappelli", "PSB", "40"],
    ["Celina Leão", "PP", "11"],
    ["Elisson", "AGIR", "36"],
    ["Expedito Mendonça", "PCO", "29"],
    ["Kiko Caputo", "NOVO", "30"],
    ["Leandro Grass", "PT", "13"],
    ["Paula Belmonte", "PSDB", "45"],
    ["Professor Robson", "PSTU", "16"],
    ["Professora Samara Mineiro", "UP", "80"]
  ],
  SP: [
    ["Carlos Machado", "PCB", "21"],
    ["Fernando Haddad", "PT", "13"],
    ["Tarcísio", "REP", "10"],
    ["Vera Lúcia", "PSTU", "16"],
    ["Vivian Mendes", "UP", "80"]
  ],
  RJ: [
    ["André Marinho", "NOVO", "30"],
    ["Coronel Busnello", "MISSÃO", "14"],
    ["Cyro Garcia", "PSTU", "16"],
    ["Douglas Ruas", "PL", "22"],
    ["Eduardo Paes", "PSD", "55"],
    ["Juliete", "UP", "80"],
    ["Luan Monteiro", "PCO", "29"],
    ["William Siri", "PSOL", "50"]
  ],
  BA: [
    ["ACM Neto", "UNIÃO", "44"],
    ["Ariel Capistrano", "DC", "27"],
    ["Aroldo Felix", "UP", "80"],
    ["Jerônimo Rodrigues", "PT", "13"],
    ["Maria Bona", "PCO", "29"],
    ["Ronaldo Mansur", "PSOL", "50"]
  ],
  CE: [
    ["Ciro Gomes", "PSDB", "45"],
    ["Danilo Soares", "DEMOCRATA", "35"],
    ["Delegado Huggo", "MISSÃO", "14"],
    ["Elmano de Freitas", "PT", "13"],
    ["Ieri Braga", "PCO", "29"],
    ["Serley Leal", "UP", "80"],
    ["Vera Lúcia", "NOVO", "30"],
    ["Zé Batista", "PSTU", "45"]
  ],
  MA: [
    ["André Luis", "MISSÃO", "14"],
    ["Dimas Cassimiro", "PCO", "29"],
    ["Eduardo Braide", "PSD", "55"],
    ["Felipe Camarão", "PT", "13"],
    ["Orleans Brandão", "MDB", "15"],
    ["Reginaldo Lima", "PCB", "21"],
    ["Roberto Rocha", "PRTB", "28"],
    ["Saulo Arcangeli", "PSTU", "16"]
  ],
  PI: [
    ["Dra. Lúcia Santos", "PSDB", "45"],
    ["Elizeu Aguiar", "NOVO", "30"],
    ["Geraldo Carvalho", "PSTU", "16"],
    ["Joel Rodrigues", "PP", "11"],
    ["Professor Gisvaldo", "PSOL", "50"],
    ["Rafael Fonteles", "PT", "13"],
    ["Santiago Belizário", "UP", "80"]
  ],
  RN: [
    ["Allyson", "UNIÃO", "44"],
    ["Álvaro Dias", "PL", "22"],
    ["Arinalda do MLB", "UP", "80"],
    ["Cadu de Lula", "PT", "13"],
    ["Dário Barbosa", "PSTU", "16"],
    ["Godeiro Linharess", "DC", "27"],
    ["Rodrigo de Bolsonaro", "AGIR", "36"]
  ],
  PB: [
    ["Camilo Duarte", "PCO", "29"],
    ["Cícero Lucena", "MDB", "15"],
    ["Efraim Filho", "PL", "22"],
    ["Lucas Ribeiro", "PP", "11"],
    ["Yuri Ezequiel", "UP", "80"]
  ],
  PE: [
    ["Guilherme Fonseca", "PSTU", "16"],
    ["Ivan Moraes", "PSOL", "50"],
    ["João Campos", "PSB", "40"],
    ["Professora Camila", "UP", "80"],
    ["Raquel Lyra", "PSD", "55"],
    ["Renan", "MISSÃO", "14"],
    ["Victor Assis", "PCO", "29"]
  ],
  AL: [
    ["JHC", "PSDB", "45"],
    ["Lenilda Luna", "UP", "80"],
    ["Márcio Jambo", "DEMOCRATA", "35"],
    ["Renan Filho", "MDB", "15"]
  ],
  SE: [
    ["Fábio", "PSD", "55"],
    ["Taty Cristina de Jesus", "DC", "27"],
    ["Valmir de Francisquinho", "REP", "10"]
  ]
};

export function getGovernorCandidates2026(region) {
  const normalized = String(region || "").trim().toLocaleLowerCase("pt-BR")
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  const uf = Object.entries(STATES).find(([, [, aliases]]) =>
    aliases.some(alias => alias.normalize("NFD").replace(/[\u0300-\u036f]/g, "") === normalized)
  )?.[0];
  if (!uf) return null;

  const partyAcronyms = [...new Set(CANDIDATES[uf].map(([, acronym]) => acronym))];
  const parties = partyAcronyms.map(acronym => ({
    id: "gov26-" + uf.toLowerCase() + "-" + acronym.toLowerCase().replace(/[^a-z0-9]/g, ""),
    name: acronym === "MISSÃO" ? "Missão" : acronym,
    acronym,
    color: PARTY_COLORS[acronym] || "#68758b"
  }));
  const partyIds = Object.fromEntries(parties.map(party => [party.acronym, party.id]));
  const candidates = CANDIDATES[uf].map(([name, acronym, ballotNumber], index) => ({
    id: "gov26-" + uf.toLowerCase() + "-" + (index + 1),
    name,
    partyId: partyIds[acronym],
    ballotNumber,
    office: "governor",
    region: uf,
    platform: "Propostas a definir"
  }));

  return { uf, stateName: STATES[uf][0], parties, candidates };
}
