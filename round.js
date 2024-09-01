import Match from "./match.js";

// One round (out of three) of the group phase
export default class Round {
    matches = [];
    date = '';

    // parameters:
    // 1. teams
    // 2. round number (three rounds per group)
    constructor(teams, roundNum, date){
        this.date = date;
        this.matches[0] = new Match(teams[0], teams[roundNum + 1], date);
        let remainTeams = [];
        for (let i = 1; i < teams.length; i++) {
            if (i != roundNum + 1) {
                remainTeams.push(teams[i]);
            }
        }
        this.matches[1] = new Match(remainTeams[0], remainTeams[1], date);
    };


    startRound() {
        for (let match of this.matches) {
            match.finishMatch();
        }
    }
}