export default class Result {
    // two integer values
    pointsL = 0;
    pointsR = 0;
    leftTeamWon = false;

    // result instance created by the match instance
    constructor(points1, points2) {
        this.pointsL = points1;
        this.pointsR = points2;
        if (points1 > points2) {
            this.leftTeamWon = true;
        }
    }
}