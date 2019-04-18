<html>
<body>
    <h2>Jersey RESTful File Upload Application!</h2>
    
    	<form  action="/demorest/webapi/myresource" method="post" enctype="multipart/form-data">
		
			<label for="file">Select a file :</label>
			<input id="file" type="file" name="file"/>
			<br><br>
			<button name="submit" type="submit">Submit File</button>
		</form>
</body>
</html>
