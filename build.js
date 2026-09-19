const fs = require('fs');
const path = require('path');
const ejs = require('ejs');

const viewsDir = path.join(__dirname, 'views');
const publicDir = path.join(__dirname, 'public');
const distDir = path.join(__dirname, 'dist');

function copyDir(src, dest) {
    fs.mkdirSync(dest, { recursive: true });
    const entries = fs.readdirSync(src, { withFileTypes: true });

    for (let entry of entries) {
        let srcPath = path.join(src, entry.name);
        let destPath = path.join(dest, entry.name);

        if (entry.isDirectory()) {
            copyDir(srcPath, destPath);
        } else {
            fs.copyFileSync(srcPath, destPath);
        }
    }
}

function formatTaipeiTime(date) {
    const parts = new Intl.DateTimeFormat('en-CA', {
        timeZone: 'Asia/Taipei',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hourCycle: 'h23'
    }).formatToParts(date);
    const value = Object.fromEntries(parts.map(part => [part.type, part.value]));

    return `${value.year}/${value.month}/${value.day} ${value.hour}:${value.minute}:${value.second}`;
}

async function compileEjs(srcViewName, destRelativePath, templateData) {
    const srcPath = path.join(viewsDir, `${srcViewName}.ejs`);
    const destPath = path.join(distDir, destRelativePath);

    fs.mkdirSync(path.dirname(destPath), { recursive: true });

    console.log(`Compiling ${srcViewName}.ejs -> ${destRelativePath}...`);
    try {
        const html = await ejs.renderFile(srcPath, templateData);
        fs.writeFileSync(destPath, html, 'utf-8');
    } catch (err) {
        console.error(`Error compiling ${srcViewName}.ejs:`, err);
        process.exit(1);
    }
}

async function main() {
    console.log('Starting build process...');

    // Cloudflare Pages and Workers Builds expose different CI flags. Local
    // builds stay live so `wrangler dev` behaves like the Express dev server.
    const builtAt = new Date();
    const isCloudflareBuild = process.env.CF_PAGES === '1' || process.env.WORKERS_CI === '1';
    const templateData = {
        updateTime: {
            mode: isCloudflareBuild ? 'build' : 'live',
            iso: isCloudflareBuild ? builtAt.toISOString() : '',
            display: isCloudflareBuild ? formatTaipeiTime(builtAt) : '正在同步本機時間…',
            source: isCloudflareBuild ? 'Cloudflare Pages 建置' : '本機即時'
        }
    };

    if (fs.existsSync(distDir)) {
        console.log('Cleaning existing dist directory...');
        fs.rmSync(distDir, { recursive: true, force: true });
    }
    fs.mkdirSync(distDir, { recursive: true });

    console.log('Copying static assets...');
    if (fs.existsSync(publicDir)) {
        copyDir(publicDir, distDir);
    }

    await compileEjs('index', 'index.html', templateData);

    await compileEjs('project-pterodactyl', 'project-pterodactyl.html', templateData);

    await compileEjs('project-pterodactyl', 'project/pterodactyl-bot/index.html', templateData);

    console.log('Build completed successfully!');
}

main();
