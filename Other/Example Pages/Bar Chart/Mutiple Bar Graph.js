
function makeMutipleBarChart(data,options1){
	var w=0,
		h=0,
		m=[0,0,0,0],
		nticks=0,
		orientation=0,
		tag="body",
		colors=[],
		cclass="mutipleBarChart",
		padding=0;
	for(var i in options1){
		if(i.toLowerCase()=="width"){
			w=options1[i];
		}else if(i.toLowerCase()=="height"){
			h=options1[i];
		}else if(i.toLowerCase()=="margins"){
			m=options1[i];
		}else if(i.toLowerCase()=="nticks"){
			nticks=options1[i];
		}else if(i.toLowerCase()=="orientation"){
			orientation=options1[i];
		}else if(i.toLowerCase()=="tag"){
			tag=options1[i];
		}else if(i.toLowerCase()=="colors"){
			colors=options1[i];
		}else if(i.toLowerCase()=="class"){
			cclass=options1[i];
		}else if(i.toLowerCase()=="padding"){
			padding=options1[i];
		}
	}
	var options2={Height:h,wIDTH:w,Margins:m,nticks:nticks,orientation:orientation,tag:tag,colors:colors,class:cclass,padding:padding};
	drawMutipleBarChart(convertDataMutipleBarChart(data),options2);
}
function drawMutipleBarChart(data,options){
	var width=0,
		height=0,
		margins=[0,0,0,0],
		nticks=0,
		orientation=0,
		tag="body",
		cclass="mutipleBarChart",
		colors=[],
		padding=0;
	for(var i in options){
		if(i.toLowerCase()=="width"){
			width=options[i];
		}else if(i.toLowerCase()=="height"){
			height=options[i];
		}else if(i.toLowerCase()=="margins"){
			margins=options[i];
		}else if(i.toLowerCase()=="nticks"){
			nticks=options[i];
		}else if(i.toLowerCase()=="orientation"){
			orientation=options[i];
		}else if(i.toLowerCase()=="tag"){
			tag=options[i];
		}else if(i.toLowerCase()=="colors"){
			colors=options[i];
		}else if(i.toLowerCase()=="class"){
			cclass=options[i];
		}else if(i.toLowerCase()=="padding"){
			padding=options[i];
		}
	}
	var w=width-margins[1]-margins[3],
		h=height-margins[0]-margins[2],
		maxi=d3.max(data,function(p){return +p[1]}),
		ord=d3.scale.ordinal().domain(data),
		f=function(p) {return parseFloat(p[0]);},
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
   			.attr("class","ticks")
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
    				return y(i)-d[1]*(padding/(maxi+1));
				}else if(orientation==1){
					if(d[0]<0){
	    				return y(d[0]);
	    			}else{
	    				return y(0);
	    			}
				}else if(orientation==3){
					if(d[0]>0){
	    				return y(d[0]);
	    			}else{
	    				return y(0);
	    			}
				}
    		})
    		.attr("x",function(d,i){
    			if(orientation==0){
    				if(d[0]<0){
	    				return x(d[0]);
	    			}else{
	    				return x(0);
	    			}
				}else if(orientation==1||orientation==3){
					return x(i)-d[1]*(padding/(maxi+1));
				}else if(orientation==2){
					if(d[0]>0){
	    				return x(d[0]);
	    			}else{
						return x(0);
	    			}
				}
    		})
    		.attr("width",function(d,i) {
    			if(orientation==0){
    				if(d[0]<0){
	    				return x(0)-x(d[0]);
	    			}else{
	    				return x(d[0])-x(0);
	    			}
				}else if(orientation==1||orientation==3){
					return x.rangeBand()-padding/(maxi+1);
				}else if(orientation==2){
					if(d[0]>0){
	    				return x(0)-x(d[0]);
	    			}else{
	    				return x(d[0])-x(0);
	    			}
				}
    		})
    		.attr("height",function(d,i){
    			if(orientation==0||orientation==2){
    				return y.rangeBand()-padding/(maxi+1);
				}else if(orientation==1){
					if(d[0]<0){
	    				return y(0)-y(d[0]);
	    			}else{
	    				return y(d[0])-y(0);
	    			}
				}else if(orientation==3){
					if(d[0]>0){
	    				return y(0)-y(d[0]);
	    			}else{
	    				return y(d[0])-y(0);
	    			}
				}
    			
    		})
    		.attr("fill",function(d){
    			return colors[d[1]];
    		});

   	svg.append("line")
   			.attr("class","axis")
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