export type ElectionType = "municipal" | "presidencial" | "governador" | "deputado-federal";

export interface Party {
  id: string;
  name: string;
  acronym: string;
  color: string;
}

export interface Candidate {
  id: string;
  name: string;
  partyId: string;
  ballotNumber?: string;
  platform: string;
}

export interface ElectionConfig {
  type: ElectionType;
  place: string;
  year: number;
  electorate: number;
  turnout: number;
}

export interface CandidateVotes {
  candidateId: string;
  votes: number;
  percentage: number;
}

export interface StateResult {
  stateCode: string;
  stateName: string;
  results: CandidateVotes[];
}
