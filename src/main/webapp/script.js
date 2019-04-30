//Initialise graph, file data and node variables
var fileData = {};
var graph = new Springy.Graph();
var nodes = {};


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

    var fileName = document.querySelector('input[type=file]').files[0].name

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
           document.getElementById('results').innerHTML = `Select an element for more info`;
           initEdges();
	    }
	};
	xhttp.open("POST", "/demorest/webapi/myresource", true);
	xhttp.send(form);
	console.log('request sent : ');
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
        let title = document.createElement('h3');
        title.innerHTML = nodeLabel;
        resultsDiv.appendChild(title);

        var info = fileData[nodeLabel].resultText.cobol;
        let list = document.createElement('ul');
        let keys = Object.keys(info);
        for(let i=0; i<keys.length; i++){
            let listItem = document.createElement('li');
            listItem.innerHTML = `${keys[i]} : ${JSON.stringify(info[keys[i]])}`;
            list.appendChild(listItem);
        }
        resultsDiv.appendChild(list);
        document.getElementById('results').innerHTML = "";
        document.getElementById('results').appendChild(resultsDiv);
    } else {
        document.getElementById('results').innerHTML = "No further info known about this file, upload file for more statistics";
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
