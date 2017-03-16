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

    /**
     * Retrieves representation of an instance of isiscapitalist.GenericResource
     * @return an instance of java.lang.String
     * @throws javax.xml.bind.JAXBException
     */
    @GET
    @Path("World")
    @Produces(MediaType.APPLICATION_XML)
    public World getXml(@Context HttpServletRequest request) throws JAXBException {
        String username = request.getHeader("X-user");
        World world = service.readWorldFromXml(username);
        return(world);
    }

    /**
     * PUT method for updating or creating an instance of GenericResource
     * @param content representation for the resource
     */
    @PUT
    @Consumes(MediaType.APPLICATION_XML)
    public void putXml(String content) {
    }
    
    @GET
    @Path("World1")
    @Produces(MediaType.APPLICATION_JSON)
    public String getJson(@Context HttpServletRequest request) throws JAXBException {
        String username = request.getHeader("X-user");
        World world = service.readWorldFromXml(username);
        return(new Gson().toJson(world));
        
    }
    
    @PUT
    @Path("/product")
    @Consumes(MediaType.APPLICATION_JSON)
    public void product(String content) {
        ProductType product = new Gson().fromJson(content, ProductType.class);
    }
    
    @PUT
    @Path("/manager")
    @Consumes(MediaType.APPLICATION_JSON)
    public void pallier(String content){
        PallierType pallier = new Gson().fromJson(content, PallierType.class);
    }
}   
