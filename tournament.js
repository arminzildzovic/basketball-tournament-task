
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
        this.outputGroupResults();
        this.rankTeams();
        this.createPots();
        this.outputPots();
        this.createKnockoutPhases();
        this.createBracket();
        this.outputKnockoutPhase();
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
    }

    // checks if two teams belong to the same pot
    samePotTeams(team1, team2) {
        return team1.potNum === team2.potNum;
    }

    playKnockoutPhases() { 
        for (let i = 0; i < this.knockoutPhases.length - 3; i++) {
            // next phase teams
            let winners = [];
            
            console.log("\nČetvrtfinale:");
            let j = 0;
            for (let match of this.knockoutPhases[i].matches) {
                match.finishMatch();
                winners.push(match.getWinner());
                console.log("   ", match.teamL.name, "-", match.teamR.name, "(" + match.result.pointsL, ":", match.result.pointsR + ")");
                j++;
            }

            // create a new match for the next phase - semifinals
            for (let j = 0; j < winners.length / 2; j++) {
                this.knockoutPhases[i + 1].matches.push(new Match(winners[j * 2], winners[j * 2 + 1], ROUND_DATE_STRING));
            }
        }

        // semifinals
        let winners = [];
        let losers = [];
        let semiFinals = this.knockoutPhases[this.knockoutPhases.length - 3];

        console.log("\nPolufinale:")
        for (let match of semiFinals.matches) {
            match.finishMatch();
            winners.push(match.getWinner());
            losers.push(match.getLoser());
            this.outputMatchResult(match);
        }

        // 3rd place match
        console.log("\nUtakmica za treće mesto:");
        let thirdPlacePhase = this.knockoutPhases[this.knockoutPhases.length - 2];
        let thirdPlaceMatch = new Match(losers[0], losers[1], ROUND_DATE_STRING);
        thirdPlacePhase.matches.push(thirdPlaceMatch);
        thirdPlaceMatch.finishMatch();
        this.outputMatchResult(thirdPlaceMatch);
        
        // finals
        console.log("\nFinale:");
        let final = this.knockoutPhases[this.knockoutPhases.length - 2];
        let finalMatch = new Match(winners[0], winners[1], ROUND_DATE_STRING);
        final.matches.push(finalMatch);
        finalMatch.finishMatch();
        this.outputMatchResult(finalMatch);

        // output medals
        console.log("\nMedalje:");
        console.log("    1.", finalMatch.getWinner().name);
        console.log("    2.", finalMatch.getLoser().name);
        console.log("    3.", thirdPlaceMatch.getWinner().name);
    }

    outputGroupResults() {
        console.log("         Grupna faza");
        for (let i = 0; i < NUM_OF_ROUNDS; i++) {
            console.log("kolo", i + 1 + ":");
            for (let group of this.groups) {
                console.log("    Grupa " + group.name + ":");
                let round = group.rounds[i];
                for (let match of group.rounds[i].matches) {
                    console.log("        " + match.teamL.name + " - " + match.teamR.name + " (" + match.result.pointsL + ":" + match.result.pointsR + ")");
                }
            }
        }

        this.outputGroupTable();
    }

    outputGroupTable() {
        const namePad = 17;
        console.log("\nKonačan plasman u grupama:");
        for (let group of this.groups) {
            console.log("    Grupa", group.name, " ( Ime", "          -", "pobede/", "porazi/", "bodovi/", "postignuti koševi/", "primljeni koševi/", "koš razlika/", "::");
            let i = 0;
            for (let row of group.table.tableRows) {
                let team = group.table.getTeamFromRow(row);
                let signStr = '';
                if (row.pointsDiff >= 0) {
                    signStr = '+';
                }
                console.log("        ", i+1, ". ", team.name.padEnd(namePad), " ", row.pts - 3, "  /   ", 6-row.pts, "   / ", row.pts, " /       ", row.pointsFor, "      /       ", row.pointsAgainst, "     /    ", (signStr + row.pointsDiff).padEnd(4, ' '), "     / ");
                i++;
            }
            
        }
    }

    outputPots() {
        console.log("Šeširi:");
        for (let pot of this.pots) {
            console.log("    Šešir ", pot.potName);
            for (let team of pot.teams) {
                console.log("       ", team.name);
            }
        }
        console.log("\n");
    }
    
    outputKnockoutPhase() {
        console.log("Eliminaciona faza:");
        let i = 0;
        for (let match of this.knockoutPhases[0].matches) {
            console.log("   ", match.teamL.name, "-", match.teamR.name);
            if (i == 1) {
                console.log("");
            }
            i++
        }
    }

    outputMatchResult(match) {
        console.log("   ", match.teamL.name, "-", match.teamR.name, "(" + match.result.pointsL, ":", match.result.pointsR + ")");
    }
}