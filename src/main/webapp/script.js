//Initialise graph, file data and node variables
var fileData = {};
var graph = new Springy.Graph();
var nodes = {};

document.getElementById('import').onclick = function() {
	var files = document.getElementById('selectFiles').files;
  console.log(files);
  if (files.length <= 0) {
    return false;
  }
  
  var fr = new FileReader();
  
  fr.onload = function(e) { 
  	console.log(e);
    var result = JSON.parse(e.target.result);
    console.log(result);
    Object.keys(result).forEach((key) => {
    	console.log(key);
    	if(key==='filedata'){
    		fileData = result.filedata;
    		nodes = {}; //reset nodes
    	} else if(key==='nodes'){
    		//nodes = result.nodes;
    	} else {
    		console.log('unknown key in upload save file');
    	}
    });
    initEdges();
  }
  
  fr.readAsText(files.item(0));
  //recreate nodes from filedata
  
};


/**
* Setup graph layout
**/
var layout = new Springy.Layout.ForceDirected(
    graph,
    400.0, // Spring stiffness
    400.0, // Node repulsion
    0.5 // Damping
);

/**
* Send cobol parse request to rest api
**/
function getCobolParseXML(){

    var fileName = document.getElementById('fileForm').querySelector('input[type=file]').files[0].name

    console.log('In getCobolParseXML ');
    let form = new FormData(document.getElementById('fileForm'));
	var xhttp = new XMLHttpRequest();
	let result = {};
	xhttp.onreadystatechange = function() {
	    if (this.readyState == 4 && this.status == 200) {
	    console.log('response recieved : ');
	       // Typical action to be performed when the document is ready:
	       result = JSON.parse(xhttp.responseText);
           console.log(result);
           console.log(fileName);
	       fileData[fileName] = {
		        'resultText' : result
		   };
           //document.getElementById('results').innerHTML = JSON.stringify(fileData);
           initEdges();
	    }
	};
	xhttp.open("POST", "/demorest/webapi/myresource", true);
	xhttp.send(form);
	console.log('request sent : ');
}

/**
function download(content, fileName, contentType) {
    var a = document.createElement("a");
    var file = new Blob([content], {type: contentType});
    a.href = URL.createObjectURL(file);
    a.download = fileName;
    a.click();
}
**/

function downloadSaveFile(){
	let saveFile = {};
	saveFile.filedata = fileData;
	saveFile.nodes = nodes;
	console.log(saveFile);
	//download(saveFile, 'json.save', 'application/x-please-download-me');
	saveData(saveFile, 'json', "json.save");
	return false;
}

function uploadSaveFile(){
	
}
/**
* Display details of provided node in the results div
**/
function showDetails(nodeLabel){
    console.log(nodeLabel);
    let nodeData = fileData[nodeLabel];
    if(nodeData!==undefined){
        //console.log(JSON.stringify(fileData[nodeLabel]));
        // JSON.stringify(fileData[nodeLabel]);
        let resultsDiv = document.createElement('div');
        //let title = document.createElement('h3');
        //title.innerHTML = nodeLabel;
        //resultsDiv.appendChild(title);

        var info = fileData[nodeLabel].resultText.cobol;
        let list = document.createElement('ul');
        list.classList.add('resultsList');
        //add filename to list
        let listItem = document.createElement('li');
        listItem.innerHTML = `<strong>FileName</strong> : ${nodeLabel}`;
        list.appendChild(listItem);

        let keys = Object.keys(info);
        let date = {};
        for(let i=0; i<keys.length; i++){
            //recombine any date info
        	if(keys[i]==='day-date-written'){
        		date.day = info[keys[i]];
        	} else if(keys[i]==='month-date-written'){
        		date.month = info[keys[i]];
        	} else if(keys[i]==='year-date-written'){
        		date.year = info[keys[i]];
        	} else {
                //otherwise add raw info to list (Beautified json with 4 space seperation)
	            let listItem = document.createElement('li');
	            let jsonString = JSON.stringify(info[keys[i]], null, '\t');
	            listItem.innerHTML = `<strong>${keys[i]}</strong> : ${jsonString}`;
	            list.appendChild(listItem);
            }
        }
        //if theres a valid date add it to the list
        if(Object.keys(date).length===3){
            let listItem = document.createElement('li');
            listItem.innerHTML = `<strong>Date written</strong> : ${date.day}-${date.month}-${date.year}`;
            list.appendChild(listItem);
        }
        //display the list
        resultsDiv.appendChild(list);
        document.getElementById('results').innerHTML = "";
        document.getElementById('results').appendChild(resultsDiv);
    } else {
        document.getElementById('results').innerHTML = `No further info known about file ${nodeLabel}, upload file for more statistics`;
    }
}

/**
* Check if node already exists in graph
**/
function nodeExists(label){
    if(nodes[label]!==undefined){
        return true;
    } else {
        return false;
    }
}

/**
* Go through all known files and set up graph nodes / edges based on external calls
**/
function initEdges(){
	document.getElementById('results').innerHTML = `Select an element for more info`;
    Object.keys(fileData).forEach((key) => {
        var fkey = key;
        var nodeFrom;
        if(nodeExists(key)){
            nodeFrom = nodes[key];
        } else {
            nodeFrom = graph.newNode({label: key});
            nodes[key] = nodeFrom;
        }
        console.log(fileData[key]);
        fileData[key].resultText.cobol.call.forEach((call) => {
            if(!fileData[call.path]){ //if the node for the call dosent exist then create it
                //nodes[call.path] = graph.newNode({label: call.path}); //make a node
                var nodeTo;
                if(nodeExists(call.path)){
                    nodeTo = nodes[call.path];
                } else {
                    nodeTo = graph.newNode({label: call.path});
                    nodes[call.path] = nodeTo;
                }
                let currentEdges = graph.getEdges(nodeFrom, nodeTo);
                let edgeExists = false;
                currentEdges.forEach((edge) => {
                    if(edge.target === nodeTo && edge.source === nodeFrom){
                        edgeExists = true;
                    }
                })
                if(!edgeExists){
                    graph.newEdge(nodeFrom, nodeTo);
                } else {
                    console.log('edge exists');
                }               
            }

        });
    });
}

function saveXMLData(){
		alert('Currently you cannot re-upload XML data to the app - if you are trying to save the current state' + 
				' for later use please use the save state feature located above');
	    let data = '<nodes>' + objectToXml(graph.nodes) + '</nodes>' + 
    			'<edges>' + objectToXml(graph.edges) + '</edges>';
    	saveData(data, 'xml', 'graph.xml');    			
}
    
/* function to save JSON to file from browser
* adapted from http://bgrins.github.io/devtools-snippets/#console-save
* @param {Object} data -- json object to save
* @param {String} file -- file name to save to 
*/
function saveData(data, datatype, filename){

    if(!data) {
        console.error('No data')
        return;
    }

    if(!filename) filename = 'console.' + datatype;

    if(typeof data === "object" && datatype==='json'){
        data = JSON.stringify(data, undefined, 4)
    }

    var blob = new Blob([data], {type: 'text/' + datatype}),
        e    = document.createEvent('MouseEvents'),
        a    = document.createElement('a')

    a.download = filename
    a.href = window.URL.createObjectURL(blob)
    a.dataset.downloadurl =  ['text/' + datatype, a.download, a.href].join(':')
    e.initMouseEvent('click', true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null)
    a.dispatchEvent(e)
}

/**
* Function to convert from json to xml - adapted from the following online resource
* http://raathigesh.com/Converting-Json-Object-To-XML-String-In-JavaScript/
* @param {JSON object} obj - Json object to convert
* @return {String} xml - XML derived from input json object
**/
function objectToXml(obj) {
        var xml = '';
        for (var prop in obj) {
            if (!obj.hasOwnProperty(prop)) {
                continue;
            }

            if (obj[prop] == undefined)
                continue;

            xml += "<" + prop + ">";
            if (typeof obj[prop] == "object")
                xml += objectToXml(new Object(obj[prop]));
            else
                xml += obj[prop];

            xml += "</" + prop + ">";
        }
        return xml;
}


