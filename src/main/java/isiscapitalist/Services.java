package isiscapitalist;

import generated.World;
import java.io.File;
import java.io.InputStream;
import javax.xml.bind.JAXBContext;
import javax.xml.bind.JAXBException;
import javax.xml.bind.Marshaller;
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
    public World readWorldFromXml() throws JAXBException {
        try {
            cont = JAXBContext.newInstance(World.class);
            u = cont.createUnmarshaller();
            InputStream input = getClass().getClassLoader().getResourceAsStream("world.xml");
            world = (World) u.unmarshal(input);
        } catch (JAXBException e) {
            System.err.println(e.getMessage());
        }
        catch (NullPointerException e){
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
    public void saveWorldToXML(World world) throws JAXBException {
        try{
        m = cont.createMarshaller();
        m.marshal(world, new File("world.xml"));
        }
        catch (JAXBException e){
            System.err.println(e.getMessage());
        }
        catch (NullPointerException e){
            System.err.println(e.getMessage());
        }
    }
}
