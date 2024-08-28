
export default class Team { 
    name = '';
    isoName = '';
    fiba = 0;
    // one history instance for each team
    history = null;

    constructor(name, isoName, fiba) {
        this.name = name;
        this.isoName = isoName;
        this.fiba = fiba;
        this.createHistory();
    }

    createHistory() {

    }
}