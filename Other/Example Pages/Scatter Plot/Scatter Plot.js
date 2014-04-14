function makeScatterPlot(data,options){
	data=convertData(data);
	var width=getInputParam(options["width"],0),
		height=getInputParam(options["height"],0),
		margins=getInputParam(options["margins"],[0,0,0,0]),
		tag=getInputParam(options["tag"],"body"),
		cclass=getInputParam(options["class"],"scatterPlot"),
		colors=getInputParam(options["colors"],[]),
		showleastsquares=getInputParam(options["showleastsquares"],false),
		power=getInputParam(options["power"],0),
		numPlottingPoints=getInputParam(options["numPlottingPoints"],0),
		xi=getInputParam(options["xindex"],0),
		yi=getInputParam(options["yindex"],1),
		nticks=getInputParam(options["nticks"],0),
		tickColor=getInputParam(options["tickColor"],"#ccc"),
		dotColor=getInputParam(options["dotColor"],"#000"),
		dotRadius=getInputParam(options["dotRadius"],2),
		interColor=getInputParam(options["interColor"],"#F00");
	if(showleastsquares){
		plotpoints=plotLeastSquares(data,power,xi,yi,numPlottingPoints);
	    var options={
	    	width:width,
	    	height:height,
	    	margins:margins,
	    	tag:tag,
	    	colors:colors,
	    	class:cclass,
	    	plottingPoints:plotpoints,
	    	xindex:xi,
	    	yindex:yi,
	    	nticks:nticks,
	    	tickColor:tickColor,
	    	dotColor:dotColor,
	    	dotRadius:dotRadius,
	    	interColor:interColor
	    }
	}else{
		var options={
	    	width:width,
	    	height:height,
	    	margins:margins,
	    	tag:tag,
	    	colors:colors,
	    	class:cclass,
	    	xindex:xi,
	    	yindex:yi,
	    	nticks:nticks,
	    	tickColor:tickColor,
	    	dotColor:dotColor,
	    	dotRadius:dotRadius
	    }
	}
	drawScatterPlot(data,options);
}
function drawScatterPlot(data,options){
	var width=getInputParam(options["width"],0),
		height=getInputParam(options["height"],0),
		margins=getInputParam(options["margins"],[0,0,0,0]),
		tag=getInputParam(options["tag"],"body"),
		cclass=getInputParam(options["class"],"scatterPlot"),
		colors=getInputParam(options["colors"],[]),
		plotpoints=getInputParam(options["plottingPoints"],[]),
		xi=getInputParam(options["xindex"],0),
		yi=getInputParam(options["yindex"],1),
		nticks=getInputParam(options["nticks"],0),
		tickColor=getInputParam(options["tickColor"],"#ccc"),
		dotColor=getInputParam(options["dotColor"],"#000"),
		dotRadius=getInputParam(options["dotRadius"],2),
		interColor=getInputParam(options["interColor"],"#F00");

	var w=width-margins[1]-margins[3],
		h=height-margins[0]-margins[2];

	var datax=d3.extent(data,function(p){return +p[xi];}),
		linex=d3.extent(plotpoints,function(p){return +p[0];}),
		datay=d3.extent(data,function(p){return +p[yi];}),
		liney=d3.extent(plotpoints,function(p){return +p[1];}),
		dimx=[d3.min([0,d3.min([datax[0],linex[0]])]),d3.max([0,d3.max([datax[1],linex[1]])])];
		dimy=[d3.min([0,d3.min([datay[0],liney[0]])]),d3.max([0,d3.max([datay[1],liney[1]])])];
    var x=d3.scale.linear().domain(dimx).range([0,w]),
        y=d3.scale.linear().domain(dimy).range([h,0]);

    var xaxis=d3.svg.axis().ticks(nticks).scale(x).orient("bottom"),
        yaxis=d3.svg.axis().ticks(nticks).scale(y).orient("left");

    var chart = d3.select(tag).append("svg:svg")
            .attr("class",cclass)
            .attr("width",width)
            .attr("height",height)
        .append("g")
            .attr("transform","translate(" + margins[3] + "," + margins[0] + ")");

    chart.selectAll(".xticks")
    		.attr("class","xticks")
    		.data(x.ticks(nticks))
    	.enter().append("line")
    		.attr("y1",0)
    		.attr("y2",h)
    		.attr("x1",x)
    		.attr("x2",x)
    		.style("stroke",tickColor);

   	chart.selectAll(".yticks")
    		.attr("class","yticks")
    		.data(y.ticks(nticks))
    	.enter().append("line")
    		.attr("y1",y)
    		.attr("y2",y)
    		.attr("x1",0)
    		.attr("x2",w)
    		.style("stroke",tickColor);

    chart.append("line")
    		.attr("class","xaxis")
            .attr("y1",y(0))
            .attr("y2",y(0))
            .attr("x1",0)
            .attr("x2",w)
            .style("stroke","#000");

    chart.append("line")
    		.attr("class","yaxis")
            .attr("y1",0)
            .attr("y2",h)
            .attr("x1",x(0))
            .attr("x2",x(0))
            .style("stroke","#000");

    chart.selectAll("circle")
    	.attr("class","points")
        .data(data)
      .enter().append("circle")
        .attr("cx",function(d){return x(d[xi]);})
        .attr("cy",function(d){return y(d[yi]);})
        .attr("r",dotRadius)
        .style("fill",dotColor);
    
    var line=d3.svg.line()
   		.x(function(d){return x(d[0]);})
   		.y(function(d){return y(d[1]);});

    chart.append("path")
    	.attr("d",line(plotpoints))
    	.attr("stroke",interColor)
    	.attr("fill","none");
}