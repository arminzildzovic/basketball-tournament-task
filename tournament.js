
import Team from './team.js';
import Group from './group.js';
import Table from './table.js';
import { parseJSON as parseJSON } from './helper.js';
import Round from './round.js';
import Match from './match.js';
import Result from './result.js';


const NUM_OF_GROUPS = 3;
const NUM_OF_TEAMS  = 4;
const NUM_OF_ROUNDS = 3;

const CHAR_A        = 'A';

export default class Tournament {

    groups = [];
    competingTeams = [];

    constructor() {
        this.createGroups();
        this.createHistory();
    }

    // Creates groups:
    // 1. Teams
    // 2. Table
    // 3. Rounds
    createGroups() {
        
        const jsonGroup = parseJSON("./json/groups.json");
        const groupArray = [jsonGroup.A, jsonGroup.B, jsonGroup.C];

        let teamArray;

        for (let i = 0; i < NUM_OF_GROUPS; i++) {            
            // new Group
            this.groups[i] = new Group();
            this.groups[i].name = String.fromCharCode(CHAR_A.charCodeAt(0) + i);
            
            
            let curInd = this.competingTeams.length;
            // insert the teams into the new group 
            // and insert the current team into all of the competing teams
            const teams = groupArray[i].map(data => {
                let newTeam = new Team(data.Team, data.ISOCode, data.FIBARanking, this.competingTeams);
                this.competingTeams.push(newTeam);
            })

            let teamArrayTable = structuredClone(this.competingTeams.slice(curInd, curInd + NUM_OF_TEAMS));
            
            // group table
            let table = new Table(teamArrayTable);
            
            // create rounds
            let rounds = [];

            for (let j = 0; j < NUM_OF_ROUNDS; j++) {
                let teamArrayRounds = structuredClone(this.competingTeams.slice(curInd, curInd + NUM_OF_TEAMS));
                // new Round(group's teams, round's index)
                rounds[j] = new Round(teamArrayRounds, j);   
            }
        }
    }

    // fills the history for each team with matches
    createHistory() {
        const exhibJSON = parseJSON("./json/exibitions.json");

        for (const team of this.competingTeams) {
            let curExhib = exhibJSON[team.isoName];
            for (const exhib of curExhib) {
                let match = new Match(team, this.competingTeams.find((element) => element.isoName === exhib.Opponent));
                let resPts = exhib.Result.split("-");
                match.result = new Result(parseInt(resPts[0]), parseInt(resPts[1]));
            }
        }
    }
}