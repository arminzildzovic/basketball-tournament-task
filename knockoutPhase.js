import { getRandomInt, randomNumber } from "./helper.js";
import Match from "./match.js";

const MATCH_DATE = "KnockoutPhase";

export default class KnockoutPhase {
    matches = [];
    teams = [];
    numberOfMatches = 0;

    constructor(numberOfMatches) {
        this.numberOfMatches = numberOfMatches;
    }

    createMatch(team1, team2) {
        this.matches.push(new Match(team1, team2, MATCH_DATE));
    }

    matchExistsForTeam(team) {
        for (let match of this.matches) {
            if (match != undefined && match.teamPlaysInMatch(team)) {
                return true;
            }
        }
    }

    
}