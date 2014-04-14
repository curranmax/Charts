
function makeParallel(data,options){
	var width=getInputParam(options["width"],0),
		height=getInputParam(options["height"],0),
		margins=getInputParam(options["margins"],[0,0,0,0]),
		tag=getInputParam(options["tag"],"body"),
		cclass=getInputParam(options["class"],"parallelCoordinates"),
		runkmeans=getInputParam(options["runkmeans"],false),
		runEM=getInputParam(options["runEM"],false),
		basicEMLabels=getInputParam(options["basicEMLabels"],true),
		minWeight=getInputParam(options["minWeight"],0),
		epsEM=getInputParam(options["epsEM"],.001),
		k=getInputParam(options["k"],-1),
		orderData=getInputParam(options["orderData"],false),
		showbackgroundscale=getInputParam(options["showbackgroundscale"],false),
		colors=getInputParam(options["colors"],["#0090FF","#FF0000","#FFD300"]),
		backColors=getInputParam(options["backColors"],["#002b4d","#4d0000","#4d3f00"]),
		names=getInputParam(options["axisNames"],d3.keys(data[0])),
		allowBrush=getInputParam(options["allowBrush"],true),
		iter=getInputParam(options["iterations"],1),
		maxiter=getInputParam(options["maxiterations"],50),
		usedistprob=getInputParam(options["usedistprob"],true),
		useCrosses=getInputParam(options["useCrosses"],true),
		names=getInputParam(options["axisNames"],[]),
		image=getInputParam(options["image"],false),
		src=getInputParam(options["source"],"csv"),
		addqbinfo=getInputParam(options["addtionalqbthings"],{});

	if(src=='csv'){
		if(names.length!=data[0].length){
			names=d3.keys(data[0]);
		}
		data=convertData(data);
	}else if(src=='qb'){
		data=convertQBData(data,addqbinfo);
	}
	if(k==-1){
		runkmeans=false;
	}
	if(orderData){
		var ord=order(data,useCrosses),
			dandn=reorderData(data,names,ord);
		data=dandn["data"];
		names=dandn["names"];
	}
	if(runkmeans){
		var labels=bestk(data,k,iter,usedistprob);
		var o={
			width:width,
			height:height,
			margins:margins,
			tag:tag,
			class:cclass,
			klabels:labels,
			useklabels:true,
			k:k,
			showbackgroundscale:showbackgroundscale,
			colors:colors,
			backColors:backColors,
			axisNames:names,
			allowBrush:allowBrush
		}
	}else if(runEM){
		var w=bestEM(data,k,epsEM,maxiter,iter);
		var	labels=computeLabels(w);
		var o={
			width:width,
			height:height,
			margins:margins,
			tag:tag,
			class:cclass,
			klabels:labels,
			useklabels:true,
			k:k,
			showbackgroundscale:showbackgroundscale,
			colors:colors,
			backColors:backColors,
			axisNames:names,
			allowBrush:allowBrush,
			useWeights:!basicEMLabels,
			minWeight:minWeight,
			weights:w
		}
	}else{
		var o={
			width:width,
			height:height,
			margins:margins,
			tag:tag,
			class:cclass,
			useklabels:false,
			k:k,
			showbackgroundscale:showbackgroundscale,
			colors:colors,
			backColors:backColors,
			axisNames:names,
			allowBrush:allowBrush
		}
	}
	if(image){
		imageParallel(data,o);
	}else{
		drawParallel(data,o);
	}
}
//Set the minimum and maximum values
function drawParallel(data,options){
	var width=getInputParam(options["width"],0),
		height=getInputParam(options["height"],0),
		margins=getInputParam(options["margins"],[0,0,0,0]),
		tag=getInputParam(options["tag"],"body"),
		cclass=getInputParam(options["class"],"parallelCoordinates"),
		labels=getInputParam(options["klabels"],[]),
		useKlabels=getInputParam(options["useklabels"],false),
		k=getInputParam(options["k"],-1),
		axisScale=getInputParam(options["axisScale"],[])
		backgroundscale=getInputParam(options["showbackgroundscale"],false),
		colors=getInputParam(options["colors"],["#0090FF","#FF0000","#FFD300"]),
		backColors=getInputParam(options["backColors"],["#002b4d","#4d0000","#4d3f00"]),
		names=getInputParam(options["axisNames"],d3.keys(data[0])),
		allowBrush=getInputParam(options["allowBrush"],true),
		useWeights=getInputParam(options["useWeights"],false),
		minWeight=getInputParam(options["minWeight"],0),
		weights=getInputParam(options["weights"],[]),
		showbackground=getInputParam(options["showbackground"],true);

	if(labels.length!=data.length){
		useKlabels=false;
	}
	if(k==-1&&useKlabels){
		k=parseFloat(d3.max(labels))+1;
	}
	if((!useKlabels||weights.length==0||weights.length==undefined)&&useWeights){
		useWeights=false;
	}
	var w = width - margins[1] - margins[3],
		h = height - margins[0] - margins[2];

	var x = d3.scale.ordinal().rangePoints([0, w], 1),
		y = {};

	var line = d3.svg.line(),
		axis = d3.svg.axis().orient("left"),
		background,
		foreground;

	var svg = d3.select("body").append("svg:svg")
			.attr("class",cclass)
			.attr("width", width)
			.attr("height", height)
		.append("svg:g")
			.attr("transform", "translate(" + margins[3] + "," + margins[0] + ")");

	var dimensions;
	x.domain(dimensions = d3.keys(data[0]).filter(function(d) {
		if(axisScale.length!=2){
			var dom=d3.extent(data, function(p) { return +p[d]; });
		}else{
			var dom=axisScale;
		}
		return (y[d] = d3.scale.linear()
			.domain(dom)
			.range([h, 0]));
	}));
	if(useKlabels){
		var colvals=new Array(),
			backcolvals=new Array();
		for(var i=0;i<colors.length;++i){
			colvals.push(i*(k-1)/colors.length);
		}
		for(var i=0;i<backColors.length;++i){
			backcolvals.push(i*(k-1)/backColors.length);
		}
		var colspace=d3.scale.linear().domain(colvals).range(colors);
		var colspaceback=d3.scale.linear().domain(backcolvals).range(backColors);
	}
	if(showbackground){
		background = svg.append("svg:g")
				.attr("class", "background")
			.selectAll("path")
				.data(data)
			.enter().append("svg:path")
				.attr("d", path)
				.attr("stroke",function(d,i){
					if(backgroundscale&&useKlabels){
						return colspaceback(labels[i]);
					}else{
						return "#ccc";
					}
				});
	}
	foreground = svg.append("svg:g")
			.attr("class", "foreground")
		.selectAll("path")
			.data(data)
		.enter().append("svg:path")
			.attr("d", path)
			.attr("stroke",function(d,i){
				if(useKlabels){
					if(useWeights){
						var ws=weights[i],
							w=[],
							cols=[];
						for(var j=0;j<ws.length;++j){
							if(ws[j]>=minWeight){
								w.push(ws[j])
								cols.push(colspace(j))
							}
						}
						if(w.length==0){
							return colspace(labels[i]);
						}
						return weightedAverageColors(w,cols);
					}else{
						return colspace(labels[i]);
					}
				}else{
					if(colors.length>0){
						return colors[0];
					}else{
						return "steelblue";
					}
				}
			});

	var g = svg.selectAll(".dimension")
			.data(dimensions)
		.enter().append("svg:g")
			.attr("class", "dimension")
			.attr("transform", function(d) { return "translate(" + x(d) + ")"; });

	g.append("svg:g")
			.attr("class", "axis")
			.each(function(d) { d3.select(this).call(axis.scale(y[d])); })
		.append("svg:text")
			.attr("text-anchor", "middle")
			.attr("y", -9)
			.text(function(d,i){return names[i];});

	if(allowBrush){
		g.append("svg:g")
				.attr("class", "brush")
				.each(function(d) { d3.select(this).call(y[d].brush = d3.svg.brush().y(y[d]).on("brush", brush)); })
			.selectAll("rect")
				.attr("x", -8)
				.attr("width", 16);
	}
	function path(d) {
		return line(dimensions.map(function(p) { return [x(p), y[p](d[p])]; }));
	}
	function brush() {
		 var actives = dimensions.filter(function(p) { return !y[p].brush.empty(); }),
			extents = actives.map(function(p) { return y[p].brush.extent(); });
		foreground.style("display", function(d) {
			return actives.every(function(p, i) {
				return extents[i][0] <= d[p] && d[p] <= extents[i][1];
			}) ? null : "none";
		});
	}
}
function imageParallel(data,options){
	var width=getInputParam(options["width"],0),
		height=getInputParam(options["height"],0),
		margins=getInputParam(options["margins"],[0,0,0,0]),
		tag=getInputParam(options["tag"],"body"),
		cclass=getInputParam(options["class"],"parallelCoordinates"),
		labels=getInputParam(options["klabels"],[]),
		useKlabels=getInputParam(options["useklabels"],false),
		k=getInputParam(options["k"],-1),
		backgroundscale=getInputParam(options["showbackgroundscale"],false),
		colors=getInputParam(options["colors"],["#0090FF","#FF0000","#FFD300"]),
		backColors=getInputParam(options["backColors"],["#002b4d","#4d0000","#4d3f00"]),
		names=getInputParam(options["axisNames"],d3.keys(data[0])),
		allowBrush=getInputParam(options["allowBrush"],true),
		useWeights=getInputParam(options["useWeights"],false),
		minWeight=getInputParam(options["minWeight"],0),
		weights=getInputParam(options["weights"],[]),
		showbackground=getInputParam(options["showbackground"],true);
	if(useKlabels){
		var colors=imageLabels(data,labels,k);
	}else{
		var colors=imagecolors(data);
		var labels=[];
		for(var i=0;i<data.length;++i){
			labels.push(i);
		}
	}
	var o={
		width:width,
		height:height,
		margins:margins,
		tag:tag,
		clas:cclass,
		klabels:labels,
		useklabels:true,
		k:k,
		showbackgroundscale:backgroundscale,
		colors:colors,
		backColors:backColors,
		axisNames:names,
		allowBrush:allowBrush,
		useWeights:useWeights,
		minWeight:minWeight,
		weights:weights,
		showbackground:showbackground,
		axisScale:[0,256]
	}
	drawParallel(data,o);
}