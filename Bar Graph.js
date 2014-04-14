
function makeBarChart(data,options){
	var w=getInputParam(options["width"],0),
		h=getInputParam(options["height"],0),
		m=getInputParam(options["margins"],[0,0,0,0]),
		index=getInputParam(options["index"],0),
		nticks=getInputParam(options["nticks"],0),
		orientation=getInputParam(options["orientation"],0),
		tag=getInputParam(options["tag"],"body"),
		cclass=getInputParam(options["class"],"barChart"),
		src=getInputParam(options["source"],"csv"),
		addqbinfo=getInputParam(options["addtionalqbthings"],{});

	if(src=='qb'){
		data=convertQBData(data,addqbinfo);
	}
	var options={height:h,width:w,margins:m,nticks:nticks,orientation:orientation,tag:tag,index:index,class:cclass};
	drawBarChart(convertData(data),options);
}
function drawBarChart(data,options){
	var width=getInputParam(options["width"],0),
		height=getInputParam(options["height"],0),
		margins=getInputParam(options["margins"],[0,0,0,0]),
		index=getInputParam(options["index"],0),
		nticks=getInputParam(options["nticks"],0),
		orientation=getInputParam(options["orientation"],0),
		tag=getInputParam(options["tag"],"body"),
		cclass=getInputParam(options["class"],"barChart");
	var w=width-margins[1]-margins[3],
		h=height-margins[0]-margins[2],
		ord=d3.scale.ordinal().domain(data),
		f=function(p) {return parseFloat(p[index]);},
		lin=d3.scale.linear().nice().domain([d3.min([0,d3.min(data,f)]), d3.max([0,d3.max(data,f)])]);
	if(orientation==0){
		var y=ord.rangeRoundBands([0,h]),
			x=lin.range([0,w]),
			ymin=0,
			ymax=h,
			ticks=x.ticks(nticks);
	}else if(orientation==1){
		var x=ord.rangeRoundBands([0,w]),
			y=lin.range([0,h]),
			xmin=0,
			xmax=w,
			ticks=y.ticks(nticks);
	}else if(orientation==2){
		var y=ord.rangeRoundBands([0,h]),
			x=lin.range([w,0]),
			ymin=0,
			ymax=h,
			ticks=x.ticks(nticks);
	}else if(orientation==3){
		var x=ord.rangeRoundBands([0,w]),
			y=lin.range([h,0]),
			xmin=0,
			xmax=w,
			ticks=y.ticks(nticks);
	}


	var svg = d3.select(tag).append("svg:svg")
			.attr("class",cclass)
			.attr("width", width)
			.attr("height", height)
		.append("svg:g")
			.attr("transform", "translate(" + margins[3] + "," + margins[0] + ")");
	svg.selectAll("line")
			.data(ticks)
		.enter().append("line")
			.attr("x1",function(d,i){
				if(orientation==0||orientation==2){
					return x(d);
				}else if(orientation==1||orientation==3){
					return xmin;
				}
			})
			.attr("x2",function(d,i){
				if(orientation==0||orientation==2){
					return x(d);
				}else if(orientation==1||orientation==3){
					return xmax;
				}
			})
			.attr("y1",function(d,i){
				if(orientation==0||orientation==2){
					return ymin;
				}else if(orientation==1||orientation==3){
					return y(d);
				}
			})
			.attr("y2",function(d,i){
				if(orientation==0||orientation==2){
					return ymax;
				}else if(orientation==1||orientation==3){
					return y(d);
				}
			})
			.style("stroke","#ccc");

	svg.selectAll("rect")
			.data(data)
		.enter().append("rect")
			.attr("y",function(d,i){
				if(orientation==0||orientation==2){
					return y(i);
				}else if(orientation==1){
					if(d[index]<0){
						return y(d[index]);
					}else{
						return y(0);
					}
				}else if(orientation==3){
					if(d[index]>0){
						return y(d[index]);
					}else{
						return y(0);
					}
				}
			})
			.attr("x",function(d,i){
				if(orientation==0){
					if(d[index]<0){
						return x(d[index]);
					}else{
						return x(0);
					}
				}else if(orientation==1||orientation==3){
					return x(i);
				}else if(orientation==2){
					if(d[index]>0){
						return x(d[index]);
					}else{
						return x(0);
					}
				}
			})
			.attr("width",function(d,i) {
				if(orientation==0){
					if(d[index]<0){
						return x(0)-x(d[index]);
					}else{
						return x(d[index])-x(0);
					}
				}else if(orientation==1||orientation==3){
					return x.rangeBand();
				}else if(orientation==2){
					if(d[index]>0){
						return x(0)-x(d[index]);
					}else{
						return x(d[index])-x(0);
					}
				}
			})
			.attr("height",function(d,i){
				if(orientation==0||orientation==2){
					return y.rangeBand();
				}else if(orientation==1){
					if(d[index]<0){
						return y(0)-y(d[index]);
					}else{
						return y(d[index])-y(0);
					}
				}else if(orientation==3){
					if(d[index]>0){
						return y(0)-y(d[index]);
					}else{
						return y(d[index])-y(0);
					}
				}
				
			});

	svg.append("line")
		.attr("x1",function(){
				if(orientation==0||orientation==2){
					return x(0);
				}else if(orientation==1||orientation==3){
					return xmin;
				}
			})
			.attr("x2",function(){
				if(orientation==0||orientation==2){
					return x(0);
				}else if(orientation==1||orientation==3){
					return xmax;
				}
			})
			.attr("y1",function(){
				if(orientation==0||orientation==2){
					return ymin;
				}else if(orientation==1||orientation==3){
					return y(0);
				}
			})
			.attr("y2",function(){
				if(orientation==0||orientation==2){
					return ymax;
				}else if(orientation==1||orientation==3){
					return y(0);
				}
			})
			.style("stroke","#000");
}