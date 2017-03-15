//Définition des variables globales
    var serveurUrl = "http://localhost:8080/ISISCapitalist/";
    var currentWorld;
    var commutateur;
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
                    '<div class="ProduitPresentation" id="p' + product.id + '">' 
                        + '<div class="product">'
                            + '<div class="logoProduit">'
                                + "<img src='" + product.logo + "' alt='test'/>" 
                            + '</div>'
                            + '<div class="quantite">'+ product.quantite + '</div>'
                        + '</div>'
                        + '<div class="description">'
                            + '<div class="revenu" id="r' + product.id + '">'
                                +'<span class="revenuText">0</span>'
                            +'</div>'
                            + '<div class="achat">'
                                +'<div class="achatQuantite"><button class="btn btn-default" disabled onclick="BuyProduct(' + product + ')" type="submit">Buy x1</button></div>'
                                +'<div class="cout">'+ product.cout + '</div>'
                            +'</div>'
                            + '<div class="time"></div>'
                        + '</div>'
                    + '</div></br>';
            if (product.id <=3){
                $("#produits1").append(newProduct);
            }else{
                $("#produits2").append(newProduct);
            }
          
            //Inialisation
                // Calcul du commutateur au lancement
                commutateur = 1;
                CalcCommutateur();
                // Initialisation de la bar
                bars[product.id] = new ProgressBar.Line("#r" + product.id, {strokeWidth: 10, color: '#00ff00'});
                //Calcul du score
                    calcScore();

            // Acheter un produit
            $("#p" + product.id + " .btn").click(function () {
                var id = $(this).parents(".ProduitPresentation").attr("id").substr(1) - 1;
                var product = currentWorld.products.product[id];
                BuyProduct(product);
            });
        });

        // Gestion clique logo
        $(".logoProduit").click(function () {
            id = $(this).parents(".ProduitPresentation").attr("id").substr(1) - 1;
            StartProduction(id);
        });
    });
    
    //Gestion clique du commutateur
    $("#commutateur").click(function () {
        if (commutateur === 3){
            commutateur = 0;
        }else{
        commutateur += 1;
        }
        CalcCommutateur();
    });
    
    //Ouvrir la fenêtre des managers
    $("#managersbutton").click(function () {
        $("#managers").modal('show');
        //Initialisation des managers
        ListerManager();
    });
    
    //Ouvrir la fenêtre des unlock
    $("#unlocksbutton").click(function () {
        $("#unlocks").modal('show');
        //Initialisation des managers
        ListerUnlock();
    });
    

});

//Calculer le score (argent ...)
function calcScore() {
    $.each(currentWorld.products.product, function (index, product) {
        //Si la production n'est pas en cours
        if(product.timeleft === 0){}
        //Si la production est en cours
        else {
            product.timeleft = product.timeleft -(Date.now() - product.lastupdate); //Mettre à jour le temps restant
            //Si la produciton est finie
            if (product.timeleft <=0){
                //Reinitialiser
                product.timeleft = 0; 

                //Mettre à jour l'argent disponible
                currentWorld.money = parseInt(currentWorld.money) + (product.revenu*product.quantite); //dans le document
                $("#argent").html(formatNumber(currentWorld.money) + ' $'); //à l'affichage
            }
        }
        

        //Gestion cliquabilité des boutons
        GestionBuyButton(product); 
    });  
}

// Start production d'un produit
function StartProduction(id){
        var product = currentWorld.products.product[id];
        product.timeleft = product.vitesse; //Mettre à jour le temps restant
        product.lastupdate = Date.now(); //Enregistrer la date du lancement
        
        if (currentWorld.products.product[id].quantite > 0){ //si on peut produire
            //Lancer la minuterie
            $("#p"+ product.id +" .time").countdown({
                until: + (product.timeleft/1000), compact: true, onExpiry: liftOff});
            
            //Lancer la bar d'avancement
            bars[product.id].animate(1, {duration: product.vitesse});
            CalcCommutateur();
        
            //Quand la production est finie
            function liftOff() {
                //Reinitialiser
                $("#p"+ product.id +" .time").attr("class", "time"); //le minuteur
                bars[product.id].set(0);//la barre de production
                
                //Afficher badge si un manager est dispo mais pas engagé
                InitBadge();
                product.timeleft =-1; //Mettre la fin de production en attente
                calcScore(); //Calculer le nouveau score
                CalcCommutateur(); //Mettre à jour les couts
                //Lancer la production si manager activé
                if (product.managerUnlocked === true) {
                StartProduction(product.id - 1);
            }
            }
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
    //Si on veut "max"
    if (commutateur === 0) {
        $("#commutateurButton").html("Buy </br> x Max"); // Mise à jour de l'affichage du commutateur
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
    }else{     //Si on veut 1, 10 ou 100 produits
       var n = Math.pow(10,(commutateur-1)); //Transformation du commutateur (1,2,3) en quantité (1,10,100)
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
        $("#p" + product.id + " .revenuText").html((product.revenu * product.quantite));
    }
    CalcCommutateur(); //Recaculer les prix
    GestionBuyButton(product); //Mettre à jour cliquabilité des boutons d'achat
}

//Gestion du bouton d'achat cliquable ou non
function GestionBuyButton(product){
    if ((product.currentCout > currentWorld.money) || (product.currentCout ===0)) { //Si il n'a pas le budget
        $("#p" + product.id + " .btn").attr("disabled", "disabled");
    }else{ //Si il a le budget, ou cout=0 (utile si quantité max=0)
        $("#p" + product.id + " .btn").removeAttr("disabled");
   }    
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

//Afficher "new" lorsqu'un nouveau manager est disponible
function InitBadge() {
    $.each(currentWorld.managers.pallier, function (index ,pallier) {
        //Si il a l'argent nécessaire mais que le manager n'est pas engagé
        if ((pallier.seuil <= currentWorld.money) && (currentWorld.products.product[pallier.idcible - 1].managerUnlocked === false)) {
            $("#managersbutton .badge").text("New");
        }
    });
}

//Initialisation de la liste des managers
function ListerManager() {
    var newManager;
    $("#managers .modal-body").html("");
    $.each(currentWorld.managers.pallier, function (index, pallier) {
        var id = pallier.idcible - 1;
        if (currentWorld.products.product[id].managerUnlocked === false) { //si le manager n'est pas en service
            //Affichage des managers
            newManager = '<div class="row" id="m' + id + '">'
                            + "<img class='logo' src='" + pallier.logo + "'/>"
                            + '<div class="description">'
                                + '<div class="name">' + pallier.name + '</div>'
                                + '<div class="objectif"> Lancer la production de ' + currentWorld.products.product[id].name + '</div>'
                                + '<div class="seuil">' + pallier.seuil + '</div>'
                            + '</div>'
                            + '<button class="btn btn-default" disabled onclick="Hire(' + id + ')" type="submit">Hire</button>'
                        + '</div>';
            $("#managers .modal-body").append(newManager);
            
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
    StartProduction(id); //Lancer la production du produit

    //Info bulle
    toastr.options = {"positionClass": "toast-bottom-left", "timeOut": "3000"};
    toastr.success("Manager engagé ! ");
}

//Initialisation de la liste des unlocks
function ListerUnlock(){
    var newUnlocks;
    $(".modal-body #UnlockAll").html("");
    $(".modal-body #UnlockProduct").html("");
    $.each(currentWorld.allunlocks.pallier, function (index, unlock) {
        var id = unlock.idcible - 1;
        if (unlock.unlocked === false) { //si le unlock n'est pas en service
            //Affichage des unlocks
            cible = currentWorld.products.product[id];
            newUnlocks = '<div class="row" id="u' + id + '">'
                            + "<img class='logo' src='" + cible.logo + "'/>"
                            + '<div class="description">'
                                + '<div class="name">' + unlock.name + '</div>'
                                + '<div class="seuil">' + unlock.seuil + '</div>'
                                + '<div class="objectif">' + cible.name +" "+ cible.palliers.pallier[id].typeratio + " x"+ cible.palliers.pallier[id].ratio +  '</div>'
                            + '</div>'
                        + '</div>';
            $(".modal-body #UnlockAll").append(newUnlocks);
        }
    });
        $.each(currentWorld.products.product, function (index, product) {
            $.each(product.palliers.pallier, function (index, pallier){
        if (pallier.unlocked === false) { //si le unlock n'est pas en service
            //Affichage des unlocks du produit
            newUnlocks = '<div class="row" id="u' + product.id + '">'
                            + "<img class='logo' src='" + product.logo + "'/>"
                            + '<div class="description">'
                                + '<div class="name">' + pallier.name + '</div>'
                                + '<div class="seuil">' + pallier.seuil + '</div>'
                                + '<div class="objectif">' + product.name +" "+ pallier.typeratio + " x"+ pallier.ratio +  '</div>'
                            + '</div>'
                        + '</div>';
            $(".modal-body #UnlockProduct").append(newUnlocks);
        }
            });
    });
}