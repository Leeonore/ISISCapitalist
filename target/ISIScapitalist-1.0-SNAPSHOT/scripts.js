//Script pour récuperer infos
var serveurUrl = "http://localhost:8080/ISISCapitalist/";
var currentWorld;
var items;
var lastupdate;
var bar;
var vitesse;
var commutateur = 1;
var bars = [];
$(document).ready(function () {
    $.getJSON(serveurUrl + "webresources/generic", function (world) {
        
        // Init world
        currentWorld = world;
        $("#nomMonde").html(currentWorld.name);
        $("#nomMonde").prepend("<img id='imageMonde' src='" + currentWorld.logo + "' alt='test'/>");
        $("#argent").html(currentWorld.money + ' $');
        
        // Creating products
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
                            + '<div class="revenu" id="r'
                            + product.id
                            + '"><span class="revenuText">'+ product.revenu + '</span></div>' 
                            + '<div class="achat"><div class="achatQuantite">x1</div><div class="cout">'+ product.cout + '</div></div>'
                            + '<div class="vitesse">'+ product.vitesse + '</div>'
                        + '</div>'
                    + '</div>';
            $("#produits").append(newProduct);
            
            // Calcul commutateur
            commutateur = 1;
            CalcCommutateur();
            
            // Init progress bar
            bars[product.id] = new ProgressBar.Line("#r"+product.id, {strokeWidth: 10, color: '#00ff00'});

        });
        
        // Event handler
        // Start production
        $(".logo").click(function (event) {
            id = $(this).parents(".row").attr("id").substr(1) - 1;
            StartProduction(id);
        });
     
        // Buy product
        $(".achat").click(function (event) {
            let id = $(this).parents(".row").attr("id").substr(1) - 1;
            let product = currentWorld.products.product[id];
            let cout = product.currentCout;
            let quantite = product.currentQuantite;
            if (currentWorld.money >= cout){
                currentWorld.money = Math.round((currentWorld.money - cout)*100)/100;
                product.quantite = product.quantite + quantite;
                product.cout = Math.round((product.cout * Math.pow(product.croissance,quantite))*100)/100;
                CalcCommutateur();
                $("#argent").html(currentWorld.money + ' $');
                $("#p"+ product.id + " .quantite").html(product.quantite);
            }            
        });
        
        // Finally, start loop
        setInterval(function() { calcScore(); }, 2000); //Appeler la fonction calcScore toutes les 100ms 
    });
    
    
    //Calculer le score
    function calcScore() {
        $.each(currentWorld.products.product, function (index, product) {
            if(product.timeleft === 0){ 

            }
            else {
                console.log(product.timeleft);
                product.timeleft = product.timeleft -(Date.now() - product.lastupdate);  
                if (product.timeleft <=0){
                    product.timeleft = 0;
                    currentWorld.money = Math.round((currentWorld.money + product.revenu*product.quantite)*100)/100;
                    bars[product.id].set(0);
                    $("#argent").html(currentWorld.money + ' $');
                }
            }
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
            }
        }
    
    // Calcul cout
    function calculCout(cout, croissance, n){
        if(n === 1){
            return cout;
        }else if(n === 0){
            return 0;
        }else{
            return Math.round((cout * ((1 - Math.pow(croissance,n+1))/(1-croissance)))*100)/100;
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
        
    function CalcCommutateur(){
        let n;
        if (commutateur < 4){            
           n = Math.pow(10,commutateur-1);
           $.each(currentWorld.products.product, function (index, product) {             
                let cout = calculCout(product.cout,product.croissance,n);
                $("#p"+ product.id +" .achatQuantite").html("x"+ n);
                $("#p"+ product.id +" .cout").html(cout);
                product.currentCout = cout;
                product.currentQuantite = n;
            });
        }
        else if (commutateur >= 4) {             
            commutateur = 0;
            $.each(currentWorld.products.product, function (index, product) {
                let quantiteMax = calculQuantiteMax(product);
                let cout = calculCout(product.cout,product.croissance,quantiteMax);
                $("#p"+ product.id +" .achatQuantite").html("x"+ quantiteMax);
                $("#p"+ product.id +" .cout").html(cout);
                product.currentCout = cout;
                product.currentQuantite = quantiteMax;                
            });
        }
        $("#commutateur").html("<img src='icones/commutateur" + commutateur + ".png' alt='test'/>");
    }
});
