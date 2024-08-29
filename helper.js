import fs from 'fs';

export function deepCopyArray(array) {
    return JSON.parse(JSON.stringify(array));
}

export function parseJSON(path) {
    const file = fs.readFileSync(path, 'utf-8');
    return JSON.parse(file);
}
