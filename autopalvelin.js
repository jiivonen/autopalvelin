const express = require('express');
const mysql = require('mysql2');

const {port, host} = require('./config.json');
const dbconfig = require('./dbconfig.json');
// const autot = require('./autot.json');

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Määritellään polut
app.get('/autot', (req, res) => {
  const connection = mysql.createConnection(dbconfig);
  connection.connect();
  const kysely = `SELECT merkki, malli, vuosimalli, omistaja FROM auto ORDER BY merkki, malli`;
  connection.query(kysely,
    (err, rivit, kentat) => {
      if (err) {
        // Tämä kaataa palvelimen jos tulee tietokantavirhe
        throw err;
      }

      let vastaus = '';
      for (let rivi of rivit) {
        vastaus += `${rivi.merkki} ${rivi.malli}: ${rivi.vuosimalli}, ${rivi.omistaja}<br>`;
      }
      res.send(vastaus);
  });
  connection.end();
});

app.get('/autot/:id', (req, res) => {
  const haettava =  Number.parseInt(req.params.id);

  const connection = mysql.createConnection(dbconfig);
  connection.connect();
  const kysely =
    `SELECT merkki, malli, vuosimalli, omistaja
      FROM auto
      WHERE id = ` + haettava;
  connection.query(kysely,
    (err, rivit, kentat) => {
      if (err) {
        // Tämä kaataa palvelimen jos tulee tietokantavirhe
        throw err;
      }

      let vastaus = '';
      for (let rivi of rivit) {
        vastaus += `${rivi.merkki} ${rivi.malli}: ${rivi.vuosimalli}, ${rivi.omistaja}<br>`;
      }
      res.send(vastaus);
  });
  connection.end();
});

app.post('/autot/uusi', (req, res) => {
  // kerätään tiedot pyynnön body-osasta
  const merkki = req.body.merkki;
  const malli = req.body.malli;
  const vuosimalli = req.body.vuosimalli;
  const omistaja = req.body.omistaja;

  // jos kaikkia tietoja ei ole annettu, ilmoitetaan virheestä
  // (muuttuja saa arvon undefined, jos vastaavaa elementtiä
  // ei ollut pyynnössä)
  if (merkki == undefined ||
      malli == undefined ||
      vuosimalli == undefined ||
      omistaja == undefined
      ) {
    res.status(400).json({'viesti': 'Virhe: Kaikkia tietoja ei annettu.'});
  }
  else {
    const connection = mysql.createConnection(dbconfig);
    connection.connect();

    // suoritetaan kysely
    connection.query(
      `INSERT INTO auto (merkki, malli, vuosimalli, omistaja)
      VALUES (?, ?, ?, ?)`, [merkki, malli, vuosimalli, omistaja],
      (err, result) => {
        if (err) {
          // Tämä kaataa palvelimen
          throw err;
        }
        res.send('Auto lisätty');
      }
    );
    connection.end();
  }
});

/* kommentoitu pois, koska ei käytä vielä tietokantaa
app.put('/autot/:id', (req, res) => {
  const id =  Number.parseInt(req.params.id);
  // kerätään tiedot pyynnön body-osasta
  const merkki = req.body.merkki;
  const malli = req.body.malli;
  const vuosimalli = req.body.vuosimalli;
  const omistaja = req.body.omistaja;

  // jos kaikkia tietoja ei ole annettu, ilmoitetaan virheestä
  // (muuttuja saa arvon undefined, jos vastaavaa elementtiä
  // ei ollut pyynnössä)
  if (
    id == undefined ||
    merkki == undefined ||
    malli == undefined ||
    vuosimalli == undefined ||
    omistaja == undefined
  ) {
    res.status(400).json({'viesti': 'Virhe: Kaikkia tietoja ei annettu.'});
  }
  else {
    let onOlemassa = false;
    let uusi = {};

    // Etsitään muokattava henkilö ja muokataan arvot
    for (let auto of autot) {
      if (auto.id == id) {
        auto.merkki = merkki;
        auto.malli = malli;
        auto.vuosimalli = vuosimalli;
        auto.omistaja = omistaja;

        onOlemassa = true;

        uusi = {
          id: id,
          merkki: merkki,
          malli: malli,
          vuosimalli: vuosimalli,
          omistaja: omistaja,
        };
      }
    }

    // Tarkistetaan onnistuiko muokkaaminen
    if (!onOlemassa) {
      res.status(400).json({"viesti": "Virhe: Tuntematon auto."});
    }
    else {
      // lähetetään onnistumisviesti
      res.json(uusi);
    }
  }
});
*/

/* kommentoitu pois, koska ei käytä vielä tietokantaa
app.delete('/autot/:id', (req, res) => {
  const poistettava = req.params.id;
  let onOlemassa = false;

  for (let i = 0; i < autot.length; i++) {
    if (autot[i].id == poistettava) {
      autot.splice(i, 1);
      onOlemassa = true;

      // korjaus indeksinumeroon poistamisen jälkeen, jotta ei hypätä yhden henkilön yli
      i--;
    }
  }

  if (onOlemassa) {
    res.json({'viesti': 'Auto poistettu.'});
  }
  else {
    res.status(400).json({'viesti': 'Virhe: Annettua ID-numeroa ei ole olemassa.'});
  }
});
*/

// Käynnistetään express-palvelin
app.listen(port, host, () => {console.log('Autopalvelin kuuntelee')});
