import * as fs from 'node:fs';
import * as path from 'node:path';
import * as url from 'node:url';

import { default as express, response } from 'express';
import { default as sqlite3 } from 'sqlite3';
import { TIMEOUT } from 'node:dns';
import res from 'express/lib/response';

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));

const port = 8000;
const root = path.join(__dirname, 'public');
const template = path.join(__dirname, 'templates');

let fn = () => {
    console.log("reee");
}

let app = express();
app.use(express.static(root));

const db = new sqlite3.Database(path.join(__dirname, 'songs.sqlite3'),
    sqlite3.OPEN_READONLY,
    (err) => {
        if (err) {
            console.log("Error connecting to Song database");
        } else {
            console.log("Successfully connected to Song database");
        }
    });

    

app.get("", (req, res) => {
    let artists = new Set();
    let year = new Set();
    let dancability = new Set();

    let query = 'SELECT * FROM Songs';

    db.all(query, (err, rows) => {
        if (err) {
            console.log(err);
        } else {
            rows.forEach((val) => {
                artists.add(val.artists);
                year.add(val.year);
                dancability.add(val.dancability);
            });
        }

    artists = Array.from(artists).sort();
    year = Array.from(year).sort();
    dancability = Array.from(dancability).sort();

    fs.readFile(path.join(template, "landing.html"), 'utf-8', (err, data) => {
        let artists_table = "";
        let year_table = "";
        let dancability_table = "";

        artists.forEach((artist) => {
            artists_table += '<tr><td><a href="artist/' + artist + '">' + artist + "</a></td></tr>\n";
        });

        year.forEach((y) => {
            year_table += '<tr><td><a href="year/' + y + '">' + y + "</a></td></tr>\n";
        });

        dancability.forEach((dance) => {
            dancability_table += '<tr><td><a href="dance/' + dance + '">' + dance + "</a></tr></td>\n";
        })


        let response = data
            .replace('$ARTISTS$', artists_table)
            .replace('$YEARS$', year_table)
            .replace('$DANCABILITY$', dancability_table);

        res.status(200).type('html').send(response);
        });
    });
});

app.get("/artist/:name", (req, res) => {
    let name = req.params.name;
});

app.get("/dance/:score", (req, res) => {
    let score = req.params.score;
});

app.get("/year/:release", (req, res) => {
    let release = req.params.release;
});

app.listen(port, () => {
    console.log('Now listening on port ' + port);
});
