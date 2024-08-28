import Result from './result.js'

export default class Match {
    // two teams and a result
    teamL = null;
    teamR = null;
    result = null;

    
    constructor(teamLeft, teamRight) {
        this.teamL = teamLeft;
        this.teamR = teamRight;
    }
}