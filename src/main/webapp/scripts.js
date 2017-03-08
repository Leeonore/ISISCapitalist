//Script pour récuperer infos
var serveurUrl = "http://localhost:8080/ISIScapitalist/";
var currentWorld;
var items;
$(document).ready(function () {
    $.getJSON(serveurUrl + "webresources/generic", function (world) {
        currentWorld = world;
        $("#nomMonde").html(currentWorld.name);
        $("#nomMonde").prepend("<img id='imageMonde' src='" + currentWorld.logo + "' alt='test'/>");
        $("#argent").html(currentWorld.money + ' $');
        // $("#joueur").html(currentWorld.);
        // (nom du monde, argent total....)
        // puis boucler sur chaque produit
        $.each(world.products.product, function (index, product) {
            var newProduct =  
                    '<div class="row">' 
                        + '<div class="cln1">'
                            + "<img src='" + product.logo + "' alt='test'/>" 
                            + '<div class="quantite">'+ product.quantite + '</div>'
                        + '</div>'
                        + '<div class="cln2">'
                            + '<div class="revenu">'+ product.revenu + '</div>' 
                            + '<div class="cout">'+ product.cout + '</div>'
                            + '<div class="vitesse">'+ product.vitesse + '</div>'
                        + '</div>'
                    + '</div>';
            $("#produits").append(newProduct);
//            $("#produits").append('<div class="row">');
//       //     $("#produits").append('<div class="nom">' + product.name + '</div>');
//            $("#produits").append("<img src='" + product.logo + "' alt='test'/>");
//            $("#produits").append('<div class="revenu">'+ product.revenu + '</div>');
//            $("#produits").append('<div class="cout">'+ product.cout + '</div>');
//            $("#produits").append('<div class="vitesse">'+ product.vitesse + '</div>');
//            $("#produits").append('<div class="quantite">'+ product.quantite + '</div>');
//            $("#produits").append('</div>');            
        });
    });
});