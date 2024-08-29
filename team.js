import { parseJSON } from "./helper.js";
import History from "./history.js";
import Match from "./match.js";

export default class Team { 
    name = '';
    isoName = '';
    fiba = 0;
    // one history instance for each team
    history = null;

    constructor(name, isoName, fiba, allTeams) {
        this.name = name;
        this.isoName = isoName;
        this.fiba = fiba;
        
    }

    addToHistory(match) {
        this.history.addMatch(match);
    }
}