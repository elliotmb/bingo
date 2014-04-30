//var enteries = ['YOU SHOWED UP TO CLASS! FREE!!!', '~"That was supposed to be funny, no one laughed"', '“I made this slidedeck last night”', 'Wearing an "Colourful" shirt', 'Rhetorical Question!', '~"You! Whatever your name is: I need to learn names"', 'Builds something in Microsoft MySQL (code)', 'Builds something in Microsoft MySQL (GUI)', '~"I did not know how to code"', 'LIKE "%$140,000%"', '~"$40 an hour…"', 'Picks on iSchool', '~"When I worked at Microsoft..."', 'Quotes Justin Bieber', '"We will be finished a bit early"', '~"Unlike Phill…/Don’t be like Phill…"', 'Picks on Phill a 2nd time', 'Picks on Phill a 3rd time', 'Picks on Phill a 4th time', 'Picks on Phill a 5th time', '"Blah" as he enters the room', '"Blah" second time', '~"Visio 08, not 13, it is crap"', '"Back in the day..."', '5 mins late', 'Spells something wrong, catches it', 'Spells something wrong, does not catch it', 'Says he is going to spell something wrong, spells it correctly', 'Builds something in Visio', '"I’ll cut to the chase"', 'Skips a break slide', '~"If you can write a query you can get a job"', 'Brand new rant', '"Never say never"', '~"I just needed a picture to go on this slide..."', 'Grumbles about lab section','Is 10 Mins late','Says "varchar" then chuckles','"Hundo"','Assures us that this will exciting soon','"AHA!"','Gets someones name wrong','~"We are LEARNING today"','Talks about his house','"Humor me"','Begins sentence with "YO"','Fiddy','Assures us that it will all make sense soon','Assures us that we are the best section','"Back when I worked at Disney..."','Second new story of the day','Rhetorical "Whe cares?"','Extols virtues of Amazos','"That is a lousy question"','Picks on Phil the first time'];
var enteries = ['Wearing jeans and a sportcoat aka FREE SQUARE','"Commies"','"Nazis"','Uses "Nazis" and "Info Students" in the same sentence"','"My friend Mark the Commie"','"Back at Ohio state"','"Psycho-surgeon"','"Damnit Adam"','Uses "Locke" / "Lockean" twice in a sentence','Uses "Locke" / "Lockean" three times in a sentence','RHCP||Rush reference','"Slipping a mickey"','"Killing people for fun"','"Cook a case"','"Darn tootin"','"Droppin hundies"','"No harm no foul"','"Back at Ohio State..."','"My old professor..."',"Single Malt Scotch",'Talks about his commie friend a 2nd time','His accent comes out','Reference to something "before our generation"','Thumbs up','References wife and kids','Weed reference','Acid reference','Serial Killer reference (ted bundy)','Excessive hand gestures',"Swears and thinks he's awesome (first time)","Ridiculous thought experiment","Someone is theoretically forced to kill someone else",'"Period."','"mundane"','HOCKEY HOCKEY HOCKEY','Does that weird thing where he tells us far too much about his life',"rahvalrous","something something Greeks something something",'Someone in the first 5 rows is visibly asleep','Slide that doesn\'t use transition effects circa 2008','Almost says something controversial about religion (1st time)','Almost says something controversial about religion (2nd time)','Almost says something controversial about religion (3rd time)','bizarre text formatting on the slide','pronounces "e" as "a"','"My son\'s band"','"Card carrying commie"','Swears and thinks he\'s awesome (second time)','Swears and thinks he\'s awesome (third time)','Becomes clear he has no idea what hacking is','"nahsty"','Left hand in pocket, right hand flailing','"5 minute break"... 10 minutes later...','"Access to your sexual history"','Doug says anything',"it becomes apparent he has no idea what programming is",'Mentions Jimi Hendrix'];
var socket;

function makeGrid() {
	var grid = [new Array(),new Array(),new Array(),new Array(),new Array()];
	var used = new Array();
	for(var k=0;k<25;k++){
		var temp = Math.floor((Math.random()*enteries.length));
		while(used.indexOf(temp) != -1 || temp==0){
			temp = Math.floor((Math.random()*enteries.length));
		}
		grid[Math.floor(k/5)][k%5] = temp;
		used.push(temp);
	}
	grid[2][2] = 0;//Assigns free square
	return grid;
}

//Basic update script. Legacy code left for partial update checks, consider readding
function update(elem){
	if(elem.className != "selected"){
		elem.className = 'selected';
		if (checkRow()/*Bingo(parseInt(elem.id))*/ != null){
			//console.log(checkBingo(parseInt(elem.id)));
			checkMaster();
		}
	}else{
		elem.className = "";
	}
}

//Admin update script
function updateA(elem){
	if(elem.className != "called"){
		elem.className = 'called';
		socket.emit('addCalled',{number:elem.id});
	}else{
		elem.className = "";
	}
}

//unused consider readding with dynamic checking
/*function checkBingo(square){
	var codes = [[0,5,10],[0,6],[0,7],[0,8],[0,9,11],[1,5],[1,6,10],[1,7],[1,8,11],[1,9],[2,5],[2,6],[2,7,10,11],[2,8],[2,9],[3,5],[3,6,11],[3,7],[3,8,10],[3,9],[4,5,11],[4,6],[4,7],[4,8],[4,9,10]];
	var tiles = new Array();
	for(var i = 0;i < codes[square].length;i++){
		if(checkRow(codes[square][i])){
			tiles = tiles.concat(checkRow(codes[square][i]));
		}
	}
	return tiles;
}*/
//Unused, consider reusing with dynamic checkBingo()
/*function checkRow(rowNum){
	var rows =	[[0,1,2,3,4],[5,6,7,8,9],[10,11,12,13,14],[15,16,17,18,19],[20,21,22,23,24],[0,5,10,15,20],[1,6,11,16,21],[2,7,12,17,22],[3,8,13,18,23],[4,9,14,19,24],[0,6,12,18,24],[4,8,12,16,20]];
	var squares = document.getElementById('board').getElementsByTagName('div');
	var tiles = new Array();
	for(var l = 0;l < 5;l++){
			if(squares[rows[rowNum][l]].className != "selected" || enteries.indexOf(squares[rows[rowNum][l]].innerText)!=-1){
				return false;
			}else{
				tiles.push(enteries.indexOf(squares[rows[rowNum][l]].innerText));
			}
	}
	//checkMaster();
	return tiles;
}*/

//chat send function
function send(e){
	if(e.keyCode == 13)
	{
		socket.emit('send',{message:document.getElementById('textarea').value});
		document.getElementById('textarea').value='';
	}
}
//No longer checks just rows. Checks every row. May fix this
function checkRow(){
	var cb=false;
	var rows =	[[0,1,2,3,4],[5,6,7,8,9],[10,11,12,13,14],[15,16,17,18,19],[20,21,22,23,24],[0,5,10,15,20],[1,6,11,16,21],[2,7,12,17,22],[3,8,13,18,23],[4,9,14,19,24],[0,6,12,18,24],[4,8,12,16,20]];
	var squares = document.getElementById('board').getElementsByTagName('div');
	var ttiles = new Array();
	var stiles=new Array();
	for(var i=0;i<rows.length;i++){
		cb=true;
		ttiles=new Array();
		for(var l = 0;l < 5&&cb;l++){
			if(squares[rows[i][l]].className != "selected" /*|| enteries.indexOf(squares[rows[i][l]].innerText)!=-1*/){
				cb = false;
			}else{
				ttiles.push(enteries.indexOf(squares[rows[i][l]].innerText));
			}
		}
		if(cb){
			stiles=stiles.concat(ttiles);
		}
	}
	return stiles;
}

function getTiles(){
	var squares = document.getElementById('board').getElementsByTagName('div');
	var tiles = new Array();
	for(var k=0;k<squares.length;k++){
		if(squares[k].className=='selected'){
			tiles.push(enteries.indexOf(squares[k].innerText));
		}
	}
	return tiles;
}

function checkMaster(){
	var tiles=checkRow();
	if( tiles.length>=4){
		socket.emit('checkMaster',{t:tiles});
	}
}

//Needs more flashing lights
function win(nm){
	alert("HEY EVERYONE "+nm+" IS A WINNER TODAY!");
}

//Consider moving to serverscirpt, see note in index.html
function basicSetup(){
	var bod = document.getElementById('board');
	for(var m=0;m<25;m++){
		bod.appendChild(document.createElement('div'));
		if((1+m)%5==0 && m>0){
			bod.appendChild(document.createElement('br'));
		}
	}
	var boxs = bod.getElementsByTagName('div');
	var grid = makeGrid();
	for (var i =0;i<5;i++){
		for(var j=0;j<5;j++){
				boxs[i*5+j].innerText = enteries[grid[i][j]];
				boxs[i*5+j].id = i*5+j;
				boxs[i*5+j].onmousedown = function(){update(this)};
		}
	}
	boxs[12].className="selected";
}
function adminSetup(){
	var bod = document.getElementById('board');

	for(var m=0;m<enteries.length;m++){
		var temp = document.createElement('span');
		temp.innerText = enteries[m];
		temp.id = m;
		temp.onmousedown = function(){updateA(this)};
		bod.appendChild(temp);
	}
}