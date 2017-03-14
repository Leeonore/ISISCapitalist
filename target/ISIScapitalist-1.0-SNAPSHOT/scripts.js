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
                                +'<button id="buyButton" class="btn btn-default" disable="false" onclick="BuyProduct(' + product + ')" type="submit">Buy x1</button>'
                                +'<div class="cout">'+ product.cout + '</div>'
                            +'</div>'
                            + '<div class="time"></div>'
                        + '</div>'
                    + '</div>';
            $("#produits").append(newProduct);
            //$(".time").countdown({until: 0, compact : true});
            // Calcul du commutateur au lancement
            commutateur = 1;
            CalcCommutateur();
            
            // Initialisation de la bar
            bars[product.id] = new ProgressBar.Line("#r"+product.id, {strokeWidth: 10, color: '#00ff00'});

        });
        
        // Gestionnaire des évenements
            // Commencer une production
            $(".logo").click(function (event) {
            id = $(this).parents(".row").attr("id").substr(1) - 1;
            StartProduction(id);
        });

            // Acheter un produit
            $(".achat").click(function (event) {
                var id = $(this).parents(".row").attr("id").substr(1) - 1;
                var product = currentWorld.products.product[id];
                BuyProduct(product);            
            });

            // Calcul score prediodiquement
            setInterval(function() { 
                calcScore();
            }, 2000); //Appeler la fonction calcScore toutes les 100ms 
    });
    
    
    //Calculer le score
    function calcScore() {
        $.each(currentWorld.products.product, function (index, product) {
            if(product.timeleft === 0){}
            else {
                product.timeleft = product.timeleft -(Date.now() - product.lastupdate);
                if (product.timeleft <=0){
                    product.timeleft = 0;
                    revenu = product.revenu * product.quantite;
                    currentWorld.money = parseInt(currentWorld.money) + revenu;
                    bars[product.id].set(0);
                    $("#argent").html(formatNumber(currentWorld.money) + ' $');
                }
            }
            if (product.managerUnlocked === true){
                StartProduction(product.id -1);
            }
            if (product.currentCout < currentWorld.money){
                document.getElementById("buyButton").disabled = true; //TODO : differencier button
            }
            //condition à faire
            $("#managersbutton .badge").text("New");
        });            
    }
    
    // Start production
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
    
    // Calcul cout
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
    
    // Mise en place du commutateur
    $("#commutateur").click(function (event) {
        commutateur += 1;
        CalcCommutateur();
    });
    
    // Calculer prix/commutateur
    function CalcCommutateur(){
        var n;
        if (commutateur < 4){            
           n = Math.pow(10,(commutateur-1));
           $.each(currentWorld.products.product, function (index, product) {             
                var cout = calculCout(product.cout,product.croissance,n);
                $("#p"+ product.id +" #buyButton").html("Buy x"+ n);
                $("#p"+ product.id +" .cout").html(formatNumber(cout));
                product.currentCout = cout;
                product.currentQuantite = n;
                
            });
            $("#commutateurButton").html("Buy </br> x " + n);
        }
        else if (commutateur >= 4) {             
            commutateur = 0;
            $.each(currentWorld.products.product, function (index, product) {
                var quantiteMax = calculQuantiteMax(product);
                var cout = calculCout(product.cout,product.croissance,quantiteMax);
                $("#p"+ product.id +" #buyButton").html("Buy x"+ quantiteMax);
                $("#p"+ product.id +" .cout").html(formatNumber(cout));
                product.currentCout = cout;
                product.currentQuantite = quantiteMax;                
            });
            $("#commutateurButton").html("Buy </br> x Max");
        }
    }
    
    //Acheter un produit
    function BuyProduct(product){
        var cout = product.currentCout;
            var quantite = product.currentQuantite;
            if (currentWorld.money >= cout){
                currentWorld.money = currentWorld.money - cout;
                product.quantite = product.quantite + quantite;
                product.cout = product.cout * Math.pow(product.croissance,quantite);
                CalcCommutateur();
                $("#argent").html(formatNumber(currentWorld.money) + ' $');
                $("#p"+ product.id + " .quantite").html(product.quantite);
            }
    }

    $("#managersbutton").click(function () {
        $("#managers").modal('show');
        //Création des managers
        ListerManager();

    });
});

function ListerManager(){
    var newManager = '';
        $.each(currentWorld.managers.pallier, function (index, pallier) {
            var id = pallier.idcible - 1;
            if (pallier.unlocked === false) {
            newManager = newManager 
                        + '<div class="row" id="m'
                        + id
                        + '">' 
                            + "<img id='logo' src='" + pallier.logo + "'/>" 
                            + '<div class="description">'
                                + '<div class="name">' + pallier.name + '</div>'
                                + '<div class="objectif"> Lancer la production de ' + currentWorld.products.product[id].name + '</div>'
                                + '<div class="seuil">' + pallier.seuil + '</div>'
                            + '</div>';
                if (pallier.seuil > currentWorld.money) {
                    newManager = newManager 
                    +'<button id="hireButton" class="btn btn-default" type="submit" disabled="disabled" >Hire</button>'
                            + '</div>';
                } else {
                    newManager = newManager 
                    +'<button id="hireButton" class="btn btn-default" onclick="Hire('
                    + id
                    + ')" type="submit">Hire</button>'
                            + '</div>';
                }
                
            }
        });
        $(".modal-body").html(newManager);
}
document.getElementById("buyButton").addEventListener("click", function(){
    document.getElementById("demo").innerHTML = "Hello World";
});

function Hire(id){
    var manager = currentWorld.managers.pallier[id];
    var prix = manager.seuil;
    currentWorld.money = currentWorld.money - prix;
    $("#argent").html(currentWorld.money + ' $');
    manager.unlocked = true;
    currentWorld.products.product[id].managerUnlocked = true;
    var toast;
    ListerManager();
    toastr.options = {"positionClass": "toast-bottom-left", "timeOut": "3000"}; 
    toastr.success("Manager Hired ! ");
}

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



