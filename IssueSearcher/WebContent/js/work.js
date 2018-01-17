/**
 * Author: Charles Spencer
 * Latest update: 1/16/18
 *
 * Flow:
 * 
 * writeToScreen->
 * 		getTotalIssues->
 *			getDate(optional)
 *		getIssues->
 *			getDate
 * 		writePerPage
 * 		writePaging
 * 		writeObjects->
 *			writeObject
 * 		writePaging
 */
var totalIssues;
var page=1;
var per_page=30;
writeToScreen();

//makes the call to the github api
//returns: (obj) the array of issues to be written to the screen
function getIssues(){
	var xmlHttp = new XMLHttpRequest();
	xmlHttp.open( "GET", "https://api.github.com/repos/angular/angular/issues?per_page="+per_page+"&page="+page+"&since="+getDate(), false ); //formulates by page number.
	xmlHttp.send( null );//note returns max of 100 though there may be more
	var obj = JSON.parse(xmlHttp.responseText);
	return obj;
}

//Original call from the webpage. Does most of the calls to the various functions.
function writeToScreen(){
	totalIssues = getTotalIssues();
	var params=window.location.href; 
	per_page=30;
	page=1;
	params = params.split("?")[1];
	//find the current page from the url
	if(params&&params.includes("pg=")){
		page=params.split("pg=")[1];
		if(page.includes("&")){
			page=page.split("&")[0];
		}
	}
	//find the current "per_page" from the url
	if(params&&params.includes("pp=")){
		per_page=params.split("pp=")[1];
		if(per_page.includes("&")){
			per_page=per_page.split("&")[0];
		}
	}
	var obj = getIssues();
	writePerPage(obj.length);
	writePaging("top");
	writeObjects(obj);
	writePaging("bot");
}

//writes the part of the page that controls how many issues are displayed per page.
//param:
//  len: the number of issues per page
function writePerPage(len){
	document.write("<div>"+len+" out of "+totalIssues+" total issues.</div>");
	document.write("<div>Issues Per Page: <input type=\"number\" id=\"per_page_count\" value=\""+per_page+"\"></div>");
	document.getElementById("per_page_count").addEventListener("keyup", function(event) {
	    event.preventDefault();
	    if (event.keyCode == 13) {
		    var newPer = document.getElementById("per_page_count").value;
		    //Dont redirect if there is no input or invalid input
		    if(newPer && per_page != newPer && newPer>0 && newPer<=100){
		    	//change page if the new page is outside of the new range
		    	if(page>totalIssues/newPer){
		    		page=Math.floor(totalIssues/newPer);
		    	}
		    	window.location.href = "Issues.html?pp="+newPer+"&pg="+page+"&ttlIss="+totalIssues;
		    }
	    }
	});
}

//writes the part of the webpage that allows paging
//param: 
//	"part": either "top" or "bot" for id purposes on the tags
function writePaging(part){
	var line = "<div align=\"center\" class=\"pagingContainer\">";
	var lastPage = Math.floor(totalIssues/per_page);
	if(totalIssues%per_page!==0){
		lastPage++;
	}
	if(page != 1){
		line+="<a href=\"Issues.html?pp="+per_page+"&pg="+1+"&ttlIss="+totalIssues+"\"><<</a> ";
		line+= "<a href=\"Issues.html?pp="+per_page+"&pg="+(page-1)+"&ttlIss="+totalIssues+"\"><</a> ";
	}
	
	line+="<input type=\"number\" id=\"paging"+part+"\" name=\"page"+part+"\" value=\""+page+"\"> / "+lastPage;
	if(page !=lastPage){
		line+=" <a href=\"Issues.html?pp="+per_page+"&pg="+(parseInt(page)+1)+"&ttlIss="+totalIssues+"\">></a> ";
		line+="<a href=\"Issues.html?pp="+per_page+"&pg="+lastPage+"&ttlIss="+totalIssues+"\">>></a>"
	}
	line+="</div>";
	document.write(line);
	document
	document.getElementById("paging"+part).addEventListener("keyup", function(event) {
	    event.preventDefault();
	    if (event.keyCode == 13) {
		    var newPage = Math.floor(document.getElementById("paging"+part).value);
		    if(newPage && page != newPage){
		    	if(newPage>lastPage){
		    		newPage=lastPage;
		    	}
		    	window.location.href = "Issues.html?pp="+per_page+"&pg="+newPage+"&ttlIss="+totalIssues;
		    }
	    }
	});
}

//returns the TotalNumber of issues
//return:
//  case 1: url: total issues extracted from the url
//	case 2:	sum: total number of issues from multiple calls to the api.
function getTotalIssues(){
	var sum = 0;
	var obj;
	var i=1;
	var url=window.location.href;
	url = url.split("?")[1];
	//case1: we've already done the work of calling the repo and now we need to extract the info from our url.
	if(url&&url.includes("ttlIss")){
		url=url.split("ttlIss=")[1];
		if(url.includes("&")){
			url=url.split("&")[0];
		}
		return url;
	}
	//case2: we need to call each page until we run out of issues as each of the calls.  
	//Note: This is an extremely low effeciency function so we want to reduce this case as much as possible. If there are 400 issues open then this case makes 4 calls to the api. 
	while(true){
		var xmlHttp = new XMLHttpRequest();
		xmlHttp.open( "GET", "https://api.github.com/repos/angular/angular/issues?per_page=100&page="+i+"&since="+getDate(), false ); 
		xmlHttp.send( null );
		obj = JSON.parse(xmlHttp.responseText);
		if(obj.length<100){
			sum+=obj.length;
			break;
		}
		i++;
		sum+=obj.length;
	}
	return sum;
}

//Returns the date of a long time ago so that we can recieve all issues
function getDate(){
	return new Date((new Date()).getTime()-(60*60*24*7*1000)).toISOString();
}

//Physically writes an issue to the page.  Contains the HTML of the issue info that we write to the document
//params:
//  obj: The array of issues from the api call. 
//  num: the index of the individual issue that needs to be written to the screen from the "obj" array;
function writeObject(obj,num){
	var use = obj[num];
	document.write("<div class=\"issue\">" +
				"<h3 data-toggle=\"collapse\" data-target=\"#some"+num+"\">"+use.number+"-"+use.title+"</h3>"+
				"<div id=\"some"+num+"\" class=\"collapse\">" +
					"<ul>" +
						"<li>Created By: "+use.user.login+"</li>" +
						"<li>Creation Date: "+new Date(use.created_at)+"</li>" +
						"<li>Updated Date: "+new Date(use.updated_at)+"</li>" +
						"<li>Issue Link: <a href="+use.html_url+">"+use.html_url+"</a></li>" +
					"</ul>" +
				"</div>" +
			"</div>");
}

//Writes each object from the 
//Params:
//	obj: The array of issues from the api call.
function writeObjects(obj){
	var i=0;
	while(i<obj.length/2){
		writeObject(obj,i);
		i++;
	}
}
