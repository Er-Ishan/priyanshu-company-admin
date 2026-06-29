const fs = require('fs');

const logPath = 'C:\\Users\\Priyanshu Mishra\\.gemini\\antigravity\\brain\\3ac77888-dfbd-46fd-9fe3-66dfbd085915\\.system_generated\\logs\\transcript_full.jsonl';
const content = fs.readFileSync(logPath, 'utf8');
const lines = content.split('\n').filter(Boolean);

let scripts = [];

for (const line of lines) {
    try {
        const obj = JSON.parse(line);
        if (obj.tool_calls) {
            for (const call of obj.tool_calls) {
                if (call.name === 'default_api:write_to_file' || call.name === 'write_to_file') {
                    if (call.arguments && call.arguments.TargetFile && call.arguments.CodeContent) {
                        scripts.push({
                            file: call.arguments.TargetFile,
                            content: call.arguments.CodeContent
                        });
                    }
                }
            }
        }
    } catch (e) {}
}

fs.writeFileSync('C:\\Users\\Priyanshu Mishra\\priyanshu-company-admin\\Company Admin\\extracted_scripts.json', JSON.stringify(scripts, null, 2));
console.log('Extracted', scripts.length, 'scripts');
