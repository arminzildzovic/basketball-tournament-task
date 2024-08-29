
// match history for one team
export default class History {
    matches = [];

    constructor() {
        
    }

    addMatch(match) {
        this.matches.push(match);
    }
}