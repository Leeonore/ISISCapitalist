/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package isiscapitalist;

import com.google.gson.Gson;
import generated.World;
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
    @Produces(MediaType.APPLICATION_XML)
    public World getXml() throws JAXBException {
        World world = service.readWorldFromXml();
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
    @Produces(MediaType.APPLICATION_JSON)
    public String getJson() throws JAXBException {
        World world = service.readWorldFromXml();
        return(new Gson().toJson(world));
    }
}
