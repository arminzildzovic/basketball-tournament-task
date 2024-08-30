import fs from 'fs';

 

export function deepCopyArray(array) {
    return JSON.parse(JSON.stringify(array));
}

export function parseJSON(path) {
    const file = fs.readFileSync(path, 'utf-8');
    return JSON.parse(file);
}

export function logisticFunction(k, x0, x) {
    return 1/(1 + Math.pow(Math.E, -k*(x-x0)))
}

export function randomNumber(mean, stdev, min, max) {
    const u = 1 - Math.random();
    const v = Math.random();
    const z = Math.sqrt( -2.0 * Math.log( u ) ) * Math.cos( 2.0 * Math.PI * v );
    const res = z * stdev + mean;
    if (res < min) {
        res = min;
    }
    if (res > max) {
        res = max;
    }
    return res;
}

// calculates probability based on points
export function calcProbability(points1, points2) {
    if (points1 + points2 == 0) { return 0.5}
    return points1 / (points1 + points2);
}

export function calcPtsDiffProbability(ptsDiff1, ptsDiff2) {
    return 0.5 + (ptsDiff1 - ptsDiff2) / 250;
}
