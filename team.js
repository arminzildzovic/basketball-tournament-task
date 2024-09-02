import { parseJSON } from "./helper.js";
import History from "./history.js";
import Match from "./match.js";

export default class Team { 
    name = '';
    isoName = '';
    fiba = 0;
    // one history instance for each team
    history = null;

    groupNum = -1;
    potNum = -1;

    constructor(name, isoName, fiba) {
        this.name = name;
        this.isoName = isoName;
        this.fiba = fiba;
        this.history = new History();
    }

    addToHistory(match) {
        this.history.addMatch(match);
    }

    matchExists(date) {
        for (let match of this.history.matches) {
            if (match.date === date) {
                return true;
            }
        }
        return false;
    }
}