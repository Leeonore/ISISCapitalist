//Définition des variables globales
    var serveurUrl = "http://localhost:8080/ISISCapitalist/";
    var currentWorld;
    var lastupdate; //variable destiné à contenir la date de début de production
    var commutateur = 1;
    var bars = [];

//Initialisation interface
$(document).ready(function () {
    $.getJSON(serveurUrl + "webresources/generic", function (world) {
        
        // Initialisation de monde
        currentWorld = world;
        $("#nomMonde").html(currentWorld.name);
        $("#nomMonde").prepend("<img id='imageMonde' class='img-circle' src='" + currentWorld.logo + "' alt='test'/>");
        $("#argent").html(currentWorld.money + ' $');
        
        // Création des produits
        $.each(world.products.product, function (index, product) {
            var newProduct =  
                    '<div class="row" id="p'
                    + product.id
                    + '">' 
                        + '<div class="product">'
                            + '<div class="logo">'
                            + "<img src='" + product.logo + "' alt='test'/>" 
                            + '</div>'
                            + '<div class="quantite">'+ product.quantite + '</div>'
                        + '</div>'
                        + '<div class="description">'
                            + '<div class="revenu" id="r' + product.id + '">'
                                +'<span class="revenuText">'+ product.revenu + '</span>'
                            +'</div>'
                            + '<div class="achat">'
                                +'<div class="achatQuantite"><button class="btn btn-default" disabled onclick="BuyProduct(' + product + ')" type="submit">Buy x1</button></div>'
                            //+'<div class="buyButton">Buy x1</div>'
                            +'<div class="cout">'+ product.cout + '</div>'
                            +'</div>'
                            + '<div class="time"></div>'
                        + '</div>'
                    + '</div>';
            $("#produits").append(newProduct);
            //$(".time").countdown({until: 0, compact : true});
          
            //Inialisation des calculs
                // Calcul du commutateur au lancement
                commutateur = 1;
                CalcCommutateur();
                
            //Calcul du score
                calcScore();

            // Initialisation de la bar
            bars[product.id] = new ProgressBar.Line("#r" + product.id, {strokeWidth: 10, color: '#00ff00'});

            // Acheter un produit
            $("#p" + product.id + " .btn").click(function () {
                var id = $(this).parents(".row").attr("id").substr(1) - 1;
                var product = currentWorld.products.product[id];
                BuyProduct(product);
            });
        });
        
            // Calcul score prediodiquement
            setInterval(function() { 
                calcScore();
            }, 2000); //Appeler la fonction calcScore toutes les 100ms

            // Gestion clique logo
            $(".logo").click(function () {
                id = $(this).parents(".row").attr("id").substr(1) - 1;
                StartProduction(id);
            });
    });
    
    //Gestion clique du commutateur
    $("#commutateur").click(function () {
        commutateur += 1;
        CalcCommutateur();
    });
    
    //Calculer le score (argent ...)
    function calcScore() {
        $.each(currentWorld.products.product, function (index, product) {if(product.timeleft === 0){}
            else {
                product.timeleft = product.timeleft -(Date.now() - product.lastupdate);
                if (product.timeleft <=0){
                    product.timeleft = 0;
                    revenu = product.revenu * product.quantite; 
                    
                    bars[product.id].set(0); //Réinitialiser la bar de progression
                    
                    //Mettre à jour l'argent disponible
                    currentWorld.money = parseInt(currentWorld.money) + revenu; //dans le document
                    $("#argent").html(formatNumber(currentWorld.money) + ' $'); //à l'affichage
                }
            }
            //Démarrer la production d'un manager
            if (product.managerUnlocked === true){StartProduction(product.id -1);}
            
            //Gestion cliquabilité des boutons
            GestionBuyButton(product); 
        }); 
        //Afficher badge si un manager est dispo mais pas engagé
        InitBadge(); 
    }
    
    //Ouvrir la fenêtre des managers
    $("#managersbutton").click(function () {
        $("#managers").modal('show');
        //Initialisation des managers
        ListerManager();
    });
});

// Start production d'un produit
function StartProduction(id){
        var product = currentWorld.products.product[id];
        product.timeleft = product.vitesse;
        product.lastupdate = Date.now();
        var quantite = currentWorld.products.product[id].quantite;
        if (quantite > 0){
            bars[product.id].animate(1, {duration: product.vitesse});
             $("#p"+ product.id +" .time").countdown({until : + (product.timeleft/1000), compact: true});
        }
    }
    
// Calcul cout des produits
function calculCout(cout, croissance, n){
    if(n === 0){
        return 0;
    }else{
        return cout * ((1 - Math.pow(croissance,n))/(1-croissance));
    }

}
    
//Calcul de quantite max
function calculQuantiteMax(product){
    var cout = product.cout;
    var croissance = product.croissance;
    var n=1;
    var prix = cout;
    while (prix <= currentWorld.money){
        n = n+1;
        prix = calculCout(cout,croissance,n);
    }
    return n-1;
}
    
// Calculer prix/commutateur
function CalcCommutateur(){
    var n;
    //Si on veut 1, 10 ou 100 produits
    if (commutateur < 4){            
       n = Math.pow(10,(commutateur-1)); //Transformation du commutateur (1,2,3) en quantité (1,10,100)
       $("#commutateurButton").html("Buy </br> x " + n); // Mise à jour de l'affichage du commutateur
       $.each(currentWorld.products.product, function (index, product) {
            //Calcul du cout correspondant
            var cout = calculCout(product.cout,product.croissance,n);
            //Mise à jour de l'affichage
            $("#p"+ product.id +" .btn").html("Buy x"+ n);
            $("#p"+ product.id +" .cout").html(formatNumber(cout));
            //Enregistrement des données courantes
            product.currentCout = cout;
            product.currentQuantite = n;
            //Mise à jour de la cliquabilité des boutons
            GestionBuyButton(product);              
        });
    }
    //Si on veut "max"
    else if (commutateur >= 4) {
        $("#commutateurButton").html("Buy </br> x Max"); // Mise à jour de l'affichage du commutateur
        commutateur = 0;
        $.each(currentWorld.products.product, function (index, product) {
            //Calcul de la quantité max et du cout correspondant
            var quantiteMax = calculQuantiteMax(product);
            var cout = calculCout(product.cout,product.croissance,quantiteMax);
            //Mise à jour de l'affichage
            $("#p"+ product.id + " .btn").html("Buy x"+ quantiteMax);
            $("#p"+ product.id + " .cout").html(formatNumber(cout));
            //Enregistrement des données courantes
            product.currentCout = cout;
            product.currentQuantite = quantiteMax;
            //Mise à jour de la cliquabilité des boutons
            GestionBuyButton(product);
        });
    }
}
    
//Acheter un produit
function BuyProduct(product) {
    if (currentWorld.money >= product.currentCout) { //Si il a le budget
        //Mise à jour du documment
        currentWorld.money = currentWorld.money - product.currentCout;
        product.quantite = product.quantite + product.currentQuantite;
        product.cout = product.cout * Math.pow(product.croissance, product.currentQuantite);
        //Mise à jour de l'affichage
        $("#argent").html(formatNumber(currentWorld.money) + ' $');
        $("#p" + product.id + " .quantite").html(product.quantite);
    }
    CalcCommutateur(); //Recaculer les prix
    GestionBuyButton(product); //Mettre à jour cliquabilité des boutons d'achat
}

//Gestion du bouton d'achat cliquable ou non
function GestionBuyButton(product){
    if (product.currentCout > currentWorld.money ) { //Si il n'a pas le budget
        $("#p" + product.id + " .btn").attr("disabled", "disabled");
    }else{ //Si il a le budget
       $("#p" + product.id + " .btn").removeAttr("disabled");
   }    
}

//Afficher badge si un manager est dispo mais pas engagé
function InitBadge() {
    $.each(currentWorld.managers.pallier, function (pallier) {
        //Si il a l'argent nécessaire mais que le manager n'est pas engagé
        if ((pallier.seuil <= currentWorld.money) && (currentWorld.products.product[pallier.idcible - 1].managerUnlocked === false)) {
            $("#managersbutton .badge").text("New");
        }
    });
}

//Initialisation de la liste des managers)
function ListerManager() {
    var newManager;
    $(".modal-body").html("");
    $.each(currentWorld.managers.pallier, function (index, pallier) {
        var id = pallier.idcible - 1;
        if (currentWorld.products.product[id].managerUnlocked === false) { //si le manager n'est pas en service
            //Affichage des managers
            newManager = '<div class="row" id="m' + id + '">'
                            + "<img id='logo' src='" + pallier.logo + "'/>"
                            + '<div class="description">'
                                + '<div class="name">' + pallier.name + '</div>'
                                + '<div class="objectif"> Lancer la production de ' + currentWorld.products.product[id].name + '</div>'
                                + '<div class="seuil">' + pallier.seuil + '</div>'
                            + '</div>'
                            + '<button class="btn btn-default" disabled onclick="Hire(' + id + ')" type="submit">Hire</button>'
                        + '</div>';
            $(".modal-body").append(newManager);
            
            //Gestion du bouton "hire" cliquable ou non
            if (pallier.seuil <= currentWorld.money) {
                pallier.unlocked = true; //la manager peut etre engagé
                $("#m" + id + " .btn").removeAttr("disabled");
            } else {
                $("#m" + id + " .btn ").attr("disabled", "disabled");
            }
        }
    });

}

//Engager un manager
function Hire(id) {
    $("#managersbutton .badge").text(""); // Retirer le badge "new"
    var manager = currentWorld.managers.pallier[id];

    //Mettre à jour argent disponible
    currentWorld.money = currentWorld.money - manager.seuil; //dans le document
    $("#argent").html(currentWorld.money + ' $'); //dans l'affichage

    //Mettre à jour les managers
    currentWorld.products.product[id].managerUnlocked = true; //dans le document
    ListerManager();  //dans l'affichage

    //Info bulle
    toastr.options = {"positionClass": "toast-bottom-left", "timeOut": "3000"};
    toastr.success("Manager engagé ! ");
}

//Formater les nombres (virgules, puissances etc)
function formatNumber(number) { 
    if (number < 1000) 
        number = number.toFixed(2); 
    else if (number < 1000000) 
        number = number.toFixed(0);
    else if (number >= 1000000) { 
         number = number.toPrecision(4);
         number = number.replace(/e\+(.*)/, " x 10 <sup>$1</sup>");
    } 
    return number; 
}
