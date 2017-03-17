package isiscapitalist;

import generated.PallierType;
import generated.ProductType;
import generated.World;
import java.io.File;
import java.io.InputStream;
import java.util.HashSet;
import javax.xml.bind.JAXBContext;
import javax.xml.bind.JAXBException;
import javax.xml.bind.Marshaller;
import javax.xml.bind.Unmarshaller;

public class Services {

    private World world;
    private JAXBContext cont;
    private Unmarshaller u;
    private Marshaller m;
    private final HashSet<String> hset = new HashSet<>();

    /**
     * Déserialisation du XML
     *
     * @return objet World
     * @throws JAXBException
     */
    
    
    
    public World readWorldFromXml(String username) throws JAXBException {
        String pseudo = "world.xml";
        if ( hset.contains(username)) {
            pseudo = username + "-" + pseudo;
        } 
        else { hset.add(username);
        }
        try {
            cont = JAXBContext.newInstance(World.class);
            u = cont.createUnmarshaller();
            InputStream input = getClass().getClassLoader().getResourceAsStream(pseudo);
            world = (World) u.unmarshal(input);
        } catch (JAXBException e) {
            System.err.println(e.getMessage());
        } catch (NullPointerException e) {
            System.err.println(e.getMessage());
        }
        return (world);
    }

    /**
     * Sérialisation du XML
     *
     * @param world
     * @throws JAXBException
     */
    public void saveWorldToXML(World world, String username) throws JAXBException {
        try {
            m = cont.createMarshaller();
            m.marshal(world, new File(username + "-" + "world.xml"));
        } catch (JAXBException e) {
            System.err.println(e.getMessage());
        } catch (NullPointerException e) {
            System.err.println(e.getMessage());
        }
    }
	
} // Alex, commente cette accolade

////////////////////////Partie pour Alex //////////////////////////////////////////////////////


//// prend en paramètre le pseudo du joueur et le produit
//
//// sur lequel une action a eu lieu (lancement manuel de production ou
//
//// achat d’une certaine quantité de produit)
//
//// renvoie false si l’action n’a pas pu être traitée 
//    
//    public Boolean updateProduct(String username, ProductType newproduct) {
//
//// aller chercher le monde qui correspond au joueur
//        World world = getWorld(username);
//
//// trouver dans ce monde, le produit équivalent à celui passé
//// en paramètre
//        ProductType product = findProductById(world, newproduct.getId());
//
//        if (product == null) {
//            return false;
//        }
//
//// calculer la variation de quantité. Si elle est positive c'est
//// que le joueur a acheté une certaine quantité de ce produit
//// sinon c’est qu’il s’agit d’un lancement de production.
//        int qtchange = newproduct.getQuantite() - product.getQuantite();
//
//        if (qtchange > 0) {
//
//// soustraire de l'argent du joueur le cout de la quantité
//// achetée et mettre à jour la quantité de product
//        } else {
//
//// initialiser product.timeleft à product.vitesse
//// pour lancer la production
//        }
//
//// sauvegarder les changements du monde
//        saveWordlToXml(username, world);
//
//        return true;
//    }
//
//// prend en paramètre le pseudo du joueur et le manager acheté.
//// renvoie false si l’action n’a pas pu être traitée
//    public Boolean updateManager(String username, PallierType newmanager) {
//
//// aller chercher le monde qui correspond au joueur
//        World world = getWorld(username);
//
//// trouver dans ce monde, le manager équivalent à celui passé
//// en paramètre
//        PallierType manager = findManagerByName(world, newmanager.getName());
//
//        if (manager == null) {
//
//            return false;
//
//        }
//        // débloquer ce manager
//
//
//// trouver le produit correspondant au manager
//
//ProductType product = findProductById(world, manager.getIdcible());
//
//        if (product == null) {
//
//            return false;
//
//        }
//
//// débloquer le manager de ce produit
//// soustraire de l'argent du joueur le cout du manager
//// sauvegarder les changements au monde
//        saveWordlToXml(username, world);
//
//        return true;
//
//    }
//<<<<<<< HEAD
//}
//=======
//}
//>>>>>>> b32aeb832a70682c73ae9fab58d93cc76d1b4017
