import Match from "./match.js";

// One round (out of three) of the group phase
export default class Round {
    matches = [];

    // parameters:
    // 1. teams
    // 2. round number (three rounds per group)
    constructor(teams, roundNum){
        this.matches[0] = new Match(teams[0], teams[roundNum + 1], "roundDate");
        let remainTeams = [];
        for (let i = 1; i < teams.length; i++) {
            if (i != roundNum + 1) {
                remainTeams.push(teams[i]);
            }
        }
        this.matches[1] = new Match(remainTeams[0], remainTeams[1], "roundDate");
    };


    startRound() {
        for (let match of this.matches) {
            match.finishMatch();
        }
    }
}