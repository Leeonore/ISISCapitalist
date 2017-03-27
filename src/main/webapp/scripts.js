//Définition des variables globales
    var serveurUrl = "http://localhost:8080/ISISCapitalist/";
    var currentWorld;
    var commutateur;
    var bars = [];
    var quantiteProd = [];

//Initialisation interface
$(document).ready(function () {
    
////////////////////////////////////////////////////////////////////////////////
/////////////////////////// Initialisation joueur //////////////////////////////
////////////////////////////////////////////////////////////////////////////////
        username();

    $.getJSON(serveurUrl + "webresources/generic/World", function (world) {



////////////////////////////////////////////////////////////////////////////////
///////////////////////////// Initialisation du monde //////////////////////////
////////////////////////////////////////////////////////////////////////////////

        currentWorld = world;
        $("#nomMonde").html(currentWorld.name);
        $("#nomMonde").prepend("<img id='imageMonde' class='img-circle' src='" + currentWorld.logo + "' alt='test'/>");
        $("#argent").html(formatNumber(currentWorld.money) + ' $');
        
///////////////////////// Création des produits ////////////////////////////////
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
                                +'<span class="revenuText">' + product.quantite*product.revenu + '</span>'
                            +'</div>'
                            + '<div class="achat">'
                                +'<div class="achatQuantite"><button class="btn btn-default" disabled type="submit">Buy x1</button></div>'
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
            
            // Gestion clique achat produit
                $("#p" + product.id + " .btn").click(function () {
                    var id = $(this).parents(".ProduitPresentation").attr("id").substr(1) - 1;
                    var product = currentWorld.products.product[id];
                    BuyProduct(product);
                });
                
//////////////////Inialisation des valeurs /////////////////////////////////////
                // Initialisation de la bar de progression
                    bars[product.id] = new ProgressBar.Line("#r" + product.id, {strokeWidth: 10, color: '#00ff00'});
                    if (product.timeleft > 0) { //Replacer la barre de production si un production est en cours
                    bars[product.id].set((product.vitesse - product.timeleft) / product.vitesse);
                    bars[product.id].animate(1, {duration: product.timeleft});
                    product.lastupdate = Date.now();
                    $("#p" + product.id + " .time").countdown({
                        until: +(product.timeleft / 1000), compact: true, onExpiry: liftOff});
                    function liftOff() {
                        quantiteProd[product.id - 1] = product.quantite;
                        EndProduction(product);
                    }
                }
        });        

        // Initialisation du commutateur
            commutateur = 1;
            CalcCommutateur();
        //Initialisation des badges "new"
            InitBadgeManager();
            InitBadgeUpgrades();
            InitBadgeAnge();

/////////////////////////Gestion des events ///////////////////////////////////        
        // Gestion clique logo
            $(".logoProduit").click(function () {
                id = $(this).parents(".ProduitPresentation").attr("id").substr(1) - 1;
                product = currentWorld.products.product[id];
                //Lancer la production si elle n'est pas en cours
                if ((product.timeleft === 0) && (product.quantite>0)) {
                    StartProduction(id);
                }
            });
        
        //Gestion du curseur sur les logo
        
            
            $(".logoProduit").mouseover(function (){
                id = $(this).parents(".ProduitPresentation").attr("id").substr(1) - 1;
                if (currentWorld.products.product[id].quantite>0){
                 document.body.style.cursor = 'pointer';
             }
             });
            $(".logoProduit").mouseout(function (){
                 document.body.style.cursor = 'auto';
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
    
    //Ouvrir la fenêtre des upgrades
        $("#cashbutton").click(function () {
        $("#upgrades").modal('show');
        //Initialisation des managers
        ListerUpgrades();
    });
    
    //Ouvrir la fenêtre investor
        $("#investorbutton").click(function () {
        $("#investor").modal('show');
        //Initialisation des managers
        AfficherInvestor();
    });
    
    //Ouvrir la fenêtre des anges
        $("#angelbutton").click(function () {
        $("#anges").modal('show');
        //Initialisation des managers
        ListerAngel();
    });
});

//Fonction se lançeant toutes les 100 ms pour mettre à jour le timeleft
setInterval(function () { 
    $.each(currentWorld.products.product, function (index, product) {
        if (product.timeleft > 0) {
            product.timeleft = product.timeleft - (Date.now() - product.lastupdate); //Mettre à jour le temps restant
        }
    });
}, 100);

//////////////////////// Gestion achat et Production ///////////////////////////
    //Gestion du bouton d'achat cliquable ou non
        function GestionBuyButton(product) {
            if ((product.currentCout > currentWorld.money) || (product.currentCout === 0)) { //Si il n'a pas le budget
                $("#p" + product.id + " .btn").attr("disabled", "disabled");
            } else { //Si il a le budget, ou cout=0 (utile si quantité max=0)
                $("#p" + product.id + " .btn").removeAttr("disabled");
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
                if (product.timeleft === 0) { //Si la production n'est pas en cours
                    $("#p" + product.id + " .revenuText").html((product.revenu * product.quantite));
                }
                //Achat d'un produit coté serveur
                
            console.log(product.cout);
                sendToServer("product", product);
            }

            CalcCommutateur(); //Recaculer les prix
            GestionBuyButton(product); //Mettre à jour cliquabilité des boutons d'achat
            DebloqUnlock(); //Gerer les unlocks
        }
        
    // Start production d'un produit
        function StartProduction(id) {
            var product = currentWorld.products.product[id];
            product.timeleft = product.vitesse; //Mettre à jour le temps restant
            product.lastupdate = Date.now(); //Enregistrer la date du lancement
            //Gestion de la production coté client
            quantiteProd[id] = currentWorld.products.product[id].quantite; //on enregistre la quantité en production
            //Lancer la minuterie
            $("#p" + product.id + " .time").countdown({until: +(product.timeleft / 1000), compact: true, onExpiry: liftOff});
            //Lancer la bar d'avancement
            bars[product.id].animate(1, {duration: product.vitesse});
            CalcCommutateur();
            //Démarer la production coté serveur
            sendToServer("product", product);
            //Quand la production est finie
            function liftOff() {
                EndProduction(product);
            }
            
        }

    //Enregistrer la fin de production
        function EndProduction(product) {
            //Reinitialiser
            $("#p" + product.id + " .time").attr("class", "time"); //le minuteur
            bars[product.id].set(0);//la barre de production
            //Afficher badge si un manager est dispo mais pas engagé
            InitBadgeManager();
            // Afficher badge si upgrades débloquées
            InitBadgeUpgrades();
            product.timeleft = -1; //Mettre la fin de production en attente
            calcScore(); //Calculer le nouveau score
            CalcCommutateur(); //Mettre à jour les achats possibles
            $("#p" + product.id + " .revenuText").html((product.quantite * product.revenu)); //Mettre à jour affichage du revenu si achat pendant production
            //Lancer la production si manager activé
            if (product.managerUnlocked === true) {
                StartProduction(product.id - 1);
            }
        }
    
////////////////////////////Fonctions de calculs ///////////////////////////////

    //Calculer le score (argent ...)
        function calcScore() {
        $.each(currentWorld.products.product, function (index, product) {
            //La début est inutile avec la fonction Liftoff
            //Si la production n'est pas en cours
            //if(product.timeleft === 0){}
            //Si la production est en cours
            //else {
                //product.timeleft = product.timeleft -(Date.now() - product.lastupdate); //Mettre à jour le temps restant
                //Si la produciton est finie
                if (product.timeleft === -1){
                    //Reinitialiser
                    product.timeleft = 0; 
                    //Mettre à jour l'argent disponible
                    var gain = product.revenu*quantiteProd[product.id-1] *( 1 + currentWorld.activeangels * currentWorld.angelbonus/100);
                    currentWorld.score = currentWorld.score + (gain); //dans le score
                    currentWorld.money = currentWorld.money + (gain); //dans le document
                    $("#argent").html(formatNumber(currentWorld.money) + ' $'); //à l'affichage
                }
           // }
            //Gestion cliquabilité des boutons
            GestionBuyButton(product); 
        });  
    }
    
    // Calcul cout des produits
        function calculCout(cout, croissance,n) {
            if (n === 0) {
                return 0;
            } else {
                return cout * ((1 - Math.pow(croissance, n)) / (1 - croissance));
            }

        }

    //Calcul de quantite max
        function calculQuantiteMax(product) {
            var cout = product.cout;
            var croissance = product.croissance;
            var n = 1;
            var prix = cout;
            while (prix <= currentWorld.money) {
                n = n + 1;
                prix = calculCout(cout, croissance, n);
            }
            return n - 1;
        }

    // Calculer prix/commutateur
        function CalcCommutateur() {
            //Si on veut "max"
            if (commutateur === 0) {
                $("#commutateurButton").html("Buy </br> x Max"); // Mise à jour de l'affichage du commutateur
                $.each(currentWorld.products.product, function (index, product) {
                    //Calcul de la quantité max et du cout correspondant
                    var quantiteMax = calculQuantiteMax(product);
                    var cout = calculCout(product.cout, product.croissance, quantiteMax);
                    //Mise à jour de l'affichage
                    $("#p" + product.id + " .btn").html("Buy x" + quantiteMax);
                    $("#p" + product.id + " .cout").html(formatNumber(cout));
                    //Enregistrement des données courantes
                    product.currentCout = cout;
                    product.currentQuantite = quantiteMax;
                    //Mise à jour de la cliquabilité des boutons
                    GestionBuyButton(product);
                });
            } else {     //Si on veut 1, 10 ou 100 produits
                var n = Math.pow(10, (commutateur - 1)); //Transformation du commutateur (1,2,3) en quantité (1,10,100)
                $("#commutateurButton").html("Buy </br> x " + n); // Mise à jour de l'affichage du commutateur
                $.each(currentWorld.products.product, function (index, product) {
                    //Calcul du cout correspondant
                    var cout = calculCout(product.cout, product.croissance, n);
                    //Mise à jour de l'affichage
                    $("#p" + product.id + " .btn").html("Buy x" + n);
                    $("#p" + product.id + " .cout").html(formatNumber(cout));
                    //Enregistrement des données courantes
                    product.currentCout = cout;
                    product.currentQuantite = n;
                    //Mise à jour de la cliquabilité des boutons
                    GestionBuyButton(product);
                });
            }
        }
        
////////////////////////////////////////////////////////////////////////////////
/////////////////////////// Fenetres modales ///////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

//////////////////Gestion des badges sur les boutons menu///////////////////////
    //Badges "new" sur les upgrades
        function InitBadgeUpgrades() {
            $.each(currentWorld.upgrades.pallier, function (index, pallier) {
                //Si il a l'argent nécessaire mais que le manager n'est pas engagé
                if ((pallier.seuil <= currentWorld.money) && (pallier.unlocked === false)) {
                    $("#cashbutton .badge").text("New");
                }
            });
        } 
        
     //Badges "new" sur les anges
        function InitBadgeAnge() {
            $.each(currentWorld.angelupgrades.pallier, function (index, ange) {
                //Si il a assez d'ange et que le manager n'est pas engagé
                if ((ange.seuil <= currentWorld.activeangels) && (ange.unlocked === false)) {
                    $("#angelbutton .badge").text("New");
                }
            });
        }
    
    //Badges "new" sur les managers
        function InitBadgeManager() {
            $.each(currentWorld.managers.pallier, function (index, pallier) {
                //Si il a l'argent nécessaire mais que le manager n'est pas engagé
                if ((pallier.seuil <= currentWorld.money) && (currentWorld.products.product[pallier.idcible - 1].managerUnlocked === false)) {
                    $("#managersbutton .badge").text("New");
                }
            });
        }

////////////////////// Afficher les fenêtres modales ///////////////////////////
    //Initialisation de la liste des unlocks
        function ListerUnlock(){
            var newUnlocks;
            $(".modal-body #UnlockAll").html("");
            $(".modal-body #UnlockProduct").html("");
            // LISTE DES UNLOCKS DE TOUT PRODUIT OU ANGE
            $.each(currentWorld.allunlocks.pallier, function (index, unlock) {
                var n=0;
                if (unlock.unlocked === false) { //si le unlock n'est pas en service
                    n=n+1;
                    //Affichage des 6ers unlocks
                    if (n <=6){ 
                    newUnlocks = '<div class="row" id="u' + unlock.id + '">'
                                    + "<img class='logo' src='" + unlock.logo + "'/>"
                                    + '<div class="description">'
                                        + '<div class="name">' + unlock.name + '</div>'
                                        + '<div class="seuil">' + unlock.seuil + '</div>'
                                        + '<div class="objectif">' + unlock.typeratio + " x"+ unlock.ratio +  '</div>'
                                    + '</div>'
                                + '</div>';
                        $(".modal-body #UnlockAll").append(newUnlocks);
                    }
                }
            });
            //LISTE DES UNLOCKS PAR PRODUIT
            $.each(currentWorld.products.product, function (index, product) {
                var premier = true;
                $.each(product.palliers.pallier, function (index, pallier) {

                    if (pallier.unlocked === false && premier) { //si le unlock est le premier pas en service
                     //Pour afficher uniquement le 1er unlock
                            premier = false;
                            newUnlocks = '<div class="row" id="u' + product.id + '">'
                                            + "<img class='logo' src='" + product.logo + "'/>"
                                            + '<div class="description">'
                                                + '<div class="name">' + pallier.name + '</div>'
                                                + '<div class="seuil">' + pallier.seuil + '</div>'
                                                + '<div class="objectif">'+ pallier.typeratio + " x" + pallier.ratio + " sur " + product.name +'</div>'
                                            + '</div>'
                                        + '</div>';
                            $(".modal-body #UnlockProduct").append(newUnlocks);
                    }
                });
            });
        }

    //Initialisation de la liste des Cash upgrades
        function ListerUpgrades() {
            var newUpgrades;
            var n=1;
            $("#upgrades .modal-body").html("");
            $.each(currentWorld.upgrades.pallier, function (index, upgrade) {
                if (upgrade.unlocked === false && n<=6) { //si l'upgrade n'est pas acheté et les 6ers
                    //Enregistrer la cible de l'upgrade
                    var cible;
                    if (upgrade.idcible>0){cible = currentWorld.products.product[upgrade.idcible -1].name;} 
                    else if (upgrade.idcible ===0){cible = "tous les produits";} 
                    else{cible = "les anges";}
                    //Affichage des upgrades
                    newUpgrades = '<div class="row" id="c' + n + '">'
                                    + "<img class='logo' src='" + upgrade.logo + "'/>"
                                    + '<div class="description">'
                                        + '<div class="name">' + upgrade.name + '</div>'
                                        + '<div class="seuil">' + upgrade.seuil + '</div>'
                                        + '<div class="objectif">' + upgrade.typeratio + " x" + upgrade.ratio + " sur " + cible +'</div>'
                                    + '</div>'
                                    + '<button class="btn btn-default" disabled type="submit">Buy</button>'
                                + '</div>';
                    $("#upgrades .modal-body").append(newUpgrades);
                    //Gestion du clique sur le bouton, pas fait directement dans le bouton car refus d'un parametre de type objet
                    $("#c" + n + " .btn ").click(function () {
                        BuyUpgrades(upgrade);
                    });
                    //Gestion du bouton "buy" cliquable ou non
                    if (upgrade.seuil <= currentWorld.money) {
                        $("#c" + n + " .btn ").removeAttr("disabled");
                    } else {
                        $("#c" + n + " .btn ").attr("disabled", "disabled");
                    }
                    n=n+1;
                }
            });
            $("#cashbutton .badge").text("");
        }

    //Initialisation de la liste des anges
        function ListerAngel(){
            var newAnge;
            var n=1;
            $("#anges .modal-body").html("");
            $.each(currentWorld.angelupgrades.pallier, function (index, ange) {
                    //Affichage des ange
                    if (ange.unlocked === false && n<=5)
                    newAnge = '<div class="row" id="a' + n + '">'
                                    + "<img class='logo' src='" + ange.logo + "'/>"
                                    + '<div class="description">'
                                        + '<div class="name">' + ange.name + '</div>'
                                        + '<div class="seuil">' + ange.seuil + '</div>'
                                    + '</div>'
                                    + '<button class="btn btn-default" disabled type="submit">Buy !</button>'
                                + '</div>';
                $("#anges .modal-body").append(newAnge);
                    //Gestion du clique sur le bouton, pas fait directement dans le bouton car refus d'un parametre de type objet
                    $("#a" + n + " .btn ").click(function () {
                        BuyAngel(ange);
                    });
                    //Gestion du bouton "buy" cliquable ou non
                    if (ange.seuil <= currentWorld.activeangels) {
                        //l'ange peut etre acheté
                        $("#a" + n + " .btn ").removeAttr("disabled");
                    } else {
                        $("#a" + n + " .btn ").attr("disabled", "disabled");
                    }
                    n=n+1;
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
                        $("#m" + id + " .btn ").removeAttr("disabled");
                    } else {
                        $("#m" + id + " .btn ").attr("disabled", "disabled");
                    }
                }
            });
            $("#managersbutton .badge").text(""); //enlever le badge
        }
        
    //Initialisation de la fênetre Investor
        function AfficherInvestor() {
            $(".TotalAngel").html(currentWorld.totalangels + "Total angels");
            $(".BonusAngel").html(currentWorld.angelbonus + "% Bonus par ange");
            var angel = Math.floor(150 * Math.sqrt(currentWorld.score / Math.pow(10, 5)) - currentWorld.totalangels);
            $("#investor .modal-body").append('<button class="btn btn-default" onclick="ResetWorld()" type="submit">' + angel + ' angels </br> Restart pour les utiliser.</button>');
        }

///////////// Gestion action client dans les fenêtres modales //////////////////
    //Debloquage automatique des unlocks
        function DebloqUnlock() {
            //Regarder si un pallier général est atteint
            var seuilUnlock;
            var UnlockAll;
            var premier = true;
            var nP = 0; //va permettre de compter le nb de produit qui ont atteint le seuil
            $.each(currentWorld.allunlocks.pallier, function (index, unlock) {
                if ((unlock.unlocked === false) && premier) { //Regarder si le seuil du premier pallier bloqué est atteint
                    premier = false;
                    seuilUnlock = unlock.seuil; //Va permettre de regarder si les produit on atteint le seuil
                    UnlockAll = unlock;
                }
            });
            // Regarder si un pallier est atteint pour un produit
            $.each(currentWorld.products.product, function (index, product) {
                if (product.quantite >= seuilUnlock) {
                    nP = nP + 1;
                }//Compte le nombre de produit qui a atteind le seuil
                $.each(product.palliers.pallier, function (index, unlock) {
                    if ((unlock.seuil <= product.quantite) && ((unlock.unlocked === false))) { // si on a atteint le pallier et qu'il n'est pas débloqué
                        unlock.unlocked = true;
                        ApplicBonus(unlock, product);
                        toastr.success("Unlock " + unlock.typeratio + " débloqué sur " + product.name);
                    }
                });
            });
            if (nP === 6) {//Si tous les produits ont atteind le seuil
                $.each(currentWorld.products.product, function (index, product) {
                    ApplicBonus(UnlockAll, product);
                }); //On applique le bonus à tous les produits
                toastr.success("Unlock " + UnlockAll.typeratio + " débloqué sur tous les produits");
            }

        }
    
    //Acheter un upgrades
        function BuyUpgrades(upgrade) {
            upgrade.unlocked = true;
            //Appliquer le bonus
            if (upgrade.idcible > 0) { //Si upgrade concerne un produit
                product = currentWorld.products.product[upgrade.idcible - 1];
                ApplicBonus(upgrade, product);
            } else if (upgrade.idcible === 0) { //Si upgrade concerne tous les produits
                $.each(currentWorld.products.product, function (index, product) {
                    ApplicBonus(upgrade, product);
                });
            } else { //Si l'upgrade concerne les anges
                ApplicBonus(upgrade, null);
            }
            //Mettre à jour argent disponible
            currentWorld.money = currentWorld.money - upgrade.seuil; //dans le document

            $("#argent").html(formatNumber(currentWorld.money) + ' $'); //dans l'affichage
            // Mise à jour
            ListerUpgrades(); //de l'affichage
            InitBadgeUpgrades(); //du badge
        }
        
    //Acheter dans fenêtre Ange Upgrades
        function BuyAngel(ange) {
            $("#angelbutton .badge").text(""); // Retirer le badge "new"

            //Mettre à jour les anges actifs
            currentWorld.activeangels = currentWorld.activeangels - ange.seuil;

            //Mettre à jour les managers
            ange.unlocked = true; //dans le document
            ListerAngel();  //dans l'affichage

            //Appliquer le bonus
            if (ange.idcible > 0) { //Si upgrade concerne un produit
                produit = currentWorld.products.product[ange.idcible - 1];
                ApplicBonus(ange, product);
            } else if (ange.idcible === 0) { //Si upgrade concerne tous les produits
                $.each(currentWorld.products.product, function (index, product) {
                    ApplicBonus(ange, product);
                });
            }
        }
    
    //Engager un manager
        function Hire(id) {
            $("#managersbutton .badge").text(""); // Retirer le badge "new"
            var manager = currentWorld.managers.pallier[id];

            //Mettre à jour argent disponible
            currentWorld.money = currentWorld.money - manager.seuil; //dans le document
            $("#argent").html(formatNumber(currentWorld.money) + ' $'); //dans l'affichage

            //Mettre à jour les managers
            currentWorld.products.product[id].managerUnlocked = true; //dans le document
            ListerManager();  //dans l'affichage

            if (currentWorld.products.product[id].quantite > 0) {
                StartProduction(id); //Lancer la production du produit
            }

            //Achat du manager coté serveur
            sendToServer("manager", manager);

            //Info bulle
            toastr.options = {"positionClass": "toast-bottom-left", "timeOut": "3000"};
            toastr.success("Manager engagé ! ");
        }
        
    //ResertWorld dans fenêtre Investor
        function ResetWorld() {
        //    $.ajax(serveurUrl + "webresources/generic/world", {type: "DELETE", statusCode: {304: function () {
        //                syncError("Echec du reset");
        //            }}, error: function () {
        //            syncError("Echec de la requete");
        //        }}).done(function () {
        //        location.reload();
        //    });
            window.location.reload();
        }
        
    //Application des bonus débloqués ou acheté
        function ApplicBonus(objet, product) {
            //Si type gain
                if (objet.typeratio === 'GAIN') { 
                    //Mettre à jour le revenu
                    product.revenu = product.revenu * objet.ratio; //Dans le xml
                    $("#p" + product.id + " .revenuText").html((product.revenu * product.quantite)); //dans l'affichage
            //Si type vitesse
                } else if (objet.typeratio === 'VITESSE') {
                    //Mettre à jour la vitesse et le timeleft
                        product.vitesse = product.vitesse / objet.ratio; //la vitesse de production
                        product.timeleft = product.timeleft / objet.ratio; //le temps restant
                    //Adapter affichage
                        //La barre de progression
                        bars[product.id].animate(1, {duration: product.timeleft});
                        //Adapter le miniteur
                        $("#p" + product.id + " .time").attr("class", "time");
                        $("#p" + product.id + " .time").countdown({until: +(product.timeleft / 1000), compact: true, onExpiry: liftOff});
                        function liftOff() {
                            EndProduction(product);
                        }
            // Si type ange
                } else {
                    if (currentWorld.activeangels > 0) { //si il y a des anges actifs
                        //On met à jour l'angel bonus
                        currentWorld.angelbonus = currentWorld.angelbonus + objet.ratio * currentWorld.activeangels;                        
                    }
                }
        }
        
////////////////////////////////////////////////////////////////////////////////        
///////////////////////////// Fonctions supports ///////////////////////////////
////////////////////////////////////////////////////////////////////////////////
    //Gestion du nom d'utilisateur :
        function username(){
    var username;
        if (localStorage.getItem("username") !== "") { //Si il y a un username
            username = localStorage.getItem("username");
            $('#TextUser').val(username); //On l'affiche dans la zone de texte
        }else { //Si il n'y a pas d'username
            username = "Poney" + Math.floor(Math.random() * 10000); //On en crée un au hazard
            localStorage.setItem("username", username); //On l'affiche dans la zone de texte
        }
        $("#TextUser").change(function () { //Si on change l'username
                var username = $(this).val(); //On récupère le nom
                localStorage.setItem("username", username); //on l'enregistre
                window.location.reload(); //on recharge le monde
            });
        //On l'ajoute à l'entête pour la communication avec le seveur
        $.ajaxSetup({
            headers: {"X-user": username}
        });
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

    //Envoyer les infos au serveurs
        function sendToServer(type, content) {
            $.ajax(serveurUrl + "webresources/generic/" + type, {
                type: "PUT",
                contentType: "application/json",
                data: JSON.stringify(content),
                statusCode: {
                    304: function () {
        // Action non prise en compte
        console.error("L'action n'a pas été prise en compte");
                    }
                },
                error: function () {
        // echec de la requête
        console.error("La requête a échouée");
                }
            });
        }