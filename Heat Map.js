
function makeHeatMap(data,options){
	drawHeatMap(convertDataHeatMap(data),options);
}
function drawHeatMap(data,options){
	var width=getInputParam(options["width"],0),
		height=getInputParam(options["height"],0),
		margins=getInputParam(options["margins"],[0,0,0,0]),
		tag=getInputParam(options["tag"],"body"),
		cclass=getInputParam(options["class"],"heatMaps"),
		colors=getInputParam(options["colors"],[]),
		colVals=getInputParam(options["colorValues"],[]),
		src=getInputParam(options["source"],"csv"),
		addqbinfo=getInputParam(options["addtionalqbthings"],{});

	if(src=='qb'){
		data=convertQBData(data,addqbinfo);
	}
		var cols=[],colps=[];
	if(colVals.length<1){
		if(colors.length>2){
			t=d3.extent(data,function(p){return +p[0];});
			for(var i=0;i<colors.length;++i){
				colps.push(t[1]*i/(colors.length-1)+t[0]);
			}
		}else{
			colps=d3.extent(data,function(p){return +p[0];});
		}
	}else{
		colps=colVals;
	}
	if(colors.length<1){
		if(colps.length>2){
			colps=[colps[0],colps[colps.length-1]];
		}else{
			cols=["#000","#FFF"];
		}
	}else{
		cols=colors;
	}
	var w=width-margins[1]-margins[3],
		h=height-margins[0]-margins[2],
		f=function(p,i){return +p[i];},
		xextent=d3.extent(data,function(p){return +p[1];}),
		yextent=d3.extent(data,function(p){return +p[2];}),
		dx=new Array(),
		dy=new Array(),
		colspace=d3.scale.linear().domain(colps).range(cols);
	for(var x=xextent[0];x<=xextent[1];++x){
		dx.push(x);
	}
	for(var y=yextent[0];y<=yextent[1];++y){
		dy.push(y);
	}
	var x=d3.scale.ordinal().domain(dx).rangeRoundBands([0,w]);
	var y=d3.scale.ordinal().domain(dy).rangeRoundBands([0,h]);
	
	var svg = d3.select(tag).append("svg:svg")
			.attr("class",cclass)
			.attr("width", width)
			.attr("height", height)
		.append("svg:g")
			.attr("transform", "translate(" + margins[3] + "," + margins[0] + ")");

	svg.selectAll("rect")
			.data(data)
		.enter().append("rect")
			.attr("x",function(d){
				return x(d[1]);
			})
			.attr("y",function(d){
				return y(d[2]);
			})
			.attr("width",x.rangeBand())
			.attr("height",y.rangeBand())
			.attr("fill",function(d){
				return colspace(d[0]);
			});
}