const crypto  = require("crypto-js/sha256")

function crypt(value){
    return crypto(value).toString()
}

module.exports.crypt = crypt 

/*  Utilisation ---
let motDePasse = "MonMotdepasse"; // mettre les infos postées dans une variable 
    var valeurCryptee = crypt(motDePasse); // ou ls traiter directement
    console.log(valeurCryptee);
*/