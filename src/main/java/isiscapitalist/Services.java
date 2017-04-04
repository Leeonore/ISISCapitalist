package isiscapitalist;

import generated.PallierType;
import generated.ProductType;
import generated.World;
import java.io.*;
import java.util.*;
import javax.xml.bind.*;

public class Services {

    private World world;
    private JAXBContext cont;
    private Unmarshaller u;
    private Marshaller m;
    private List<Integer> quantiteAttente = new ArrayList<Integer>(Collections.nCopies(6, 0));

    /**
     * Désérialisation du XML
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
            world = (World) u.unmarshal(new File(username + "-world.xml"));
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

    /**
     * Charger le monde d'un joueur
     *
     * @param username
     * @return
     * @throws JAXBException
     * @throws FileNotFoundException
     */
    public World getWorld(String username) throws JAXBException, FileNotFoundException {
        World world = readWorldFromXml(username);
        //Update score sur le monde toussa toussa
        UpdateScore(world);
        saveWorldToXML(world, username);
        return world;
    }

    /**
     * Trouver un produit avec son ID
     *
     * @param world
     * @param productId
     * @return
     */
    public ProductType findProductById(World world, int productId) {
        List<ProductType> produits = world.getProducts().getProduct();
        for (ProductType produit : produits) {
            if (produit.getId() == productId) {
                return produit;
            }
        }
        return null;
    }

    /**
     * Trouver un manager avec son nom
     *
     * @param world
     * @param managerName
     * @return
     */
    public PallierType findManagerByName(World world, String managerName) {
        List<PallierType> managers = world.getManagers().getPallier();
        for (PallierType manager : managers) {
            if (manager.getName().equals(managerName)) {
                return manager;
            }
        }
        return null;
    }

    /**
     * Trouve un upgrade avec son nom
     *
     * @param world
     * @param UpgradeName
     * @return
     */
    public PallierType findUpgradeByName(World world, String UpgradeName) {
        List<PallierType> upgrades = world.getUpgrades().getPallier();
        for (PallierType upgrade : upgrades) {
            if (upgrade.getName().equals(UpgradeName)) {
                return upgrade;
            }
        }
        return null;
    }
    
    /* Trouve un angel avec son nom
     *
     * @param world
     * @param UpgradeName
     * @return
     */
    public PallierType findAngelByName(World world, String AngelName) {
        List<PallierType> angels = world.getAngelupgrades().getPallier();
        for (PallierType angel : angels) {
            if (angel.getName().equals(AngelName)) {
                return angel;
            }
        }
        return null;
    }

    /**
     * Mettre à jour un produit (production ou achat)
     *
     * @param username = pseudo du joueur
     * @param newproduct
     * @return false si l’action n’a pas pu être traitée
     * @throws JAXBException
     * @throws FileNotFoundException
     */
    public Boolean updateProduct(String username, ProductType newproduct) throws JAXBException, FileNotFoundException {
        World world = getWorld(username); // aller chercher le monde qui correspond au joueur
        ProductType product = findProductById(world, newproduct.getId()); // trouver dans ce monde, le produit passé en paramètre
        if (product == null) {
            return false;
        }
        int qtchange = newproduct.getQuantite() - product.getQuantite(); // calculer la variation de quantité.

        //Gestion de l'achat
        if (qtchange > 0) {// Si elle est positive, le joueur a acheté une certaine quantité
            if (product.getTimeleft() == 0) { //Si le produit n'est pas en cours de production
                // soustraire de l'argent du joueur le cout de la quantité
                world.setMoney(world.getMoney() - (product.getCout() * ((1 - Math.pow(product.getCroissance(), qtchange)) / (1 - product.getCroissance()))));
                // Mettre à jour
                product.setQuantite(product.getQuantite() + qtchange); //quantite de produit
                product.setCout(newproduct.getCout()); // cout d'un produit
            } else { // si le produit est en production
                quantiteAttente.set(product.getId() - 1, qtchange + product.getQuantite()); //stocker la quantité
            }

            //Regarder si un pallier général est atteint
            PallierType UnlocksAll = null;
            int nP = 0; //compteur du nb de produit qui ont atteint le seuil
            boolean premier = true;
            List<PallierType> unlocksAllProducts = world.getAllunlocks().getPallier();
            double seuilUnlock = unlocksAllProducts.get(0).getSeuil(); // Initialisation du seuil
            // Boucle sur les unlocks de tous les produits
            for (PallierType unlock : unlocksAllProducts) {
                if (unlock.isUnlocked() == false && premier) { //Regarder si le seuil du premier pallier bloqué est atteint
                    premier = false;
                    seuilUnlock = unlock.getSeuil(); //Va permettre de regarder si les produit ont atteint ce seuil
                    UnlocksAll = unlock; //Stock le premier unlock atteind
                }
            };
            // Regarder si un pallier est atteint pour un produit
            List<ProductType> products = world.getProducts().getProduct(); //liste des produits
            for (ProductType productUnlock : products) {
                if ((productUnlock.getQuantite()) >= seuilUnlock) { //Si le produit a atteint le seuil général
                    nP = nP + 1; //Compte le nombre de produit qui ont atteint le seuil
                }
                List<PallierType> Unlocks = product.getPalliers().getPallier();
                for (PallierType unlock : Unlocks) {
                    if (unlock.getSeuil() <= (product.getQuantite() + qtchange) && unlock.isUnlocked() == false) { // si on a atteint le pallier et qu'il n'est pas débloqué
                        unlock.setUnlocked(true);
                        UpdateBonus(product, unlock);
                    }
                };
            };
            if (nP == 6) {//Si tous les produits ont atteint un seuil général
                for (ProductType productAllUnlock : products) {// On boucle sur les produits {
                    UpdateBonus(productAllUnlock, UnlocksAll); //On applique le bonus à tous les produits
                };
            }
        } else {// sinon c’est qu’il s’agit d’un lancement de production.
            product.setTimeleft(newproduct.getVitesse()); // initialiser product.timeleft à product.vitesse
            //world.setLastupdate(System.currentTimeMillis()); //Enregistrer la date
        }
        // sauvegarder les changements du monde
        saveWorldToXML(world, username);
        return true;

    }

    /**
     * Mettre à jour un manager (achat)
     *
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

    /**
     * Appliquer l'achat d'un upgrade
     *
     * @param username
     * @param newupgrade
     * @throws JAXBException
     * @throws FileNotFoundException
     */
    public void UpdateUpgrade(String username, PallierType newupgrade) throws JAXBException, FileNotFoundException {
        World world = getWorld(username);
        PallierType upgrade = findUpgradeByName(world, newupgrade.getName());
        upgrade.setUnlocked(true);
        //Appliquer le bonus
        List<ProductType> produits = world.getProducts().getProduct();
        if (upgrade.getIdcible() > 0) { //Si upgrade concerne un produit
            ProductType product = produits.get(upgrade.getIdcible() - 1);
            UpdateBonus(product, upgrade);
        } else if (upgrade.getIdcible() == 0) { //Si upgrade concerne tous les produits
            for (ProductType product : produits) {
                UpdateBonus(product, upgrade);
            };
        } else { //Si l'upgrade concerne les anges
            UpdateBonus(null, upgrade);
        }
        world.setMoney(world.getMoney() - upgrade.getSeuil()); //Mettre à jour argent disponible
        saveWorldToXML(world, username);
    }

    public void UpdateAngel(String username, PallierType newangel) throws JAXBException, FileNotFoundException{
        World world = getWorld(username);
        PallierType angel = findAngelByName(world, newangel.getName());
        //Mettre à jour les anges actifs
            world.setActiveangels(world.getActiveangels() - angel.getSeuil());

            //Mettre à jour l'ange
            angel.setUnlocked(true); //dans le document
            List<ProductType> produits = world.getProducts().getProduct(); // Liste des produits
            //Appliquer le bonus
            if (angel.getIdcible() > 0) { //Si upgrade concerne un produit
                UpdateBonus(produits.get(angel.getIdcible() - 1), angel);
            } else if (angel.getIdcible() == 0) { //Si upgrade concerne tous les produits
                for (ProductType produit : produits) {
                    UpdateBonus(produit, angel);
                };
            }
        saveWorldToXML(world, username);
    }
    
    /**
     * Mettre à jour le score
     *
     * @param world
     */
    public void UpdateScore(World world) {
        long duree = System.currentTimeMillis() - world.getLastupdate(); //calculé durée depuis derniere mise à jour
        List<ProductType> produits = world.getProducts().getProduct();
        for (ProductType product : produits) {
            if (product.isManagerUnlocked()) { //Si manager 
                long nbProduit = duree / product.getVitesse(); //Nombre de produit créé, fini
                world.setMoney(world.getMoney() + (product.getRevenu() * product.getQuantite() * nbProduit));// Ajouter le revenu
                duree = duree % product.getVitesse(); //Calcul du temps restant
            }
            CalculScore(product, duree);
        }
        world.setLastupdate(System.currentTimeMillis()); //Enregistrer la date de la derniere mise à jour
    }

    /**
     * Calculer le score après production
     *
     * @param product
     * @param duree
     */
    public void CalculScore(ProductType product, long duree) {
        if (product.getTimeleft() == 0) {
        }//Si la production n'est pas en cours
        //Si la production est en cours
        else {
            product.setTimeleft(product.getTimeleft() - duree); //Mettre à jour le timeleft
            if (product.getTimeleft() <= 0) { //Si la production est finie
                product.setTimeleft(0); //Remettre le timeleft à 0
                double gain =(product.getRevenu() * product.getQuantite() * (1 + world.getActiveangels() * world.getAngelbonus() / 100));
                world.setMoney(world.getMoney() + gain); //Mettre à jour money
                world.setScore(world.getScore() + gain); //Mettre à jour le score
                product.setQuantite(product.getQuantite() + quantiteAttente.get(product.getId() - 1)); //Mettre à jour quantité si achat pendant production
                quantiteAttente.set(product.getId() - 1, 0); //réinitialiser
            } else if (product.getTimeleft() != 0) { //Si la production est en cours
                product.setTimeleft(product.getTimeleft() - duree); //Mettre à jour le timeleft
            }

        }
    }

    /**
     * Appliquer les bonus débloqués/achetés
     *
     * @param product
     * @param objet
     */
    public void UpdateBonus(ProductType product, PallierType objet) {
        //Si type gain
        if (objet.getTyperatio().value().equals("gain")) {
            //Mettre à jour le revenu
            product.setRevenu(product.getRevenu() * objet.getRatio());
            //Si type vitesse
        } else if (objet.getTyperatio().value().equals("vitesse")) {
            //Mettre à jour la vitesse et le timeleft
            product.setVitesse(product.getVitesse() / (int) objet.getRatio()); //la vitesse de production
            product.setTimeleft(product.getTimeleft() / (int) objet.getRatio()); //le temps restant
            // Si type ange
        } else if (world.getActiveangels() > 0) { //si il y a des anges actifs
            //On met à jour l'angel bonus
            world.setAngelbonus(world.getAngelbonus() + (int) objet.getRatio() * (int) world.getActiveangels());
        };
    }
    /**
     * Reset World pour utiliser les unlocks
     *
     * @param username
     * @param world
     * @throws JAXBException
     * @throws FileNotFoundException
     */
public void ResetWorld(String username, World world) throws JAXBException, FileNotFoundException, IOException {      
        //Enregistrer les valeurs avant de reset
        double newAngel = (Math.floor(150 * Math.sqrt(world.getScore() / Math.pow(10, 5)) - world.getTotalangels())); //Calculer anges accumuler
        double score = world.getScore();
        
        //Reset le world
            cont = JAXBContext.newInstance(World.class);
            u = cont.createUnmarshaller();;
            InputStream input = getClass().getClassLoader().getResourceAsStream("world.xml");
            World newWorld = (World) u.unmarshal(input);
            
        
        //Enregistrer les valeurs à conserver
        newWorld.setActiveangels(newAngel); //anges actifs
        newWorld.setTotalangels(newAngel); //anges totales
        newWorld.setScore(score); // score

        saveWorldToXML(newWorld, username);
    }
}
