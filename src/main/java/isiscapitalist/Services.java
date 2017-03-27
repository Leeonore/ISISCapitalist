package isiscapitalist;

import generated.PallierType;
import generated.ProductType;
import generated.World;
import java.io.File;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.InputStream;
import java.io.OutputStream;
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

    /**
     * Déserialisation du XML
     *
     * @return objet World
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
         return world;   
    }

    /**
     * Sérialisation du XML
     *
     * @param world
     * @param username
     * @throws JAXBException
     */
    public void saveWorldToXML(World world, String username) throws JAXBException, FileNotFoundException {
        OutputStream output = new FileOutputStream(username + "-world.xml");
        m = cont.createMarshaller();
        m.marshal(world, output);
    }
    
    public World getWorld(String username) throws JAXBException, FileNotFoundException{
        World world = readWorldFromXml(username);
        //Update score sur le monde toussa toussa
        saveWorldToXML(world, username);
        return world;
    }
    
    public ProductType findProductById(World world, int productId){
        List<ProductType> produits = world.getProducts().getProduct();
        for ( ProductType produit : produits){
            if ( produit.getId()== productId){
                return produit;
            }
        }
        return null;
    }
    
    public PallierType findManagerByName(World world, String managerName){
        List<PallierType> managers = world.getManagers().getPallier();
        for ( PallierType manager : managers){
            if (manager.getName().equals(managerName)){
                return manager;
            }
        }
        return null;
    }
	
//} // Alex, commente cette accolade

////////////////////////Partie pour Alex //////////////////////////////////////////////////////


// prend en paramètre le pseudo du joueur et le produit
// sur lequel une action a eu lieu (lancement manuel de production ou
// achat d’une certaine quantité de produit)
// renvoie false si l’action n’a pas pu être traitée 
    
    public Boolean updateProduct(String username, ProductType newproduct) throws JAXBException, FileNotFoundException {
// aller chercher le monde qui correspond au joueur
        World world = getWorld(username);
// trouver dans ce monde, le produit équivalent à celui passé
// en paramètre
        ProductType product = findProductById(world, newproduct.getId());
        if (product == null) {
            return false;
        }
// calculer la variation de quantité. Si elle est positive c'est
// que le joueur a acheté une certaine quantité de ce produit
// sinon c’est qu’il s’agit d’un lancement de production.
        int qtchange = newproduct.getQuantite() - product.getQuantite();
        if (qtchange > 0) {
            product.setQuantite(product.getQuantite() + qtchange);
// soustraire de l'argent du joueur le cout de la quantité
// achetée et mettre à jour la quantité de product
        } else {
// initialiser product.timeleft à product.vitesse
// pour lancer la production
        }
// sauvegarder les changements du monde
        saveWorldToXML(world, username);
        return true;
    }

// prend en paramètre le pseudo du joueur et le manager acheté.
// renvoie false si l’action n’a pas pu être traitée
    public Boolean updateManager(String username, PallierType newmanager) throws JAXBException, FileNotFoundException {
// aller chercher le monde qui correspond au joueur
        World world = getWorld(username);
// trouver dans ce monde, le manager équivalent à celui passé
// en paramètre
        PallierType manager = findManagerByName(world, newmanager.getName());
        if (manager == null) {
            return false;
        }
        
        // débloquer ce manager
        manager.setUnlocked(true);
// trouver le produit correspondant au manager
ProductType product = findProductById(world, manager.getIdcible());
        if (product == null) {
            return false;
        }
// débloquer le manager de ce produit
        product.setManagerUnlocked(true);
// soustraire de l'argent du joueur le cout du manager
        world.setMoney(world.getMoney() - manager.getSeuil());
// sauvegarder les changements au monde
        saveWorldToXML(world, username);
        return true;
    }
}
