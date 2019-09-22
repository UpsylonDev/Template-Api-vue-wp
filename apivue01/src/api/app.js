require("babel-register")
const morgan = require("morgan")("dev")
var bodyParser = require("body-parser")
const express = require("express")
const userRouter = express.Router() // permet de simplifier les chemins
const configRoutes = require("./config/configRoutes.json")
const mysql = require("mysql")

const app = express()

// MIDLEWARES
app.use(morgan)
app.use(bodyParser.urlencoded({extended: false}));
// app.use(bodyParser.json)
app.use(express.static('upsylon-X01/apivue01/public/images'))

// Base de donnée  : récupération de la config
const config = require("./config/configDb.json");

// relier l’App à la base de données  + test
const db = mysql.createConnection({host: config.host, user: config.user, password: config.password, database: config.database})
db.connect(err => {
    if (err) {
        console.log(err.message);
    } else {
        console.log("Etape A : connecté à la base : " + config.database);
    }
})

// ***********Routeur ************************************************
// Mettre l'adresse de base dans le router
app.use(configRoutes.base, userRouter)

/******************************************************************* */
// récupérer tous les membres : http://localhost:8080/api/v1/users/
userRouter
.route('/users/')
.get((req, res)=>{
    try {
        db.query("SELECT * FROM api1", (err, result)=>{
            if (err) {
                res.redirect('https://google.com')
            } else {
               res.send(result)
            }
        })
    } catch (error) {
        
    }
})

//  récupère un nom : http://localhost:8080/api/v1/name/
// selon id dans le body
userRouter
    .route('/name/')
    .get((req, res) => {
        try {
            if (req.body.id != Number(req.body.id) || req.body.id <= 0 ) {
                console.log('ceci n\'est pas un nombre!')
                res.send('Veuillez rentrer un nombre positif!!')
            } else {
                //  faire une requete sur l'id
                db.query("SELECT * FROM api1 WHERE id=?", [req.body.id], (err, result) => {
                    // vérifier que l'id est bien dans la base
                    if (err) {
                        res.redirect('https://google.com')
                    } else {
                        res.send(" Résultat de la demande : " + result[0].name)
                    }
                })
            }
        } catch (error) {
            console.log('une erreur est survenue :' + error.message)
        }
    })

    // AJOUTER un nom ou une seule valeure dans la base:  http://localhost:8080/api/v1/name/
    .post((req, res) => {
        try {
            // Vérifier que le nom n'est pas déjà pris
            db.query("SELECT * FROM api1 WHERE name=?", [req.body.name], (err, result) => {
                if (err) {
                    // res.redirect('https://google.com')
                } else {
                    if (result[0] != undefined) {
                        res.send('Ce nom est déjà pris :')
                    } else {
                        db.query(
                            "INSERT INTO api1(name) VALUES(?)",
                            [req.body.name],
                            (err, result) => {
                                if (err) {
                                    res.redirect('https://google.com')
                                } else {
                                    res.send('le nom à bien été ajouté ! ')
                                }
                            }
                        )
                    }
                }
            })

        } catch (error) {
            console.log(error.message);

        }
    })

    // Modicication DU NOM d'un User par son id
    .put((req, res) => {
        try {
            if (req.body.name) {
                console.log('bon nommmm');
                // Vérifier que le nom n'est pas déjà pris par son id
            db.query("SELECT * FROM api1 WHERE id=?", [req.body.id], (err, result) => {
                if (err) {
                    res.redirect('https://google.com')
                } else{
                    // vérifier que l'Id n'est pas inconnue 
                    if (result[0] != undefined) {
                        // vérifier que ce nom n'existe pas déjà !
                        // on tset aussi son id pour ne pas remettre à jour si cl'est le même nom
                        db.query("SELECT * FROM api1 WHERE name=? AND id !=?", [req.body.name, req.body.id], (err, result)=>{
                            if (err) {
                                res.redirect('https://google.com')
                            } else {
                                if (result[0] != undefined ) {
                                    res.send("Ce nom est déjà pris !")
                                } else {
                                    db.query("UPDATE api1 SET name = ? WHERE id = ? ", [req.body.name, req.body.id], (err, result )=>{
                                        if (err) {
                                            res.redirect('https://google.com')
                                        } else {
                                            res.send(" les modifications ont bien été prises en compte sur l'id : "  + req.body.id )
                                        }
                                    })
                                }
                            }
                        })
                    }
                }
            })
                
            } else {
                
            }
            

        } catch (error) {
            console.log(error.message);
        }
    })

// ajouter toutes les données d'un membre (formulaire  complet)
//http://localhost:8080/api/v1/addUser/
userRouter
    .route('/addUser/')
    .post((req, res) => {

        let posted = {
            name: req.body.name,
            surname: req.body.surname,
            email: req.body.email
        }
        try {
            // Vérifier que le nom n'est pas déjà pris
            db.query("SELECT * FROM api1 WHERE name=?", [req.body.name], (err, result) => {
                if (err) {
                    res.redirect('https://google.com')
                } else {
                    if (result[0] != undefined) {
                        res.send('Ce nom est déjà pris :')
                    } else {
                        db.query(
                            "INSERT INTO api1 SET ?",
                            posted,
                            (err, result) => {
                                if (err) {
                                    res.redirect('https://google.com')
                                } else {
                                    res.send('les données ont bien été ajoutées ')
                                }
                            }
                        )
                    }
                }
            })
        } catch (error) {
            console.log(error.message);
        }
    })

// Supprimer Un membre et ses données
//http://localhost:8080/api/v1/supressUser/ 
userRouter
    .route('/supressUser/')
    .delete((req, res) => {
        try {
            // vérifier que l'ID existe
            db.query("SELECT * FROM api1 WHERE id=?", [req.body.id], (err, result) => {
                if (err) {
                    res.redirect('https://google.com')
                } else {
                    if (result[0] != undefined) {
                        db.query(
                            "DELETE FROM api1 WHERE id=?",
                            [req.body.id],
                            (err, result) => {
                                if (err) {
                                    res.redirect('https://google.com')
                                } else {
                                    res.send('Cet utilisateur à bien été supprimé')
                                }
                            }
                        )
                    } else {
                        res.send('Cet identifiant n\'existe pas  !')
                    }
                }
            })
        } catch (error) {
            console.log(error.message);

        }
    })

//********************************************************* */
app.listen(8080, () => {
    console.log("Lecture du port : 8080");
});

// ************ DEBUG CONSOLE - A Supprimer en prod ***********
app.use(function (req, res, next) {
    // Permet un debug de la req dans la console
    console.log(`url demandée  : ${req.url}`);
    next();
});
