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
        System.out.println("nom" + username);
        World world = service.readWorldFromXml(username);
        service.saveWorldToXML(world,username);
        return(world);
    }
    
    @GET
    @Path("/World")
    @Produces(MediaType.APPLICATION_JSON)
    public String getJson(@Context HttpServletRequest request) throws JAXBException, FileNotFoundException {
        String username = request.getHeader("X-user");
        System.out.println("nom" + username);
        World world = service.readWorldFromXml(username);
        service.saveWorldToXML(world,username);
        return(new Gson().toJson(world));
        
    }

    /**
     * PUT method for updating or creating an instance of GenericResource
     * @param content representation for the resource
     */
    /*@PUT
    @Consumes(MediaType.APPLICATION_XML)
    public void putXml(String content) {
    }*/
    
    @PUT
    @Path("/product")
    @Consumes(MediaType.APPLICATION_JSON)
    public void product(String content) throws JAXBException, FileNotFoundException {
        ProductType product = new Gson().fromJson(content, ProductType.class);
        service.updateProduct("toto", product);
    }
    
    /*@PUT
    @Path("/manager")
    @Consumes(MediaType.APPLICATION_JSON)
    public void pallier(String content){
        PallierType pallier = new Gson().fromJson(content, PallierType.class);
    }*/
}   
