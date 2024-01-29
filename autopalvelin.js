const express = require('express');

const {port, host} = require('./config.json');
const autot = require('./autot.json');

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Apufunktiot
newId = () => {
  let max = 0;
  for (let auto of autot) {
    if (auto.id > max) {
      max = auto.id;
    }
  }

  return max + 1;
};

// Määritellään polut
app.get('/autot', (req, res) => {
  res.json(autot);
});

app.get('/autot/:id', (req, res) => {
  const vastaus = [];
  const haettava =  Number.parseInt(req.params.id);

  for (let auto of autot) {
      if (auto.id === haettava) {
          vastaus.push(auto);
      }
  }

  res.json(vastaus);
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
      // luodaan tiedoilla uusi olio
      const uusi = {
          id: newId(),
          merkki: merkki,
          malli: malli,
          vuosimalli: vuosimalli,
          omistaja: omistaja,
      };

      // lisätään olio työntekijöiden taulukkoon
      autot.push(uusi);

      // lähetetään onnistumisviesti
      res.json(uusi);
  }
});

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

// Käynnistetään express-palvelin
app.listen(port, host, () => {console.log('Autopalvelin kuuntelee')});
