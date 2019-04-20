package com.wazzer.demorest;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.util.Scanner;

import javax.ws.rs.Consumes;
import javax.ws.rs.POST;
import javax.ws.rs.Path;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;

import cobol.Cobol2XML;
import org.glassfish.jersey.media.multipart.FormDataContentDisposition;
import org.glassfish.jersey.media.multipart.FormDataParam;
import org.json.JSONObject;
import org.json.XML;

/*import com.sun.jersey.core.header.FormDataContentDisposition;
import com.sun.jersey.multipart.FormDataParam;
*/
/**
 * Root resource (exposed at "myresource" path)
 */
@Path("myresource")
public class MyResource {

	private Cobol2XML parser = new Cobol2XML();
    /**
     * Method handling HTTP POST requests. The returned object will be sent
     * to the client as "text/plain" media type. 
     *
     * @return String that will be returned as a text/plain response.
     */
    /*@GET
    @Produces(MediaType.TEXT_PLAIN)
    public String getIt() {
        return "Got it!";
    }*/
	
	@POST
	
	@Consumes(MediaType.MULTIPART_FORM_DATA)
	public Response uploadFile(
			@FormDataParam("file") InputStream uploadedInputStream,
			@FormDataParam("file") FormDataContentDisposition fileDetail) {

			//String uploadedFileLocation = "C://Users//Warren Kelly//Desktop//RestApi//testFile/" + fileDetail.getFileName();
			

			// save it
			//writeToFile(uploadedInputStream, uploadedFileLocation);

			File file;

			System.out.println("Debug: in upload file endpoint");
			try{
				System.out.println("Debug: about to parse file");
				 file = parser.parseText(uploadedInputStream);
				 String xmlString = "";
				 Scanner scanner = new Scanner(file);
				 scanner.hasNextLine();//get rid of xml version line
				 while(scanner.hasNextLine()) {
					 xmlString+=scanner.nextLine();
				 }
				 scanner.close();
				 JSONObject jsonobj = XML.toJSONObject(xmlString);
				 System.out.println("++Done - sending response ( " + jsonobj.toString() + " )");
				return Response.status(200).entity(jsonobj.toString()).build();
			} catch (Exception e){
				System.out.println("Parser Failed: " + e.getMessage() + e.toString());
			}

			//String output = "File uploaded to : " + uploadedFileLocation;
		return Response.status(400).build();
		}

		// save uploaded file to new location
//		private void writeToFile(InputStream uploadedInputStream,
//			String uploadedFileLocation) {
//
//			try {
//				OutputStream out = new FileOutputStream(new File(
//						uploadedFileLocation));
//				int read = 0;
//				byte[] bytes = new byte[1024];
//
//				out = new FileOutputStream(new File(uploadedFileLocation));
//				while ((read = uploadedInputStream.read(bytes)) != -1) {
//					out.write(bytes, 0, read);
//				}
//				out.flush();
//				out.close();
//			} catch (IOException e) {
//
//				e.printStackTrace();
//			}
//
//		}
	

}
