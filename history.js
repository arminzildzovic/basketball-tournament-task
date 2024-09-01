
// match history for one team
export default class History {
    matches = [];

    constructor() {
        
    }

    addMatch(match) {
        this.matches.push(match);
        if (match.date === "roundDate") {
            console.log(match.teamL.isoName, match.teamR.isoName);
        }
    }
}