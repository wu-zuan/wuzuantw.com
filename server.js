const express = require('express');
const path = require('path');
const app = express();
const PORT = 3001;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.static(path.join(__dirname, 'public'), {
    maxAge: '1y'
}));

const liveUpdateTime = {
    mode: 'live',
    iso: '',
    display: '正在同步本機時間…',
    source: '本機即時'
};

app.get('/', (req, res) => {
    res.render('index', { updateTime: liveUpdateTime });
});

app.get('/project/pterodactyl-bot', (req, res) => {
    res.render('project-pterodactyl', { updateTime: liveUpdateTime });
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
