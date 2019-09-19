require("babel-register")
const morgan = require("morgan")("dev")
var bodyParser = require("body-parser")
const express = require("express")
const mysql = require("mysql")

const app = express()

// MIDLEWARES
app.use(morgan);
app.use(bodyParser.urlencoded({extended: false}));

// Base de donnée  : récupération de la config
const config = require("./config/configDb.json");

// relier l’App à la base de données  + test
const db = mysql.createConnection(
    {host: config.host, user: config.user, password: config.password, database: config.database}
)
db.connect(err => {
    if (err) {
        console.log(err.message);
    } else {
        console.log("connecté à la base : " + config.database);
    }
})

// Première route ******************************************
app.get("/", function (req, res) {
    //  faire une requete
    db.query("SELECT * FROM api1 WHERE id=?", [1], (err, result) => {
        if (err) {
            console.log(err.message);
        } else {
            res.send(" Résultat de la demande : " + result[0].name);
            // pour info rerour dans la console
            console.log("réponse retournée au client: " + result[0].name);
        }
    })
});
app.listen(8080, () => {
    console.log("Lecture du port : 8080");
});

// ************ DEBUG CONSOLE - A Supprimer en prod ***********
app.use(function (req, res, next) {
    // Permet un debug de la req dans la console
    console.log(`url demandée  : ${req.url}`);
    next();
});
