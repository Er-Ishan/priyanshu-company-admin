const fs = require('fs');
const path = require('path');

const basePath = 'c:/Users/Priyanshu Mishra/priyanshu-company-admin/Company Admin/app/(dashboard)';

function processDirectory(directory) {
    const files = fs.readdirSync(directory);
    for (const file of files) {
        const fullPath = path.join(directory, file);
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
            processDirectory(fullPath);
        } else if (file.endsWith('.tsx') || file.endsWith('.jsx')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            let modified = false;

            // 1. Fix margins
            const marginRegex1 = /className="w-full min-h-screen px-4 py-8 space-y-6"/g;
            const marginRegex2 = /className="w-full min-h-screen px-4 py-8"/g;
            if (marginRegex1.test(content)) {
                content = content.replace(marginRegex1, 'className="w-full min-h-screen px-2 sm:px-4 pt-2 mt-2 pb-8 sm:py-8 space-y-6"');
                modified = true;
            }
            if (marginRegex2.test(content)) {
                content = content.replace(marginRegex2, 'className="w-full min-h-screen px-2 sm:px-4 pt-2 mt-2 pb-8 sm:py-8"');
                modified = true;
            }

            // Also check if they had pt-8 sm:pt-12
            const marginRegex3 = /pt-8 sm:pt-12/g;
            if (marginRegex3.test(content)) {
                content = content.replace(marginRegex3, 'pt-2 mt-2');
                modified = true;
            }

            // 2. Fix dates
            // In the initial state, the date container was probably something like:
            // className="flex flex-col sm:flex-row justify-between items-center mb-6" or similar.
            // Let's just find the wrappers for the DatePicker (e.g. `w-full sm:w-auto` or `w-1/2 sm:w-auto`)
            if (content.includes('w-1/2 sm:w-auto') || content.includes('w-full sm:w-auto')) {
                // Ensure we only touch the wrappers that contain "DatePicker" or "Select" near them
                content = content.replace(/<div className="w-1\/2 sm:w-auto">/g, '<div className="w-full sm:w-[160px]">');
                content = content.replace(/<div className="w-full sm:w-auto">/g, '<div className="w-full sm:w-[160px]">');
                modified = true;
            }

            if (modified) {
                fs.writeFileSync(fullPath, content);
                console.log('Recovered margins/dates in:', fullPath);
            }
        }
    }
}

processDirectory(basePath);
