function makePieChart(data,options){
	var w=getInputParam(options["width"],0),
		h=getInputParam(options["height"],0),
		m=getInputParam(options["margins"],[0,0,0,0]),
		tag=getInputParam(options["tag"],"body"),
		tindex=getInputParam(options["textindex"],-1),
		r=getInputParam(options["radius"],d3.min([w-m[1]-m[3],h-m[0]-m[2]])/2),
		cs=getInputParam(options["colors"],d3.scale.category20c()),
		cclass=getInputParam(options["class"],"pieChart"),
		src=getInputParam(options["source"],"csv"),
		addqbinfo=getInputParam(options["addtionalqbthings"],{});

	if(src=='qb'){
		data=convertQBData(data,addqbinfo);
	}
	var options={height:h,width:w,margins:m,tag:tag,colors:cs,class:cclass,radius:r,textindex:tindex};
	drawPieChart(data,options);
}
function drawPieChart(data,options){
	var width=getInputParam(options["width"],0),
		height=getInputParam(options["height"],0),
		margins=getInputParam(options["margins"],[0,0,0,0]),
		tag=getInputParam(options["tag"],"body"),
		tindex=getInputParam(options["textindex"],-1),
		colors=getInputParam(options["colors"],["#0090FF","#FF0000","#FFD300"]),
		radius=getInputParam(options["radius"],d3.min([width-margins[1]-margins[3],height-margins[0]-margins[2]])/2),
		cclass=getInputParam(options["class"],"pieChart");
	var w=width-margins[1]-margins[3],
		h=height-margins[0]-margins[2],
		colIndices=[];
	for(i in data){
		colIndices.push(i)
	}
	var colspace=d3.scale.linear().domain(colIndices).range(colors);

	var startAngle=0,
		maxlevel=-1;
	var ndata=makeArc(data,0,Math.PI*2,true,-1,"")
	function makeArc(val,startAngle,endAngle,skip,level,color){
		if(level>maxlevel){
			maxlevel=level
		}
		var arcs=[]
		if(!skip){
			var a={data:{data:val,value:nestedSum(val),startAngle:startAngle,endAngle:endAngle},radius:level,color:color}
			arcs.push(a)
		}
		if(!isNaN(val)&&val.length>1){
			return arcs
		}
		var s=startAngle,
			total=nestedSum(val);
		
		for(j in val){
			var e=s+nestedSum(val[j])/total*(endAngle-startAngle);
			if(color!=""){
				ncolor=addNoise(color,50)
			}else{
				ncolor=colspace(j)
			}
			var narcs=makeArc(val[j],s,e,false,level+1,ncolor)
			for(j in narcs){
				arcs.push(narcs[j]);
			}
			s=e;
		}
		return arcs
	}
	var svg = d3.select("body")
		.append("svg:svg") 
		.data([data])
			.attr("class",cclass)
			.attr("width", w) 
			.attr("height", h)
		.append("svg:g")
			.attr("transform", "translate(" + (radius+margins[3]) + "," + (radius+margins[0]) + ")")

	var arc = d3.svg.arc();

	var arcs = svg.selectAll("g.slice")
		.data(ndata)
		.enter()
			.append("svg:g")
				.attr("class", "slice");

		arcs.append("svg:path")
				.attr("fill", function(d) { return d['color']; } )
				.attr("d", function(d){
					var narc=arc.innerRadius(d['radius']/(maxlevel+1)*radius).outerRadius((d['radius']+1)/(maxlevel+1)*radius)
					return narc(d['data'])
				});

	if(tindex!=-1){
		arcs.append("svg:text")
				.attr("transform", function(d) {
				d.innerRadius = 0;
				d.outerRadius = radius;
				return "translate(" + arc.centroid(d) + ")";
			})
			.attr("text-anchor", "middle")
			.text(function(d, i) { return data[i][tindex]; });
	}
}