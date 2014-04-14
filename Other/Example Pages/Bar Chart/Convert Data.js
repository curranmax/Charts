
function convertData(data){
	var data2=new Array();
	for (var i in data){
		var temp=new Array();
		for(var j in data[i]){
			temp.push(parseFloat(data[i][j]));
		}
		data2.push(temp);
	}
	return data2;
}
function convertDataWithClasses(data){
	var data2=new Array(),
		classes=new Array(),
		names=[];
	for (var i in data){
		var temp=new Array();
		for(j in data[i]){
			if(j=='Class'){
				continue;
			}
			if(i==0){
				names.push(j);
			}
			temp.push(parseFloat(data[i][j]));
		}
		classes.push(data[i]['Class']);
		data2.push(temp);
	}
	return {data:data2,pclass:classes,names:names};
}
function convertDataMutipleBarChart(data){
	var data2=new Array()
	for(i in data){
		var x=0;
		for(var j in data[i]){
			var temp=new Array()
			temp.push(data[i][j]);
			temp.push(x);
			data2.push(temp);
			x=x+1;
		}
	}
	return data2;
}
function convertDataHeatMap(data){
	var data2=new Array(),
		y=0;
	for(var i in data){
		var x=0;
		for(var j in data[i]){
			var temp=new Array();
			temp.push(data[i][j]);
			temp.push(x);
			temp.push(y);
			data2.push(temp);
			x++;
		}
		y++;
	}
	return data2;
}
function getInputParam(val,defaultval){
	if(val==undefined){
		return defaultval;
	}else{
		return val;
	}
}