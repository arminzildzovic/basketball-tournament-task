
import Team from './team.js';
import Group from './group.js';
import Table from './table.js';
import { parseJSON as parseJSON } from './helper.js';
import Round from './round.js';
import Match from './match.js';
import Result from './result.js';


const NUM_OF_GROUPS     = 3;
const NUM_OF_TEAMS      = 4;
const NUM_OF_ROUNDS     = 3;

const CHAR_A            = 'A';

const ROUND_DATE_STRING = "roundDate";

export default class Tournament {

    groups = [];
    competingTeams = [];

    constructor() {
        this.createGroups();
        this.createHistory();
        for (const group of this.groups) {
            group.startGroups();
        }
    }

    // Creates groups: teams, rounds and table
    createGroups() {
        
        const jsonGroup = parseJSON("./json/groups.json");
        const groupArray = [jsonGroup.A, jsonGroup.B, jsonGroup.C];

        let teamArray;

        for (let i = 0; i < NUM_OF_GROUPS; i++) {            
            // new Group
            this.groups.push(new Group(ROUND_DATE_STRING));
            this.groups[i].name = String.fromCharCode(CHAR_A.charCodeAt(0) + i);
            
            
            let curInd = this.competingTeams.length;
            // new teams
            const teams = groupArray[i].map(data => {
                let newTeam = new Team(data.Team, data.ISOCode, data.FIBARanking);
                this.competingTeams.push(newTeam);
            })

            let teamArray = this.competingTeams.slice(curInd, curInd + NUM_OF_TEAMS);
            
            // group table
            let table = new Table(teamArray);
            this.groups[i].table = table;
            
            // create rounds
            for (let j = 0; j < NUM_OF_ROUNDS; j++) {
                this.groups[i].rounds.push(new Round(teamArray, j, ROUND_DATE_STRING));   
            }
        }
    }

    // fills the history for each team with matches
    createHistory() {
        const exhibJSON = parseJSON("./json/exibitions.json");

        for (const team of this.competingTeams) {
            let curExhib = exhibJSON[team.isoName];
            for (const exhib of curExhib) {
                this.createNewMatch(team, undefined, exhib, false);
            }
            for (const t of this.competingTeams) {
                let opponentExhib = exhibJSON[t.isoName];
                for (const oppMatches of opponentExhib) {
                    if (oppMatches.Opponent === team.isoName && !team.matchExists(oppMatches.Date)) {
                        this.createNewMatch(team, t, oppMatches, true);
                    }
                }
            }
        }
    }

    createNewMatch(team, opTeam, exhib, reverseRes) {
        let opponent;
        if (reverseRes) {
            opponent = opTeam;
        } else {
            opponent = this.competingTeams.find((element) => element.isoName === exhib.Opponent);
        }
        
        let match = new Match(team, opponent, exhib.Date);
        match.finished = true;
        let resPts = exhib.Result.split("-");
        if (!reverseRes) {
            match.result = new Result(parseInt(resPts[0]), parseInt(resPts[1]));
        } else {
            match.result = new Result(parseInt(resPts[1]), parseInt(resPts[0]));
        }
        team.addToHistory(match);
    }
}