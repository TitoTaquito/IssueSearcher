/**
 * 
 */
//getIssues();
var totalIssues;
var per_page=30;
var page=1;
writeToScreen();
//document.write(getDate());

function getIssues(page,per_page){
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
	var obj = getIssues(page,per_page);
	document.write("<div>"+obj.length+" out of "+totalIssues+" total issues.</div>");
	writePaging("top",per_page);
	writeObjects(obj);
	writePaging("bot",per_page);
}

function writePaging(part,per_page){
	document.write("<div><< < <input type=\"number\" id=\"paging"+part+"\" name=\"page"+part+"\" value=\""+page+"\"> > >></div>");
	document
	document.getElementById("paging"+part).addEventListener("keyup", function(event) {
	    event.preventDefault();
	    if (event.keyCode == 13) {
	    	//document.write("http://localhost:8080/IssueSearcher/Issues.html?pp="+per_page+"&pg="+page+"&ttlIss="+totalIssues);
		    var newPage = document.getElementById("paging"+part).value;
		    if(newPage && page != newPage){
		    	window.location.href = "http://localhost:8080/IssueSearcher/Issues.html?pp="+per_page+"&pg="+newPage+"&ttlIss="+totalIssues;
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
	//document.write(new Date((new Date()).getTime()-(60*60*24*7*1000)).toISOString());
	return new Date((new Date()).getTime()-(60*60*24*7*1000)).toISOString();
}

function writeObject(obj,num){
	var use = obj[num];
	document.write("<div>" +
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
