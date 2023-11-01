import * as fs from 'node:fs';
import * as path from 'node:path';
import * as url from 'node:url';

import { default as express, response } from 'express';
import { default as sqlite3 } from 'sqlite3';

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));

const port = 9000;
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

function dbSelect(query, params) {
    return new Promise((resolve, reject) => {
        db.all(query, params, (err, rows) => {
            if (err) {
                reject(err);
            }
            else {
                resolve(rows);
            }
        });
    });
}

app.get("", (req, res) => {
    let artists = new Set();
    let year = new Set();
    let danceability = new Set();

    let query = 'SELECT * FROM Songs';

    db.all(query, (err, rows) => {
        if (err) {
            console.log(err);
        } else {
            rows.forEach((val) => {
                artists.add(val.artists);
                year.add(val.year);
                danceability.add(val.danceability);
            });
        }

    artists = Array.from(artists).sort();
    year = Array.from(year).sort();
    danceability = Array.from(danceability).sort();

    fs.readFile(path.join(template, "landing.html"), 'utf-8', (err, data) => {
        let artists_table = "";
        let year_table = "";
        let danceability_table = "";

        artists.forEach((artist) => {
            artists_table += '<tr><td><a href="artist/' + artist + '">' + artist + "</a></td></tr>\n";
        });

        year.forEach((y) => {
            year_table += '<tr><td><a href="year/' + y + '">' + y + "</a></td></tr>\n";
        });

        danceability.forEach((dance) => {
            danceability_table += '<tr><td><a href="dance/' + dance + '">' + dance + "</a></tr></td>\n";
        })


        let response = data
            .replace('$ARTISTS$', artists_table)
            .replace('$YEARS$', year_table)
            .replace('$DANCEABILITY$', danceability_table);

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

// START OF RELEASE YEAR TEMPLATE
app.get("/year/:release_year", (req, res) => {
    try {
        let release_year = req.params.release_year;
        let input_year = parseInt(release_year);
        if(input_year !== 2001 && input_year !== 2002 && input_year !== 2003 && input_year !== 2004 && input_year !== 2005 &&
            input_year !== 2006 && input_year !== 2007 && input_year !== 2008 && input_year !== 2009 && input_year !== 2010)
            throw release_year;
        let p1 = dbSelect('SELECT * FROM songs WHERE year = ?', [release_year]);
        let p2 = fs.promises.readFile(path.join('templates', 'release_year.html'), 'utf-8');
        Promise.all([p1, p2]).then((results) => {
            //Populate release year tags
            let response = results[1].replace('$$RELEASE_YEAR$$', release_year).replace('$$RELEASE_YEAR$$', release_year);
            //Populate table
            let table_body = '';
            let release_list = results[0];
            release_list.forEach((song) => {
                let table_row = '<tr>';
                table_row += '<td>' + song.name + '</td>\n';
                table_row += '<td>' + song.artists + '</td>\n';
                table_row += '<td>' + song.year + '</td>\n';
                table_row += '<td>' + song.danceability + '</td>\n';
                table_row += '</tr>\n';
                table_body += table_row;
            });
            response = response.replace('$$TABLE_BODY$$', table_body);
            //Create next link
            let next_year = input_year + 1;
            if (next_year === 2011) {next_year = 2001;}
            let next_text = "Go to songs from " + next_year;
            let next_address = "https://cwcarlin-webdev-dynamic.onrender.com/year/" + next_year;
            response = response.replace('$$NEXT_TEXT$$', next_text).replace('$$NEXT_ADDRESS$$', next_address);
            //Create previous link
            let prev_year = input_year - 1;
            if (prev_year === 2000) {prev_year = 2010;}
            let prev_text = "Go to songs from " + prev_year;
            let prev_address = "https://cwcarlin-webdev-dynamic.onrender.com/year/" + prev_year;
            response = response.replace('$$PREV_TEXT$$', prev_text).replace('$$PREV_ADDRESS$$', prev_address);
            //Send Response
            res.status(200).type('html').send(response);
        })
    }
    catch(error) {
        res.status(404).type('txt').send('Sorry, ' + error +  ' is not between 2000 and 2010');
    }
});


app.listen(port, () => {
    console.log('Now listening on port ' + port);
});
