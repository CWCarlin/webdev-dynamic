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
    let artist_data_query = dbSelect('SELECT * FROM Songs WHERE artists = ?', [name]);
    let artists_query = dbSelect("SELECT artists FROM Songs");
    let read_file = fs.promises.readFile(path.join('templates', 'artist.html'), 'utf-8');

    Promise.all([artist_data_query, artists_query, read_file]).then((results) => {
        if (results[0].length == 0) {
            res.status(404).type('txt').send('Sorry, "' + name +  '" is not an artists within this dataset');
        } else {
            let artist_data = results[0];
            let artist_names = new Set();

            results[1].forEach((a) => {
                artist_names.add(a.artists);
            });

            artist_names = Array.from(artist_names).sort();
            const equals = (e) => e == name;
            let artist_index = artist_names.findIndex(equals);

            let prev_artist_name = artist_names[(artist_index + artist_names.length - 1) % artist_names.length];
            let next_artist_name = artist_names[(artist_index + artist_names.length + 1) % artist_names.length];

            let previous = "<a class='link_button' href=" + prev_artist_name.replaceAll(" ", "%20") + ">" + "Go to songs from " + prev_artist_name + "</a>";
            let next = "<a class='link_button' href=" + next_artist_name.replaceAll(" ", "%20") + ">" + "Go to songs from " + next_artist_name + "</a>";

            let table = "";
            let x2001 = [0, 0];
            let x2002 = [0, 0];
            let x2003 = [0, 0];
            let x2004 = [0, 0];
            let x2005 = [0, 0];
            let x2006 = [0, 0];
            let x2007 = [0, 0];
            let x2008 = [0, 0];
            let x2009 = [0, 0];
            let x2010 = [0, 0];
            artist_data.forEach((e) => {
                if (e.year == 2001) {
                    x2001[0] += parseFloat(e.danceability);
                    x2001[1] += 1;
                } else if (e.year == 2002) {
                    x2002[0] += parseFloat(e.danceability);
                    x2002[1] += 1;
                } else if (e.year == 2003) {
                    x2003[0] += parseFloat(e.danceability);
                    x2003[1] += 1;
                } else if (e.year == 2004) {
                    x2004[0] += parseFloat(e.danceability);
                    x2004[1] += 1;
                } else if (e.year == 2005) {
                    x2005[0] += parseFloat(e.danceability);
                    x2005[1] += 1;
                } else if (e.year == 2006) {
                    x2006[0] += parseFloat(e.danceability);
                    x2006[1] += 1;
                } else if (e.year == 2007) {
                    x2007[0] += parseFloat(e.danceability);
                    x2007[1] += 1;
                } else if (e.year == 2008) {
                    x2008[0] += parseFloat(e.danceability);
                    x2008[1] += 1;
                } else if (e.year == 2009) {
                    x2009[0] += parseFloat(e.danceability);
                    x2009[1] += 1;
                } else if (e.year == 2010) {
                    x2010[0] += parseFloat(e.danceability);
                    x2010[1] += 1;
                }

                let table_row = "<tr>";
                table_row += "<td>" + e.name + "</td>\n";
                table_row += "<td>" + e.year + "</td>\n";
                table_row += "<td>" + e.danceability + "</td>\n";
                table_row += "</tr>\n";
                table += table_row;
            });

            if (x2001[1] != 0) {x2001[0] /= x2001[1]};
            if (x2002[1] != 0) {x2002[0] /= x2002[1]};
            if (x2003[1] != 0) {x2003[0] /= x2003[1]};
            if (x2004[1] != 0) {x2004[0] /= x2004[1]};
            if (x2005[1] != 0) {x2005[0] /= x2005[1]};
            if (x2006[1] != 0) {x2006[0] /= x2006[1]};
            if (x2007[1] != 0) {x2007[0] /= x2007[1]};
            if (x2008[1] != 0) {x2008[0] /= x2008[1]};
            if (x2009[1] != 0) {x2009[0] /= x2009[1]};
            if (x2010[1] != 0) {x2010[0] /= x2010[1]};

            let response = results[2]
                .replace("$$ARTIST$$", name)
                .replace("$$ARTIST$$", name)
                .replace("$$PREV_ADDRESS$$", previous)
                .replace("$$NEXT_ADDRESS$$", next)
                .replace("$$x1$$", x2001[0])
                .replace("$$x2$$", x2002[0])
                .replace("$$x3$$", x2003[0])
                .replace("$$x4$$", x2004[0])
                .replace("$$x5$$", x2005[0])
                .replace("$$x6$$", x2006[0])
                .replace("$$x7$$", x2007[0])
                .replace("$$x8$$", x2008[0])
                .replace("$$x9$$", x2009[0])
                .replace("$$x10$$", x2010[0])
                .replace("$$TABLE_BODY$$", table);
            res.status(200).type('html').send(response);
        }
    });
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
