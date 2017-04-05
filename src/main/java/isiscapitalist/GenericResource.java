/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package isiscapitalist;

import com.google.gson.Gson;
import generated.PallierType;
import generated.ProductType;
import generated.World;
import java.io.FileNotFoundException;
import javax.servlet.http.HttpServletRequest;
import javax.ws.rs.core.Context;
import javax.ws.rs.core.UriInfo;
import javax.ws.rs.Consumes;
import javax.ws.rs.Produces;
import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.PUT;
import javax.ws.rs.core.MediaType;
import javax.xml.bind.JAXBException;

/**
 * REST Web Service
 *
 * @author lgrandgu
 */
@Path("generic")
public class GenericResource {

    @Context
    private UriInfo context;
    private Services service;

    /**
     * Creates a new instance of GenericResource
     */
    public GenericResource() throws JAXBException {
        service = new Services();            
    }

///////////////////POUR LEONORE
//    @GET
//    @Produces(MediaType.APPLICATION_XML)
//    public World getXml() throws JAXBException {
//        World world = service.readWorldFromXml("");
//        return(world);
//    }
//
//    @GET
//    @Produces(MediaType.APPLICATION_JSON)
//    public String getJson() throws JAXBException {
//        World world = service.readWorldFromXml("");
//        return(new Gson().toJson(world));
//    }
//}
    

/////////////////////////POUR ALEX    
    
    /**
     * Retrieves representation of an instance of isiscapitalist.GenericResource
     * @return an instance of java.lang.String
     * @throws javax.xml.bind.JAXBException
     */
    @GET
    @Path("/World")
    @Produces(MediaType.APPLICATION_XML)
    public World getXml(@Context HttpServletRequest request) throws JAXBException, FileNotFoundException {
        String username = request.getHeader("X-user");
        World world = service.readWorldFromXml(username);
        service.saveWorldToXML(world,username);
        return(world);
    }
    
    @GET
    @Path("/World")
    @Produces(MediaType.APPLICATION_JSON)
    public String getJson(@Context HttpServletRequest request) throws JAXBException, FileNotFoundException {
        String username = request.getHeader("X-user");
        World world = service.readWorldFromXml(username);
        service.saveWorldToXML(world,username);
        return(new Gson().toJson(world));
        
    }

    /**
     * PUT method for updating or creating an instance of GenericResource
     * @param request
     * @param content representation for the resource
     * @throws javax.xml.bind.JAXBException
     * @throws java.io.FileNotFoundException
     */
    /*@PUT
    @Consumes(MediaType.APPLICATION_XML)
    public void putXml(String content) {
    }*/
    
    @PUT
    @Path("/product")
    @Consumes(MediaType.APPLICATION_JSON)
    public void product(@Context HttpServletRequest request, String content) throws JAXBException, FileNotFoundException {
        ProductType product = new Gson().fromJson(content, ProductType.class);
        String username = request.getHeader("X-user");
        service.updateProduct(username, product);
    }
    
    @PUT
    @Path("/manager")
    @Consumes(MediaType.APPLICATION_JSON)
    public void manager(@Context HttpServletRequest request, String content) throws JAXBException, FileNotFoundException{
        PallierType pallier = new Gson().fromJson(content, PallierType.class);
        String username = request.getHeader("X-user");
        service.updateManager(username, pallier);
    }
    @PUT
    @Path("/upgrade")
    @Consumes(MediaType.APPLICATION_JSON)
    public void upgrade(@Context HttpServletRequest request, String content) throws JAXBException, FileNotFoundException{
        PallierType pallier = new Gson().fromJson(content, PallierType.class);
        String username = request.getHeader("X-user");
        service.UpdateUpgrade(username, pallier);
    }
    
    @PUT
    @Path("/angel")
    @Consumes(MediaType.APPLICATION_JSON)
    public void angel(@Context HttpServletRequest request, String content) throws JAXBException, FileNotFoundException{
        PallierType pallier = new Gson().fromJson(content, PallierType.class);
        String username = request.getHeader("X-user");
        service.UpdateAngel(username, pallier);
    }
    
    @PUT
    @Path("/reset")
    @Consumes(MediaType.APPLICATION_JSON)
    public void Reset(@Context HttpServletRequest request, String content) throws JAXBException, FileNotFoundException, Exception{
        String username = request.getHeader("X-user");
        World world = service.readWorldFromXml(username);
        service.ResetWorld(username, world);
    }
}   
