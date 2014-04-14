
function makeWithCSV(file,fun,options){
	d3.csv(file)
		.get(function(error,rows) {
			fun(rows,options);
		});
}