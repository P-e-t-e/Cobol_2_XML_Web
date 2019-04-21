var fileData = {};
var graph = new Springy.Graph();
var nodes = {};

//**graph demo code */
// make a new graph


 


// var spruce = graph.newNode({label: 'Norway Spruce'});
// var fir = graph.newNode({label: 'Sicilian Fir'});

//initalize edges





// connect them with an edge
//graph.newEdge(spruce, fir);



var layout = new Springy.Layout.ForceDirected(
    graph,
    400.0, // Spring stiffness
    400.0, // Node repulsion
    0.5 // Damping
);


//** graph demo code */

// function openFile(event) {
//     let input = event.target;
//     console.log(event.target);
//     for (var index = 0; index < input.files.length; index++) {
//         console.log("in a file");
//         let reader = new FileReader();
//         let name = input.files[index].name;
//         reader.onload = () => {
//             // this 'text' is the content of the file
//             let text = reader.result;
//             // console.log(text);
//             // let result = document.createElement('div');
//             // let results = document.getElementById('results');
//             // result.innerHTML = text;
//             // results.appendChild(result);    
//             getCobolParseXML(text, name);    
//         }
//         reader.readAsText(input.files[index]);
//     };
// }

// function getCobolParseXML(text, fileName){
// 	console.log('In getCobolParseXML : ' + fileName + ' : ' + text);
// 	var xhttp = new XMLHttpRequest();
// 	let result = {};
// 	xhttp.onreadystatechange = function() {
// 	    if (this.readyState == 4 && this.status == 200) {
// 	    console.log('response recieved : ' + fileName);
// 	       // Typical action to be performed when the document is ready:
// 	       result = JSON.parse(xhttp.responseText);
// 	       console.log(result);
// 	       fileData[fileName] = {
// 		        'resultText' : result
// 		   };
// 		   document.getElementById('results').innerHTML = JSON.stringify(fileData);
// 	    }
// 	};
// 	xhttp.open("POST", "/demorest/webapi/myresource", true);
// 	xhttp.send(text);
// 	console.log('request sent : ' + fileName);
// }

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

function nodeExists(label){
    if(nodes[label]!==undefined){
        return true;
    } else {
        return false;
    }
}

function initEdges(){
    // make some demo nodes
    // var cobol1 = graph.newNode({label: 'cobol\1.cbl'});
    // var cobol2 = graph.newNode({label: 'cobol2.cbl'});
    // var libraryx = graph.newNode({label: 'libraryx.cbl'});
    // var bank = graph.newNode({label: 'bank.cbl'});
    // var nodes = {
    //     'cobol1.cbl' : cobol1,
    //     'cobol2.cbl' : cobol2,
    //     'libraryx.cbl' : libraryx,
    //     'bank.cbl' : bank

    // }
    //make real nodes and edges
    // var programs = {}; //edges
    
    // let programIndex = 0;
    Object.keys(fileData).forEach((key) => {
        var fkey = key;
        //nodes[key]  = graph.newNode({label: key}); //make a node
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
            // programs[fkey] = call.path;
            // programIndex++;
        });
    });

    //create some demo directed edges key -> value
    // let programs = {
        
    //     0 : {'cobol1.cbl' : 'cobol2.cbl'},
    //     1 : {'cobol1.cbl' : 'libraryx.cbl'},
    //     2 : {'cobol2.cbl' : 'libraryx.cbl'},
    //     3 : {'bank.cbl' : 'cobol2.cbl'},
    //     4 : {'cobol1.cbl' : 'bank.cbl'}
    // }

    //add edges to graph
    //console.log(nodes);
    // console.log(programs);
    // for(var edge in programs){
    //     let key = Object.keys(edge)[0];
    //     console.log(edge[key]);
    //     let fromName = edge[0].fkey;
    //     let toName = edge[1].fkey;
    //     // console.log(nodes[key]);
    //     // console.log(nodes[programs[key]]);
    //     console.log(fromName);
    //     console.log(toName);
    //     console.log(nodes[fromName]);
    //     console.log(nodes[toName]);
    //     graph.newEdge(nodes[fromName], nodes[toName]);
    // };

}
