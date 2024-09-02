
import Team from './team.js';
import Group from './group.js';
import Table from './table.js';
import { parseJSON as parseJSON } from './helper.js';
import Round from './round.js';
import Match from './match.js';
import Result from './result.js';
import Pot from './Pot.js';
import KnockoutPhase from './knockoutPhase.js';


const NUM_OF_GROUPS             = 3;
const NUM_OF_TEAMS              = 4;
const NUM_OF_ROUNDS             = 3;
const NUM_OF_KNOCKOUT_ROUNDS    = 3;
const NUM_OF_POTS               = 4;
const NUM_OF_TEAMS_PER_POT      = 2;

const CHAR_A            = 'A';
const CHAR_D            = 'D';

const ROUND_DATE_STRING = "roundDate";

export default class Tournament {

    groups = [];
    competingTeams = [];
    afterGroupTeams = [];
    pots = [];
    knockoutPhases = [];

    constructor() {
        this.createGroups();
        this.createHistory();
        for (const group of this.groups) {
            group.startGroups();
        }
        this.rankTeams();
        this.createPots();
        this.createKnockoutPhases();
        this.createBracket();
        this.playKnockoutPhases();
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
                newTeam.groupNum = i;
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

    // ranks the teams after the group stage is completed
    rankTeams() {
        let rank = 0;
        let groupPlace = 0;
    
        while(rank < Math.pow(2, NUM_OF_KNOCKOUT_ROUNDS)){
            let rows = [];
            for (let group of this.groups) {
                rows.push(group.table.tableRows[groupPlace]);
                rank++;
            } 
            rows.sort((a, b) => {
                return this.sortTeamRanks(a, b);
            });
            for (let row of rows) {
                let team = this.getTeamForIsoName(row.name);
                this.afterGroupTeams.push(team);
            }
            groupPlace++;
        }
        this.afterGroupTeams = this.afterGroupTeams.slice(0, Math.pow(2, NUM_OF_KNOCKOUT_ROUNDS));
    }

    getTeamForIsoName(isoName) {
        for (let team of this.competingTeams) {
            if (team.isoName === isoName) {
                return team;
            }
        }
    }

    sortTeamRanks(a, b) {
        let res = b.pts - a.pts;
        if (res != 0) {
            return res;
        } 
        res = b.pointsDiff - a.pointsDiff;
        if (res != 0) {
            return res;
        }
        return b.pointsFor - a.pointsFor;
    }

    createPots(){
        for (let i = 0; i < NUM_OF_POTS; i++) {
            this.pots.push(new Pot(String.fromCharCode(CHAR_D.charCodeAt(0) + i)));
        }
        console.log("Create pots: ");
        console.log(this.afterGroupTeams.length);
        for (let i = 0; i < this.afterGroupTeams.length; i++) {
            this.pots[Math.trunc(i/NUM_OF_TEAMS_PER_POT)].teams.push(this.afterGroupTeams[i]);
            this.afterGroupTeams[i].potNum = Math.trunc(i/NUM_OF_TEAMS_PER_POT);
        }
    }

    createKnockoutPhases() {
        for (let i = 0; i < NUM_OF_KNOCKOUT_ROUNDS + 1; i++) {
            if (i != NUM_OF_KNOCKOUT_ROUNDS) {
                this.knockoutPhases.push(new KnockoutPhase(Math.pow(2, NUM_OF_KNOCKOUT_ROUNDS - 1)));
            } else {
                // third place match
                this.knockoutPhases.push(new KnockoutPhase(1));
            }
        }
    }
    
    createBracket() {
        this.knockoutPhases[0].teams = this.afterGroupTeams;
        
        let startPhase = this.knockoutPhases[0];
        let curPot = null;
        
        // goes through the pot pairs (D-G) and (E-F) and pairs the teams
        for (let i = 0; i < NUM_OF_POTS / 2; i++) {
            curPot = this.pots[i];
            let opponentPot = this.pots[NUM_OF_POTS - i - 1];
            for (let j = 0; j < curPot.teams.length; j++) {
                console.log(j);
                let restrictionExists = false;
                let indexOfOpposingTeam = -1;
                for (let k = 0; k < opponentPot.teams.length; k++) {
                    if (curPot.teams[j].groupNum == opponentPot.teams[k].groupNum) {
                        restrictionExists = true;
                        indexOfOpposingTeam = k;
                    }
                }
                if (restrictionExists) {
                    startPhase.createMatch(curPot.teams[j], opponentPot.teams[(indexOfOpposingTeam + 1) % 2]);
                    
                }
            }
            for (let j = 0; j < curPot.teams.length; j++) {
                let curTeam = curPot.teams[j];
                if (!startPhase.matchExistsForTeam(curTeam)) {
                    
                    for (let team of opponentPot.teams) {
                        if (!startPhase.matchExistsForTeam(team)) {
                            startPhase.createMatch(curTeam, team);
                            break;
                        }
                    }
                }
            }
        }
        for (let match of startPhase.matches) {
            if (match != undefined) {
                console.log(match.teamL.isoName, "-", match.teamR.isoName);
            }
        }
        this.shuffleMatches();
    }

    // Fisher-Yates shuffle
    shuffleMatches() {
        let m = this.knockoutPhases[0].matches.length;
        let t, i;

        // While there remain elements to shuffle…
        while (m) {

            i = Math.floor(Math.random() * m--);

            // And swap it with the current element.
            t = this.knockoutPhases[0].matches[m];
            this.knockoutPhases[0].matches[m] = this.knockoutPhases[0].matches[i];
            this.knockoutPhases[0].matches[i] = t;
        }

        // Check if the matches generated from the same pots are in the same half of the bracket
        let match0 = this.knockoutPhases[0].matches[0];
        let match1 = this.knockoutPhases[0].matches[1];   

        if (this.samePotTeams(match0.teamL, match1.teamL) || this.samePotTeams(match0.teamL, match1.teamR)) {
            for (let i = 2; i < this.knockoutPhases[0].matches.length; i++) {
                let curMatch = this.knockoutPhases[0].matches[i];
                if (!this.samePotTeams(match0.teamL, curMatch.teamL) && !this.samePotTeams(match0.teamL, curMatch.teamR)) {
                    let temp = this.knockoutPhases[0].matches[i];
                    this.knockoutPhases[0].matches[i] = this.knockoutPhases[0].matches[1];
                    this.knockoutPhases[0].matches[1] = temp;
                }
            }
        }
        console.log(this.knockoutPhases[0].matches);
    }

    // checks if two teams belong to the same pot
    samePotTeams(team1, team2) {
        return team1.potNum === team2.potNum;
    }

    playKnockoutPhases() { 
        for (let i = 0; i < this.knockoutPhases.length - 3; i++) {
            // next phase teams
            let winners = [];
            
            for (let match of this.knockoutPhases[i].matches) {
                match.finishMatch();
                winners.push(match.getWinner());
            }

            // create a new match for the next phase - semifinals
            for (let j = 0; j < winners.length / 2; j++) {
                this.knockoutPhases[i + 1].matches.push(new Match(winners[j * 2], winners[j * 2 + 1], ROUND_DATE_STRING));
            }
            console.log("\n\n              QuarterFinals:  \n\n")
            console.log(this.knockoutPhases[i].matches);
        }

        // semifinals
        let winners = [];
        let losers = [];
        let semiFinals = this.knockoutPhases[this.knockoutPhases.length - 3];

        for (let match of semiFinals.matches) {
            match.finishMatch();
            winners.push(match.getWinner());
            losers.push(match.getLoser());
        }

        console.log("\n\n              SemiFinals:  \n\n")
        console.log(this.knockoutPhases[1].matches);

        // 3rd place match
        let thirdPlacePhase = this.knockoutPhases[this.knockoutPhases.length - 2];
        let thirdPlaceMatch = new Match(losers[0], losers[1], ROUND_DATE_STRING);
        thirdPlacePhase.matches.push(thirdPlaceMatch);
        thirdPlaceMatch.finishMatch();

        console.log("\n\n              3rd place Match:  \n\n")
        console.log(this.knockoutPhases[2].matches);
        

        let final = this.knockoutPhases[this.knockoutPhases.length - 2];
        let finalMatch = new Match(winners[0], winners[1], ROUND_DATE_STRING);
        final.matches.push(finalMatch);
        finalMatch.finishMatch();
        console.log("\n\n              Finals:  \n\n")
        console.log(this.knockoutPhases[3].matches);
    }
}