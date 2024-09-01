export default class TableRow {
    name = '';
    pts = 0;
    pointsFor = 0;
    pointsAgainst = 0;
    pointsDiff = 0;

    // sorting variable used to sort three team with the same points
    sortVar = 0;
    
    constructor(name) {
        this.name = name;
    }
}