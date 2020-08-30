var h2g2 = 42;

function alea(min, max) {
    return (Math.random() * (max-min) + min) | 0; 
}

var moi = "Fred";

console.log("coucou");

console.log(document.getElementById("monBouton").innerHTML);

export { h2g2 as default, alea };