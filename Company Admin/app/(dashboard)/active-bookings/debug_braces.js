const fs = require('fs');
const file = process.argv[2];
const content = fs.readFileSync(file, 'utf8');
const lines = content.split('\n');
let depth = 0;
for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    for (let j = 0; j < line.length; j++) {
        if (line[j] === '{') depth++;
        if (line[j] === '}') depth--;
        if (depth < 0) {
            console.log(`Imbalance (negative) at line ${i + 1}, char ${j + 1}`);
            process.exit(1);
        }
    }
}
console.log(`Final depth: ${depth}`);
