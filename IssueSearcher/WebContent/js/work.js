/**
 * 
 */
//getIssues();
var totalIssues;
var page=1;
var per_page=30;
writeToScreen();
//document.write(getDate());

function getIssues(){
	var xmlHttp = new XMLHttpRequest();
	xmlHttp.open( "GET", "https://api.github.com/repos/angular/angular/issues?per_page="+per_page+"&page="+page+"&since="+getDate(), false ); 
	xmlHttp.send( null );
	var obj = JSON.parse(xmlHttp.responseText);
	return obj;
}

function writeToScreen(){
	totalIssues = getTotalIssues();
	var params=window.location.href;
	per_page=30;
	page=1;
	params = params.split("?")[1];
	if(params&&params.includes("pg=")){
		page=params.split("pg=")[1];
		if(page.includes("&")){
			page=page.split("&")[0];
		}
	}
	if(params&&params.includes("pp=")){
		per_page=params.split("pp=")[1];
		if(per_page.includes("&")){
			per_page=per_page.split("&")[0];
		}
	}
	//document.write("<div>Issues Per Page: <input type=\"number\" id=\"per_page_count\" value=\""+per_page+"\"></div>");
	var obj = getIssues();
	writePerPage(obj.length);
	writePaging("top",per_page);
	writeObjects(obj);
	writePaging("bot",per_page);
}

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

function getTotalIssues(){
	var sum = 0;
	var obj;
	var i=1;
	var url=window.location.href;
	url = url.split("?")[1];
	if(url&&url.includes("ttlIss")){
		url=url.split("ttlIss=")[1];
		if(url.includes("&")){
			url=url.split("&")[0];
		}
		return url;
	}
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

function getDate(){
	return new Date((new Date()).getTime()-(60*60*24*7*1000)).toISOString();
}

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

function writeObjects(obj){
	var i=0;
	while(i<obj.length){
		writeObject(obj,i);
		i++;
	}
}
