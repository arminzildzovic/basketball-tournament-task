import Table from './table.js';


// name of the group ('A', 'B', 'C')
// three rounds for each group
// one table instance

export default class Group {
    
    name = '';
    rounds = [];
    table = null;

    constructor() {
        
    }

    // start the group competition 
    startGroups() {
        for (let round of this.rounds) {
            round.startRound();

            // update the table
        }
    }
}