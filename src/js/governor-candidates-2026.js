const STATES = {
  GO: ["Goiás", ["goias", "go"]],
  MT: ["Mato Grosso", ["mato grosso", "mt"]],
  MS: ["Mato Grosso do Sul", ["mato grosso do sul", "ms"]],
  DF: ["Distrito Federal", ["distrito federal", "df"]]
};

const PARTY_COLORS = {
  MDB: "#168a54", PCO: "#c62828", UP: "#d52b2b", PT: "#e32636",
  PSDB: "#2876bd", PL: "#244a9b", PSD: "#168a54", MOB: "#6c63a8",
  REP: "#3156a5", "MISSÃO": "#f2c230", AGIR: "#e66b32", PRD: "#4d6a91",
  DC: "#2855a6", PP: "#2876bd", NOVO: "#f28c28", PSB: "#e34b72",
  PSTU: "#b51f2b", PSOL: "#e3a52c"
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
  ]
};

export function getGovernorCandidates2026(region) {
  const normalized = String(region || "").trim().toLocaleLowerCase("pt-BR")
    .normalize("NFD").replace(/[\\u0300-\\u036f]/g, "");
  const uf = Object.entries(STATES).find(([, [, aliases]]) =>
    aliases.some(alias => alias.normalize("NFD").replace(/[\\u0300-\\u036f]/g, "") === normalized)
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
