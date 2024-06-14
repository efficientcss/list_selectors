#!/usr/bin/env node

import fs from 'fs';
import postcss from 'postcss';
import path from 'path';

// Check for the correct number of arguments
if (process.argv.length < 3) {
    console.log('Usage: node listSelectors.js path/to/css/**/*.css');
    process.exit(1);
}

const args = process.argv.slice(2);
const files = args.filter(arg => isNaN(parseInt(arg, 10))).map(file => path.resolve(file));

if (files.length === 0) {
    console.log('No files match the specified pattern.');
    process.exit(1);
}

files.forEach((file, key, arr) => {
    const css = fs.readFileSync(file, 'utf-8');
    const filename = path.basename(file);
    console.log('\n' + `${file}` + '\n');

    const root = postcss.parse(css);

    const processNode = (node, indent = 0) => {
        const indentation = ' '.repeat(indent);
        if (node.type === 'rule') {
            console.log(`${indentation}${node.selector}`);
            node.nodes && node.nodes.forEach(childNode => processNode(childNode, indent + 2));
        } else if (node.type === 'atrule') {
            if (node.name === 'media') {
                console.log(`\n${indentation}@media ${node.params} {`);
            } else {
                console.log(`${indentation}@${node.name} ${node.params} {`);
            }
            node.nodes && node.nodes.forEach(childNode => processNode(childNode, indent + 2));
            console.log(`${indentation}}`);
        }
    };

    root.nodes.forEach(node => {
        processNode(node);
    });

    if (key !== arr.length - 1) {
        console.log('\n');
    }
});
