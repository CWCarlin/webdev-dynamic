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
    //START FILLING WEBPAGE
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
            let next_address = "<a class='link_button' href=" + next_year + ">" + "Go to songs from " + next_year + "</a>";
            response = response.replace('$$NEXT_ADDRESS$$', next_address);
            //Create previous link
            let prev_year = input_year - 1;
            if (prev_year === 2000) {prev_year = 2010;}
            let prev_address = "<a class='link_button' href=" + prev_year + ">" + "Go to songs from " + prev_year + "</a>";
            response = response.replace('$$PREV_ADDRESS$$', prev_address);
            //Load in image of most popular song of the year
            let first_song = results[0][0];
            let picture_id = first_song.id;
            response = response.replace('$$PICTURE_ID$$', picture_id).replace('$$RELEASE_YEAR$$', release_year);
            //Populate chart data
            let x1=0, x2=0, x3=0, x4=0, x5=0, x6=0, x7=0, x8=0, x9=0, x10=0, x11=0;
            release_list.forEach((song) => {
                if (song.danceability === "0") { x1 = x1 + 1}
                else if (song.danceability === "0.1") { x2 = x2 + 1}
                else if (song.danceability === "0.2") { x3 = x3 + 1}
                else if (song.danceability === "0.3") { x4 = x4 + 1}
                else if (song.danceability === "0.4") { x5 = x5 + 1}
                else if (song.danceability === "0.5") { x6 = x6 + 1}
                else if (song.danceability === "0.6") { x7 = x7 + 1}
                else if (song.danceability === "0.7") { x8 = x8 + 1}
                else if (song.danceability === "0.8") { x9 = x9 + 1}
                else if (song.danceability === "0.9") { x10 = x10 + 1}
                else { x11 = x11 + 1}
            });
            response = response.replace('$$x1$$', x1).replace('$$x2$$', x2).replace('$$x3$$', x3).replace('$$x4$$', x4)
                .replace('$$x5$$', x5).replace('$$x6$$', x6).replace('$$x7$$', x7).replace('$$x8$$', x8)
                .replace('$$x9$$', x9).replace('$$x10$$', x10).replace('$$x11$$', x11);
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
