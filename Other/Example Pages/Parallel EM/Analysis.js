
//Least Squares for scatter plot
function leastsquares(data,n,xi,yi){
	sums=[];
	for(var i=0;i<=2*n;++i){
		var t=0;
		for(var j in data){
			t=t+Math.pow(data[j][xi],i);
		}
		sums.push(t);
	}
	Y=[];
	for(var i=0;i<=n;++i){
		var t=0;
		for(var j in data){
			t=t+data[j][yi]*Math.pow(data[j][xi],i);
		}
		Y.push(t);
	}
	var A=[];
	for(var i=0;i<=n;++i){
		var temp=[];
		for(var j=0;j<=n;++j){
			temp.push(sums[i+j]);
		}
		A.push(temp);
	}
	var c=gaussianelim(A,Y);
	var f=function(x){
		var s=c[c.length-1];
		for(var i=c.length-2;i>=0;--i){
			s=s*x+c[i];
		}
		return s;
	}
	return f;
}
function leastsquaresconstants(data,n){
	sums=[];
	for(var i=0;i<=2*n;++i){
		var t=0;
		for(var j in data){
			t=t+Math.pow(data[j][0],i);
		}
		sums.push(t);
	}
	Y=[];
	for(var i=0;i<=n;++i){
		var t=0;
		for(var j in data){
			t=t+data[j][1]*Math.pow(data[j][0],i);
		}
		Y.push(t);
	}
	var A=[];
	for(var i=0;i<=n;++i){
		var temp=[];
		for(var j=0;j<=n;++j){
			temp.push(sums[i+j]);
		}
		A.push(temp);
	}
	var c=gaussianelim(A,Y);
	var f=function(x){
		var s=c[c.length-1];
		for(var i=c.length-2;i>=0;--i){
			s=s*x+c[i];
		}
		return s;
	}
	return c;
}
function gaussianelim(A,y){
	var n=A.length;
	var c=[];
	for(var i=0;i<n;i++){
		c.push(1);
	}
	for(var k=0;k<n-1;++k){
		var pivot=A[k][k];
		for(var i=k+1;i<n;++i){
			var mul=A[i][k]/pivot;
			for(var j=k+1;j<n;++j){
				A[i][j]=A[i][j]-mul*A[k][j];
			}
			y[i]=y[i]-mul*y[k];
		}
	}
	for(var i=n-1;i>=0;--i){
		var sum=0;
		for(var j=i+1;j<n;++j){
			sum=sum+A[i][j]*c[j];
		}
		c[i]=(y[i]-sum)/A[i][i];
	}
	return c;
}
function plotLeastSquares(data,n,xi,yi,numPlottingPoints){
	f=leastsquares(data,n,xi,yi);
	var plot=d3.scale.linear().range([1,numPlottingPoints]).domain(d3.extent(data,function(p){return +p[xi];})).nice();
	var plotpoints=[];
	for(var i=1;i<=numPlottingPoints;++i){
		var xt=plot.invert(i);
		var yt=f(xt);
		temp=new Array();
		temp.push(xt);
		temp.push(yt);
		plotpoints.push(temp);
	}
	return plotpoints;
}

//Kmeans
function kmeansgeneral(data,k,scales,usedistprob){
	var size=data.length,
		labels=[],
		oldlabels=[],
		is=[],
		d,
		mind,
		j,
		p,
		mini,
		sum=new Array(),
		max=[],
		min=[],
		iszero=[],
		num=[];

	if(!usedistprob){
		var karray=new Array();
	}
	for(j=0;j<k;j=j+1){
		is.push(Math.floor(Math.random()*size));
		sum[j]=new Array();
		if(!usedistprob){
			karray.push(new Array());
		}
		var temp=data[is[j]];
		for(var fields in temp){
			if(!usedistprob){
				karray[j].push(parseFloat(temp[fields]));
			}
			sum[j].push(0);
		}
		num.push(0);
		iszero.push(0);
	}
	if(usedistprob){
		karray=chooseSeedsDistProb(data,k,scales);
	}
	while(true){
		for(var j in sum){
			for(var i in sum[j]){
				sum[j][i]=0;
			}
			num[j]=0;
		}

		//Save old labels
		var change=false;
		//Assign new labels
		for(j=0;j<size;j=j+1){
			mini=0;
			mind=scales.length+1;
			var temp=data[j];
			for(i=0;i<k;i=i+1){
				if(iszero[i]==1){
					continue;
				}
				d=0;
				p=0;
				for(var fields in temp){
					d=d+Math.pow((karray[i][p]-parseFloat(temp[fields]))/scales[p],2);
					p=p+1;
				}
				if(d<mind){
					mind=d;
					mini=i;
				}
			}
			change=change||mini!=labels[j];
			labels[j]=mini;
			p=0;
			for(var fields in temp){
				sum[mini][p]=sum[mini][p]+parseFloat(temp[fields]);
				p=p+1;        
			}
			num[mini]=num[mini]+1;
		}
		//Check if labels changed
		if(!change){
			break;
		}
		for(j=0;j<k;j=j+1){
			temp=karray[j];
			if(num[j]!=0){
				for(var i in temp){
					karray[j][i]=sum[j][i]/num[j];
				}
			}else{
				iszero[j]=1;
			}
		}
	}
	var newk=fixkmeans(data,k,labels);
	for(var i in labels){
		labels[i]=newk[labels[i]];
	}
	return labels;
}
function fixkmeans(data,k,labels){
	var vsum=[];
	var min={};
	var max={};
	for(var i in data[0]){
	min[i]=Infinity;
	max[i]=-Infinity;
	}
	for(var i in data){//Finds the ranges in the data
	for(var j in data[i]){
		if(parseFloat(data[i][j])<min[j]){
			min[j]=parseFloat(data[i][j]);
		}
		if(parseFloat(data[i][j])>max[j]){
			max[j]=parseFloat(data[i][j]);
		}
	}
	}
	for(var i in data){//Computes the vector distance for each data point
	var sum=0;
	for(var j in data[i]){
		sum=sum+Math.pow(parseFloat(data[i][j])/(max[j]-min[j])-min[j]/(max[j]-min[j]),2);
	}
	vsum.push(sum);
	}
	var sumk=[];
	var numk=[];
	for(var i in vsum){
	sumk[labels[i]]=0;
	numk[labels[i]]=0;
	}
	for(var i in vsum){//Finds the average vector distance for each label
	sumk[labels[i]]=sumk[labels[i]]+vsum[i];
	numk[labels[i]]=numk[labels[i]]+1;
	}
	var avgk=[];
	for(var i in sumk){
	avgk[i]=new Array(sumk[i]/numk[i],i);
	}
	avgk.sort(function(a,b){return a[0]-b[0];});//Sorts the data by average vector distance
	var newk=[];
	for(var i in avgk){//Creates the array used to switch labels
	newk[avgk[i][1]]=i;
	}
	return newk;
}
function bestk(data,k,iter,usedistprob){
	var scale=[];
	d3.keys(data[0]).forEach(function(d){
		var t=d3.extent(data,function(p){return +p[d];});
		scale.push(t[1]-t[0]);
	});
	var bestlabel=kmeansgeneral(data,k,scale,usedistprob);
	var lowestscore=computeScore(data,k,bestlabel,scale);
	for(var i=0;i<iter-1;++i){
		var currentlabel=kmeansgeneral(data,k,scale,usedistprob);
		var currentscore=computeScore(data,k,currentlabel,scale);
		if(currentscore<lowestscore){
			lowestscore=currentscore;
			bestlabel=currentlabel;
		}
	}
	return bestlabel;
}
function computeScore(data,k,label,scale){
	var uk=[];
	for(var i=0;i<k;++i){
		var temp=[];
		d3.keys(data[0]).forEach(function(d){
			temp.push(d3.mean(data.filter(function(k,j){
				return i==label[j];
			}),function(p){
				return +p[d];
			}));    
		});
		uk.push(temp);
	}
	var score=0;
	for(var i=0;i<data.length;++i){
		for(var j=0;j<data[i].length;++j){
			score+=Math.pow((data[i][j]-uk[label[i]][j])/scale[j],2);
		}
	}
	return score;
}
function chooseSeedsDistProb(data,k,scales){
	var entries=data.length,
		dimensions=data[0].length,
		alldist=[],
		uk=[],
		is=[];
	is.push(Math.floor(Math.random()*entries));
	for(var z=1;z<=k;++z){
		mdist=[];
		for(var i=0;i<entries;++i){
			var sum=0;
			for(var j=0;j<dimensions;++j){
			 	sum=sum+Math.pow((data[i][j]-data[is[z-1]][j])/scales[j],2);
			}
			alldist.push(new Array());
			alldist[i].push(sum);
			mdist.push(d3.min(alldist[i]));
		}
		var p=Math.random()*d3.sum(mdist);
		for(var i=0;i<entries;++i){
			p=p-mdist[i];
			if(p<0){
				is.push(i);
				uk.push(new Array());
				for(var j=0;j<dimensions;++j){
					uk[uk.length-1].push(parseFloat(data[i][j]));
				}
				break;
			}
		}
	}
	return uk;
}

//Order
function lserror(data,n){
	var f=leastsquares(data,n);//Gets the interpolant
	err=0;
	for(var i in data){//Finds the error
		err=err+Math.pow(f(data[i][0])-data[i][1],2);
	}
	return err;
}
function gaussianelim(A,y){
	var n=A.length;
	var c=[];
	for(var i=0;i<n;i++){
		c.push(1);
	}
	for(var k=0;k<n-1;++k){//Converts matrix to a upper triangular matrix
		var pivot=A[k][k];
		for(var i=k+1;i<n;++i){
			var mul=A[i][k]/pivot;
			for(var j=k+1;j<n;++j){
				A[i][j]=A[i][j]-mul*A[k][j];
			}
			y[i]=y[i]-mul*y[k];
		}
	}
	for(var i=n-1;i>=0;--i){//Performs backsubstution to find c
		var sum=0;
		for(var j=i+1;j<n;++j){
			sum=sum+A[i][j]*c[j];
		}
		c[i]=(y[i]-sum)/A[i][i];
	}
	return c;
}
function leastsquares(data,n){
	sums=[];
	for(var i=0;i<=2*n;++i){//Gets the sums of all x for powers between 1 and 2n
		var t=0;
		for(var j in data){
			t=t+Math.pow(data[j][0],i);
		}
		sums.push(t);
	}
	Y=[];
	for(var i=0;i<=n;++i){//Creates the vector Y wich is the sum of all y times x^k for k between 1 and n
		var t=0;
		for(var j in data){
			t=t+data[j][1]*Math.pow(data[j][0],i);
		}
		Y.push(t);
	}
	var A=[];
	for(var i=0;i<=n;++i){//Creates the vector A which contains the sums of the powers of x, the power of x and i,j is i+j for i and j between 0 and n
		var temp=[];
		for(var j=0;j<=n;++j){
			temp.push(sums[i+j]);
		}
		A.push(temp);
	}
	var c=gaussianelim(A,Y);//Finds the constants
	var f=function(x){//Constructs a variable which is the interpolant
		var s=c[c.length-1];//Uses horner's method to compute the polynomial
		for(var i=c.length-2;i>=0;--i){
			s=s*x+c[i];
		}
		return s;
	}
	return f;
}
function order(data,useCrosses){
	if(useCrosses){
		var error=errmatrixCrosses(data);//Gets the edge weights
	}else{
		var error=errmatrix(data);
	}
	var order=[];
	for(var i=0;i<data[0].length;++i){
		order.push(i);
	}
	var l=order.length;
	var bestorder=order;
	var bestscore=Infinity;
	while(true){
		var totalscore=0;
		for(var i=0;i<l-1;++i){//Computes the score for the order
			totalscore+=error[d3.min([order[i],order[i+1]])][d3.max([order[i],order[i+1]])];
		}
		if(totalscore<bestscore){//Keeps track of the best order
			bestscore=totalscore;
			bestorder=[];
			for(var o in order){
				bestorder.push(order[o]);
			}
		}
	//Get next permutation
	var sw=false;
	for(var i=l-2;i>=0;--i){
		if(order[i]<order[i+1]){
		for(var j=l-1;j>i;--j){
			if(order[i]<order[j]){
			sw=true;
			break;
			}
		}
		if(sw){
			order=swap(order,i,j);
			for(var k=1;k<=(l-i)/2;++k){//Reverse the array from i+1 to the end of the matrix
			order=swap(order,k+i,l-k);
			}
		}
		break;
		}
	}
	if(!sw){
		break;
	}
	}
	//Swaps indices a and b in array o
	function swap(o,a,b){
	var temp=o[a];
	o[a]=o[b];
	o[b]=temp;
	return order
	}
	return bestorder;
}
function errmatrix(data){
	var d=data[0].length;
	var E=[];
	for(var i=0;i<d;++i){
	var t=[];
	for(var j=0;j<d;++j){
		if(j>i){
			//Adds the error for the pair of dimensions i and j
			t.push(d3.min([(linError(data,i,j)+linError(data,j,i))/2,quadError(data,i,j),quadError(data,j,i)]));
		}else{
			t.push(0);
		}
	}
		E.push(t);
	}
	return E;
}
function linError(data,x,y){
	//data is the data
	//x is the index for the x coordinate
	//y is the index for the y coordinate
	sums=[];
	for(var i=0;i<=2;++i){
		var t=0;
		for(var j in data){
			t=t+Math.pow(data[j][x],i);
		}
		sums.push(t);
	}
	Y=[];
	for(var i=0;i<=1;++i){
		var t=0;
		for(var j in data){
			t=t+data[j][y]*Math.pow(data[j][x],i);
		}
		Y.push(t);
	}
	var A=[];
	for(var i=0;i<=1;++i){
		var temp=[];
		for(var j=0;j<=1;++j){
			temp.push(sums[i+j]);
		}
		A.push(temp);
	}
	var clin=gaussianelim(A,Y);
	var flin=function(x){
		var s=clin[clin.length-1];
		for(var i=clin.length-2;i>=0;--i){
			s=s*x+clin[i];
		}
		return s;
	}
	var ranges=[];
	d3.keys(data[0]).forEach(function(d){//Finds the ranges of the data
	ranges.push(d3.extent(data,function(p){return +p[d];}));
	});
	err=0;
	for(var i in data){
		err=err+Math.pow(flin(data[i][x])-data[i][y],2);
	}
	return err/(ranges[y][1]-ranges[y][0])/(ranges[y][1]-ranges[y][0]);//Normalizes the error
}
function quadError(data,x,y){
	//data is the data
	//x is the index for the x coordinate
	//y is the index for the y coordinate
	sums=[];
	for(var i=0;i<=4;++i){
		var t=0;
		for(j in data){
			t=t+Math.pow(data[j][x],i);
		}
		sums.push(t);
	}
	Y=[];
	for(var i=0;i<=2;++i){
		var t=0;
		for(j in data){
			t=t+data[j][y]*Math.pow(data[j][x],i);
		}
		Y.push(t);
	}
	var A=[];
	for(var i=0;i<=2;++i){
		var temp=[];
		for(var j=0;j<=2;++j){
			temp.push(sums[i+j]);
		}
		A.push(temp);
	}
	var cquad=gaussianelim(A,Y);
	var fquad=function(x){
		var s=cquad[cquad.length-1];
		for(var i=cquad.length-2;i>=0;--i){
			s=s*x+cquad[i];
		}
		return s;
	}
	var mm=-cquad[1]/2/cquad[2];//X value of minima/maxima
	var side=[0,0];
	for(var i in data){//Checks which side of the maxima/minima the data is 
	if(data[i][x]>mm){
		side[0]++;
	}
	if(data[i][x]<mm){
		side[1]++;
	}
	}
	var scale=d3.min([side[0],side[1]])/(side[0]+side[1]);//Applies an error based on how the data is located in relation to the maxima/minima
	var ranges=[];
	d3.keys(data[0]).forEach(function(d){//Gets range of data
	ranges.push(d3.extent(data,function(p){return +p[d];}));
	});
	err=0;
	for(var i in data){
		err=err+Math.pow(fquad(data[i][x])-data[i][y],2);
	}
	return (1+scale*10)*err/(ranges[y][1]-ranges[y][0])/(ranges[y][1]-ranges[y][0]);//Normalizes error
}
function countCrosses(data,x,y){
	crosses=0;
	for(var i=0;i<data.length-1;++i){
	for(var j=i+1;j<data.length;++j){
		if((parseFloat(data[i][x])>parseFloat(data[j][x]) && parseFloat(data[i][y])<parseFloat(data[j][y])) || (parseFloat(data[i][x])<parseFloat(data[j][x]) && parseFloat(data[i][y])>parseFloat(data[j][y])) || (parseFloat(data[i][x])==parseFloat(data[j][x]) && parseFloat(data[i][y])==parseFloat(data[j][y]))){
		crosses++;
		}
	}
	}
	return crosses;
}
function errmatrixCrosses(data){
	var d=data[0].length;
	var E=[];
	for(var i=0;i<d;++i){
	var t=[];
	for(var j=0;j<d;++j){
		if(j>i){
		t.push(countCrosses(data,i,j));
		}else{
		t.push(0);
		}
	}
	E.push(t);
	}
	return E;
}
function reorderData(data,names,ord){
	nnames=[];
	ndata=[];
	for(var j=0;j<data.length;++j){
		ndata.push([]);
	}
	for(var i=0;i<ord.length;++i){
		nnames.push(names[ord[i]]);
		for(var j=0;j<data.length;++j){
			ndata[j].push(data[j][ord[i]]);
		}
	}
	return {data:ndata,names:nnames};
}

//Image Parallel Coordinates
function arrayToColor(array){
	if(array.length!=3){
		return "#000000";
	}
	var col="#"+convertToHex(array[0],1)+convertToHex(array[1],1)+convertToHex(array[2],1);
	return col;
}
function convertToHex(val,n){
	var x=n,
		ret="";
	if(val>Math.pow(16,n+1)||val<0){
		for(var i=0;i<n;i++){
			ret=ret+"0";
		}
		return ret;
	}
	while(x>=0){
		fv=val/Math.pow(16,x);
		hv=hexDigits(fv);
		val=val-hv.v*Math.pow(16,x);
		ret=ret+hv.d;
		x=x-1;
	}
	return ret;
}
function hexDigits(val){
	if(val>=16||val<0){
		return {d:"0",v:0};
	}
	if(val>=15){
		return {d:"F",v:15};
	}
	if(val>=14){
		return {d:"E",v:14};
	}
	if(val>=13){
		return {d:"D",v:13};
	}
	if(val>=12){
		return {d:"C",v:12};
	}
	if(val>=11){
		return {d:"B",v:11};
	}
	if(val>=10){
		return {d:"A",v:10};
	}
	if(val>=9){
		return {d:"9",v:9};
	}
	if(val>=8){
		return {d:"8",v:8};
	}
	if(val>=7){
		return {d:"7",v:7};
	}
	if(val>=6){
		return {d:"6",v:6};
	}
	if(val>=5){
		return {d:"5",v:5};
	}
	if(val>=4){
		return {d:"4",v:4};
	}
	if(val>=3){
		return {d:"3",v:3};
	}
	if(val>=2){
		return {d:"2",v:2};
	}
	if(val>=1){
		return {d:"1",v:1};
	}
	if(val>=0){
		return {d:"0",v:0};
	}
}
function imagecolors(data){
	var colors=[];
	for(var point in data){
		colors.push(arrayToColor(data[point]));
	}
	return colors;
}
function imageLabels(data,labels,k){
	var uk=[];
	for(var i=0;i<k;++i){
		var temp=[];
		d3.keys(data[0]).forEach(function(d){
			temp.push(d3.mean(data.filter(function(k,j){
				return i==labels[j];
			}),function(p){
				return +p[d];
			}));   
		});
		uk.push(temp);
	}
	var colors=imagecolors(uk);
	return colors;
}


//Compare labels
function purityScore(cl1,cl2){
	var	ucl1=findUniqueElements(cl1),
		ucl2=findUniqueElements(cl2),
		purity=0,
		n=cl1.length;
	for(i in ucl1){
		var ms=0;
		for(j in ucl2){
			var s=0;
			for(var x=0;x<n;++x){
				if(ucl1[i]==cl1[x]&&ucl2[j]==cl2[x]){
					s++;
				}
			}
			if(s>ms){
				ms=s;
			}
		}
		purity+=ms/n
	}
	return purity;
}
function findUniqueElements(arr){
	unique=[];
	for(i in arr){
		var found=false;
		for(j in unique){
			if(arr[i]==unique[j]){
				found=true
				break;
			}
		}
		if(!found){
			unique.push(arr[i]);
		}
	}
	return unique;
}


//EM and all of its functions
function bestEM(data,k,eps,maxiter,iter){
	var scale=[];
	d3.keys(data[0]).forEach(function(d){
		scale.push(1);
	});
	var bestWeights=EM(data,k,eps,maxiter);
	var lowestscore=computeScore(data,k,computeLabels(bestWeights),scale);
	for(var i=0;i<iter-1;++i){
		var currentWeights=EM(data,k,eps,maxiter);
		var currentscore=computeScore(data,k,computeLabels(bestWeights),scale);
		if(currentscore<lowestscore){
			lowestscore=currentscore;
			bestWeights=currentWeights;
		}
	}
	return bestWeights;
}
function EM(data,k,eps,maxiter){
	var w=initWeightDistProb(data,k),
		mu=computeMeans(data,w,k),
		covar=initCovar(k,data[0].length);
		prob=computeProb(data,w,k),
		t=0;
	while(true){
		var oldmu=mu.concat();
		w=computeWeights(data,k,mu,covar,prob);
		mu=computeMeans(data,w,k);
		covar=computeCovar(data,w,k,mu);
		prob=computeProb(data,w,k);
		t+=1;
		if(end(mu,oldmu,eps)||t>=maxiter){
			break;
		}
	}
	return w;
}
function computeLabels(weights){
	labels=[];
	for(i in weights){
		labels.push(maxIndex(weights[i]));
	}
	return labels;
}
function maxIndex(arr){
	var mi=-1;
	for(i in arr){
		if(mi==-1){
			mi=i;
			mv=arr[i];
		}
		if(arr[i]>mv){
			mi=i;
			mv=arr[i];
		}
	}
	return mi;
}
function initWeight(data,k,rand){
	var w=makeArray([data.length,k],0);
	if(rand){
		for(p in data){
			w[p][Math.floor(Math.random()*k)]=1;
		}
	}else{
		for(p in data){
			w[p][Math.floor(p*k/data.length)]=1;
		}
	}
	return w;
}
function initWeightDistProb(data,k){
	var scale=[];
	d3.keys(data[0]).forEach(function(d){
		var t=d3.extent(data,function(p){return +p[d];});
		scale.push(t[1]-t[0]);
	});
	var uk=chooseSeedsDistProb(data,k,scale),
		w=makeArray([data.length,k],0);
	for(i in data){
		var mini=-1,
			mindist=Infinity,
			p=data[i];
		for(j in uk){
			var u=uk[j],
				sum=0;
			for(x in p){
				sum+=Math.pow((u[x]-p[x])/scale[x],2)
			}
			if(mindist>sum){
				mindist=sum;
				mini=j;
			}
		}
		w[i][mini]=1;
	}
	return w;
}
function initCovar(k,d){
	var covar=makeArray([k,d,d],0);
	for(var i=0;i<k;++i){
		for(var j=0;j<d;++j){
			covar[i][j][j]=1.0;
		}
	}
	return covar;
}
function computeMeans(data,w,k){
	var sp=makeArray([k,data[0].length],0.0),
		sw=makeArray([k],0);
	for(x in data){
		var point=data[x],
			wp=w[x];
		for(i in wp){
			var fact=wp[i];
			sw[i]+=fact;
			for(dim in point){
				sp[i][dim]+=point[dim]*fact;
			}
		}
	}
	for(x in sp){
		for(y in sp[x]){
			sp[x][y]=sp[x][y]/sw[x];
		}
	}
	return sp;
}
function computeProb(data,w,k){
	var n=data.length,
		sw=makeArray([k],0);
	for(x in w){
		wp=w[x];
		for(i in wp){
			var fact=wp[i];
			sw[i]+=fact/n;
		}
	}
	return sw;
}
function computeCovar(data,w,k,mu){
	var covar=makeArray([k,data[0].length,data[0].length],0),
		sw=makeArray([k],0);
	for(x in data){
		var point=data[x],
			wp=w[x];
		for(i in wp){
			var fact=wp[i],
				locmu=mu[i];
			sw[i]+=fact;
			covar[i]=addMatrix(covar[i],meanDifOuterProdut(point,locmu,fact));
		}
	}

	for(x in covar){
		for(y in covar[x]){
			for(z in covar[x][y]){
				covar[x][y][z]=covar[x][y][z]/sw[x];
			}
		}
	}
	return covar;
}
function computeWeights(data,k,mu,covar,prob){
	var w=makeArray([data.length,k],0);
	for(var i=0;i<mu.length;++i){
		var fi=multivariateGaussianDistribution(mu[i],covar[i]);
		for(var x in data){
			w[x][i]=fi(data[x])*prob[i];
		}
	}
	var nw=makeArray([data.length,k],0);
	for(var i in w){
		nw[i]=normalize(w[i]);
	}
	return nw;
}
function multivariateGaussianDistribution(mu,covar){
	var dims=mu.length,
		det=determinant(covar);
	if(det==0){
		return function(x){return 0;};
	}
	var denom=Math.pow(Math.PI*2,dims/2)*Math.sqrt(det),
		inv=inverse(covar),
		f=function(x){
			var dif=addArray(negArray(mu),x),
				expval=vvDotProduct(vmDotProduct(dif,inv),dif)/2;
				result=1/denom*Math.exp(-expval);
			if(checkINF(result)){
				return Math.pow(10,20);
			}
			return result;
		}
	return f;
}
function end(mu,oldmu,eps){
	var s=0;
	for(i in mu){
		for(j in mu[i]){
			s=s+Math.pow(mu[i][j]-oldmu[i][j],2);
		}
	}
	return eps>=s;
}
//Makes an array with length d and all entries with value v
function makeArray(ds,v){
	var rtn=[];
	if(ds.length==1){
		for(var j=0;j<ds[0];++j){
			rtn.push(v);
		}
		return rtn;
	}
	var av=makeArray(ds.slice(1),v);
	//alert(copyValue(av))
	for(var j=0;j<ds[0];++j){
		rtn.push(av.concat());
	}
	return rtn;
}
//Adds two arrays together
function addArray(arr1,arr2){
	var rtn=[];
	for(i in arr1){
		rtn.push(arr1[i]+arr2[i]);
	}
	return rtn;
}
function negArray(arr){
	rtn=[];
	for(i in arr){
		rtn.push(0-arr[i]);
	}
	return rtn;
}
function vmDotProduct(v,m){
	var rtn=[];
	for(i in m){
		rtn.push(vvDotProduct(v,m[i]));
	}
	return rtn;
}
function vvDotProduct(v1,v2){
	var s=0;
	for(var i in v1){
		s+=v1[i]*v2[i];
	}
	return s;
}
function normalize(v){
	var s=0;
	for(var i in v){
		if(checkNAN(v[i])){
			v[i]=0;
		}
		s+=v[i];
	}
	var rtn=[];
	for(var i in v){
		if(checkNAN(v[i]/s)){
			rtn.push(1);
			continue;
		}
		rtn.push(v[i]/s);
	}
	return rtn;
}
function addMatrix(m1,m2){
	var rtn=[];
	for(var i in m1){
		var temp=[];
		for(var j in m1[i]){
			temp.push(m1[i][j]+m2[i][j]);
		}
		rtn.push(temp);
	}
	return rtn;
}
function meanDifOuterProdut(x,mu,w){
	var matrix=makeArray([x.length,x.length],0);
	for(var i in x){
		for(var j in x){
			matrix[i][j]=(x[i]-mu[i])*(x[j]-mu[j])*w;
		}
	}
	return matrix;
}
function printMatrix(arr){
	s=""
	for(var x in arr){
		for(var y in arr[x]){
			s+=arr[x][y]
			if(y!=arr[x].length-1){
				s+=" ";
			}
		}
		s+="\n"
	}
	alert(s)
}
function determinant(matrix){
	if(matrix.length==2){
		return matrix[0][0]*matrix[1][1]-matrix[0][1]*matrix[1][0];
	}
	var i=0,
		s=0;
	for(var j in matrix){
		s=s+Math.pow(-1,j)*matrix[i][j]*determinant(removeRC(matrix,i,j));
	}
	return s;
}
function removeRC(matrix,i,j){
	var rtn=[];
	for(var x in matrix){
		if(x==i){
			continue;
		}
		var temp=[];
		for(var y in matrix[x]){
			if(y==j){
				continue;
			}
			temp.push(matrix[x][y]);
		}
		rtn.push(temp);
	}
	return rtn;
}
//Gauss-Jordan Elimination
function inverse(matrix){
	exm=addIdentity(matrix);
	for(var i=0;i<exm.length;++i){
		var pivot=exm[i][i];
		if(pivot==0){
			throw 'Singular Matrix'
		}
		for(var j=i+1;j<exm.length;++j){
			var m=exm[j][i]/pivot;
			for(var k=i;k<exm[j].length;++k){
				exm[j][k]=exm[j][k]-m*exm[i][k];
			}
		}
	}
	for(var i=0;i<exm.length;++i){
		var pivot=exm[i][i];
		if(pivot==0){
			throw 'Singular Matrix'
		}
		for(var j=i-1;j>=0;--j){
			var m=exm[j][i]/pivot;
			for(var k=i;k<exm[j].length;++k){
				exm[j][k]=exm[j][k]-m*exm[i][k];
			}
		}
	}
	for(var i=0;i<exm.length;++i){
		var m=exm[i][i];
		for(var j=i;j<exm[i].length;++j){
			exm[i][j]=exm[i][j]/m;
		}
	}
	var rtn=[];
	for(var i in exm){
		rtn.push(exm[i].slice(exm[i].length/2));
	}
	return rtn;
}
function addIdentity(matrix){
	nm=matrix.concat();
	for(var i in matrix){
		for(var j in matrix[i]){
			if(i==j){
				matrix[i].push(1);
			}else{
				matrix[i].push(0);
			}
		}
	}
	return nm;
}
function checkNAN(v){
	if(v.length==undefined){
		return isNaN(v);
	}
	var result=false;
	for(var i in v){
		result=result||checkNAN(v[i]);
	}
	return result;
}
function checkINF(v){
	if(v.length==undefined){
		return v == Number.POSITIVE_INFINITY || v == Number.NEGATIVE_INFINITY;
	}
	var result=false;
	for(var i in v){
		result=result||checkINF(v[i]);
	}
	return result;
}

//Combining colors from EM weights
function weightedAverageColors(weights,colors){
	var colarr=[];
	for(var c in colors){
		colarr.push(colorToArray(colors[c]));
	}
	var fcolarr=[0,0,0];
		sw=0;
	for(var i in colarr){
		for(var j in colarr[i]){
			fcolarr[j]+=colarr[i][j]*weights[i];
		}
		sw+=weights[i];
	}
	for(var i in fcolarr){
		fcolarr[i]=Math.floor(fcolarr[i]/sw);
	}
	return arrayToColor(fcolarr);
}
function colorToArray(color){
	var d=0,
		c=color.slice(1),
		arr=[],
		s=1;
	if(color.length==7){
		d=2;
	}else if(color.length==4){
		d=1;
		s=16;
	}else{
		return [0,0,0];
	}
	for(var i=0;i<c.length;i+=d){
		arr.push(hexTo10(c.substring(i,i+d))*s);
	}
	return arr;
}
function hexTo10(h){
	ten=0;
	for(var i=0;i<h.length;++i){
		ten+=Math.pow(16,h.length-i-1)*fromHexDig(h[i]);
	}
	return ten;
}
function fromHexDig(d){
	if(d=="F"||d=="f"){
		return 15;
	}
	if(d=="E"||d=="e"){
		return 14;
	}
	if(d=="D"||d=="d"){
		return 13;
	}
	if(d=="C"||d=="c"){
		return 12;
	}
	if(d=="B"||d=="b"){
		return 11;
	}
	if(d=="A"||d=="a"){
		return 10;
	}
	if(d=="9"){
		return 9;
	}
	if(d=="8"){
		return 8;
	}
	if(d=="7"){
		return 7;
	}
	if(d=="6"){
		return 6;
	}
	if(d=="5"){
		return 5;
	}
	if(d=="4"){
		return 4;
	}
	if(d=="3"){
		return 3;
	}
	if(d=="2"){
		return 2;
	}
	if(d=="1"){
		return 1;
	}
	return 0;
}

//pie chart
function nestedSum(v){
	var s=0;
	if(!isNaN(v)){
		if(v.length==1){
			return nestedSum(v[0]);
		}
		return v;
	}
	var z=v.concat()
	for(var i in z){
		s+=nestedSum(z[i]);
	}
	return s;
}
function addNoise(col,r){
	arr=colorToArray(col);
	while(true){
		newarr=[];
		for(i in arr){
			t=arr[i]+Math.floor(Math.random()*2*r-r);
			if(t<0){
				t=0
			}else if(t>255){
				t=255
			}
			newarr.push(t);
		}
		s=0;
		for(i in arr){
			s=s+Math.abs(arr[i]-newarr[i]);
		}
		if(s>=r){
			break;
		}
	}
	return arrayToColor(newarr);
}


//Kernel Kmeans
function bestkKernelK(kernel,k,eps,iters){
	var bestLabel=kernelKmeans(kernel,k,eps),
		bestScore=computerKernelScore(kernel,k,bestLabel);
	for(var i=1;i<iters;++i){
		var currentLabel=kernelKmeans(kernel,k,eps),
			currentScore=computerKernelScore(kernel,k,currentLabel)
		if(currentScore>bestScore){
			bestScore=currentScore;
			bestLabel=currentLabel;
		}
	}
	return bestLabel;
}
function kernelKmeans(kernel,k,eps){
	var labels=initKernelLabels(kernel,k);
	while(true){
		var oldlabels=labels.concat(),
			clusterSum=makeArray([k],0),
			clusterNum=makeArray([k],0);
		for(var i in oldlabels){
			clusterNum[oldlabels[i]]+=1;
			for(var j in oldlabels){
				if(oldlabels[i]==oldlabels[j]){
					clusterSum[oldlabels[i]]+=kernel[i][j]
				}
			}
		}
		for(var i in clusterSum){
			clusterSum[i]=clusterSum[i]/Math.pow(clusterNum[i],2)
		}
		for(var i in kernel){
			var pointSum=makeArray([k],0);
			for(var j in oldlabels){
				pointSum[oldlabels[j]]+=kernel[i][j]
			}

			for(var j in pointSum){
				pointSum[j]=2*pointSum[j]/clusterNum[j]
			}
			var mind=Infinity,
				mini=-1;
			for(var j in pointSum){
				var d=clusterSum[j]-pointSum[j];
				if(d<mind){
					mind=d
					mini=j
				}
			}
			labels[i]=mini;
		}
		if(kernelEnd(labels,oldlabels,eps)){
			break;
		}
	}
	return labels
}
function initKernelLabels(kernel,k){
	var labels=makeArray([kernel.length],0);
	for(var i in labels){
		labels[i]=Math.floor(Math.random()*k);
	}
	return labels;
}
function initKernelLabelsDistProb(kernel,k){
	var uk=[];
	uk.push(Math.floor(Math.random()*kernel.length))
	for(var i=1;i<k;++i){
		var mindist=makeArray([kernel.length],Infinity);
		for(var x in mindist){
			for(var y in uk){
				if(x==uk[y]){
					mindist[x]=0;
					break;
				}
				if(mindist[x]>kernel[x][uk[y]]){
					mindist[x]=kernel[x][uk[y]];
				}
			}
		}
		var p=Math.random()*sum(mindist)
		for(x in mindist){
			if(mindist[x]>p){
				uk.push(x)
				break;
			}
			p-=mindist[x];
		}
	}
	var labels=makeArray([kernel.length],-1)
	for(var i in labels){
		for(var y in uk){
			if(i==uk[y]){
				labels[i]=y;
				break;
			}
			if(kernel[i][uk[labels[i]]]>kernel[i][uk[y]]){
				labels[i]=y;
			}
		}
	}
	return labels;
}
function kernelEnd(labels,oldlabels,eps){
	var sum=0;
	for(var i in labels){
		if(labels[i]==oldlabels[i]){
			sum+=1
		}
	}
	return 1-(sum/labels.length)<=eps;
}
function makeKernel(data,Kfun){
	K=makeArray([data.length,data.length],0);
	for(var i in data){
		for(var j in data){
			K[i][j]=Kfun(data[i],data[j])
		}
	}
	return K;
}
function getPolyKernel(n){
	var f=function(x,y){
		var s=0;
		for(var i in x){
			s+=Math.pow(parseFloat(x[i])*parseFloat(y[i]),n)
		}
		return s;
	}
	return f;
}
function getGaussianKernel(sigma){
	var f=function(x,y){
		var n=0
		for(i in x){
			n+=Math.pow(x[i]-y[i],2)
		}
		return Math.exp(-n/2/Math.pow(sigma,2));
	}
	return f
}
function computerKernelScore(kernel,k,labels){
	var numCluster=makeArray([k],0),
		sumCluster=makeArray([k],0)
	for(var i in labels){
		numCluster[i]+=1
		for(var j in labels){
			if(labels[i]!=labels[j]){
				continue
			}
			sumCluster[labels[i]]+=kernel[i][j]
		}
	}
	var total=0;
	for(var i in labels){
		var sumPoint=0;
		for(var j in labels){
			if(labels[i]!=labels[j]){
				continue
			}
			sumPoint+=kernel[i][j]
		}
		total+=kernel[i][i]-2/numCluster[labels[i]]*sumPoint+1/Math.pow(numCluster[labels[i]],2)*sumCluster[i];
	}
	return total;
}