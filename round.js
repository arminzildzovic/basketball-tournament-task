import Match from "./match.js";

// One round (out of three) of the group phase
export default class Round {
    matches = [];

    // parameters:
    // 1. teams
    // 2. round number (three rounds per group)
    constructor(teams, roundNum){
        
        this.matches[0] = new Match(teams[0], teams[roundNum + 1]);
        teams.splice(roundNum + 1, 1);
        teams.splice(0, 1);
        this.matches[1] = new Match(teams[0], teams[1]);
        

    };
}