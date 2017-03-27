package isiscapitalist;

import generated.PallierType;
import generated.ProductType;
import generated.World;
import java.io.File;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.InputStream;
import java.io.OutputStream;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import javax.xml.bind.JAXBContext;
import javax.xml.bind.JAXBException;
import javax.xml.bind.Marshaller;
import javax.xml.bind.UnmarshalException;
import javax.xml.bind.Unmarshaller;

public class Services {

    private World world;
    private JAXBContext cont;
    private Unmarshaller u;
    private Marshaller m;
    private List<Integer> quantiteAttente = new ArrayList<Integer>(Collections.nCopies(6, 0));

    /** Désérialisation du XML
     *
     * @param username
     * @return
     * @throws JAXBException
     */
    public World readWorldFromXml(String username) throws JAXBException {
        try {
            cont = JAXBContext.newInstance(World.class);
            u = cont.createUnmarshaller();
        } catch (JAXBException e) {
            System.err.println(e.getMessage());
            this.world = null;
        } 
        try {
            world = (World) u.unmarshal(new File(username+"-world.xml"));
        } catch (UnmarshalException e) {
            InputStream input = getClass().getClassLoader().getResourceAsStream("world.xml");
            world = (World) u.unmarshal(input);
        }
        UpdateScore(world);
         return world;   
    }

    /**
     * Sérialisation du XML
     *
     * @param world 
     * @param username
     * @throws JAXBException
     * @throws java.io.FileNotFoundException
     */
    public void saveWorldToXML(World world, String username) throws JAXBException, FileNotFoundException {
        UpdateScore(world);
        OutputStream output = new FileOutputStream(username + "-world.xml");
        m = cont.createMarshaller();
        m.marshal(world, output);
    }
    
    /**Charger le monde d'un joueur
     * @param username
     * @return
     * @throws JAXBException
     * @throws FileNotFoundException
     */
    public World getWorld(String username) throws JAXBException, FileNotFoundException{
        World world = readWorldFromXml(username);
        //Update score sur le monde toussa toussa
        UpdateScore(world);
        saveWorldToXML(world, username);
        return world;
    }
    
    /** Trouver un produit avec son ID
     * @param world
     * @param productId
     * @return
     */
    public ProductType findProductById(World world, int productId){
        List<ProductType> produits = world.getProducts().getProduct();
        for ( ProductType produit : produits){
            if ( produit.getId()== productId){
                return produit;
            }
        }
        return null;
    }
    
    /**Trouver un manager avec son nom
     * @param world
     * @param managerName
     * @return
     */
    public PallierType findManagerByName(World world, String managerName){
        List<PallierType> managers = world.getManagers().getPallier();
        for ( PallierType manager : managers){
            if (manager.getName().equals(managerName)){
                return manager;
            }
        }
        return null;
    }
    
    /** Mettre à jour un produit (production ou achat)
     * @param username = pseudo du joueur
     * @param newproduct
     * @return false si l’action n’a pas pu être traitée 
     * @throws JAXBException
     * @throws FileNotFoundException
     */    
    public Boolean updateProduct(String username, ProductType newproduct) throws JAXBException, FileNotFoundException {
        World world = getWorld(username); // aller chercher le monde qui correspond au joueur
        ProductType product = findProductById(world, newproduct.getId()); // trouver dans ce monde, le produit passé en paramètre
        if (product == null) return false;
        
        int qtchange = newproduct.getQuantite() - product.getQuantite(); // calculer la variation de quantité.
        if (qtchange > 0) {// Si elle est positive, le joueur a acheté une certaine quantité
            if (product.getTimeleft() == 0) { //Si le produit n'est pas en cours de production
                // soustraire de l'argent du joueur le cout de la quantité
                world.setMoney(world.getMoney() - (product.getCout() * ((1 - Math.pow(product.getCroissance(), qtchange)) / (1 - product.getCroissance()))));
                // Mettre à jour
                product.setQuantite(product.getQuantite() + qtchange); //quantite de produit
                product.setCout(newproduct.getCout()); // cout d'un produit
            } else { // si le produit est en production
                quantiteAttente.set(product.getId()-1, qtchange); //stocker la quantité
            }
        } else {// sinon c’est qu’il s’agit d’un lancement de production.
            product.setTimeleft(newproduct.getVitesse()); // initialiser product.timeleft à product.vitesse
            //world.setLastupdate(System.currentTimeMillis()); //Enregistrer la date
        }
        // sauvegarder les changements du monde
        saveWorldToXML(world, username);
        return true;
        
    }

    /** Mettre à jour un manager (achat)
     * @param username
     * @param newmanager
     * @return false si l’action n’a pas pu être traitée
     * @throws JAXBException
     * @throws FileNotFoundException
     */
    public Boolean updateManager(String username, PallierType newmanager) throws JAXBException, FileNotFoundException {
        World world = getWorld(username); // aller chercher le monde qui correspond au joueur
        PallierType manager = findManagerByName(world, newmanager.getName()); // trouver dans ce monde, le manager équivalent passé en parametre
        
        if (manager == null) {
            return false;
        }
        manager.setUnlocked(true); // débloquer ce manager
        
        ProductType product = findProductById(world, manager.getIdcible()); // trouver le produit correspondant au manager
        if (product == null) {
            return false;
        }

        product.setManagerUnlocked(true); // débloquer le manager de ce produit
        world.setMoney(world.getMoney() - manager.getSeuil()); // soustraire de l'argent du joueur le cout du manager
        saveWorldToXML(world, username); // sauvegarder les changements au monde
        return true;
    }
    
    /** Mettre à jour le score
     * @param world
     */
        public void UpdateScore(World world) {
        long duree = System.currentTimeMillis() - world.getLastupdate(); //calculé durée depuis derniere mise à jour
        List<ProductType> produits = world.getProducts().getProduct();
        for (ProductType product : produits) {
            if (product.isManagerUnlocked()){ //Si manager 
                long nbProduit = duree / product.getVitesse(); //Nombre de produit créé, fini
                world.setMoney(world.getMoney() + (product.getRevenu() * product.getQuantite() * nbProduit));// Ajouter le revenu
                duree = duree % product.getVitesse(); //Calcul du temps restant
            }
                CalculScore(product, duree);
        }
    world.setLastupdate(System.currentTimeMillis()); //Enregistrer la date de la derniere mise à jour
    }
    
    public void CalculScore(ProductType product, long duree) {
        if (product.getTimeleft() == 0) {}//Si la production n'est pas en cours
        //Si la production est en cours
        else { 
            product.setTimeleft(product.getTimeleft() - duree); //Mettre à jour le timeleft
            if (product.getTimeleft() - duree <= 0) { //Si la production est finie
                product.setTimeleft(0); //Remettre le timeleft à 0
                world.setMoney(world.getMoney() + (product.getRevenu() * product.getQuantite())); //Mettre à jour money
                product.setQuantite(product.getQuantite() + quantiteAttente.get(product.getId() - 1)); //Mettre à jour quantité si achat pendant production
                quantiteAttente.set(product.getId() - 1, 0); //réinitialiser
            } else if (product.getTimeleft() != 0) { //Si la production est en cours
                product.setTimeleft(product.getTimeleft() - duree); //Mettre à jour le timeleft
            }

        }
    }
}
