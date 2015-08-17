var renderGraph = function(results, means){

    $('#container').highcharts({
        chart: {
            type: 'scatter'
        },
        title: {
            text: 'Value v. Scarcity'
        },
        xAxis:{
            title: 'Value'
        },
        yAxis: {
            title: 'Scarcity'
        },
        series: results,
        plotOptions: {
                scatter: {
                    tooltip: {
                        headerFormat:'',
                        pointFormat: '<b>{point.name}</b><br>{point.x}, {point.y}%'
                    }
            }
        }
    });
}

/**
 * Puts data through kCluster algorithm
 * @param  {array} data  input data of points
 * @param  {array} means the current k means
 */
var kCluster = function(data, means){
    data.forEach(function(point){
        point.mean = means.reduce(function(old, cur){
            var distance = Math.sqrt(Math.pow(Number(point.VAL) - cur.x, 2) + Math.pow(Number(point.VALPER) - cur.y, 2));
            //console.log(distance, point);
            if(old === 0 || old.distance > distance){
                return {name: cur.name, distance: distance};
            }else{
                return old;
            }
        },0).name;
    });

    means.forEach(function(mean){
        var relData = data.filter(function(point){ return point.mean === mean.name });
        if(relData.length){
            mean.x = relData.reduce(function(agg, curr){ return agg + Number(curr.VAL) },0)/relData.length;
            mean.y = relData.reduce(function(agg, curr){ return agg + Number(curr.VALPER) },0)/relData.length;
            }
    });
}

/**
 * takes a number and creates means for that number
 * @param  {number} number amount of means wanted
 * @param  {array}  an array of object related to the data
 * @return {array}  an array of mean objects based on the input number
 */
var createMeans = function(number, data){
    var means = [];
    for(var i = 0; i<number; i++){
        var index = Math.floor(Math.random()*data.length)-1;
        means.push({
            name: i+1,
            x: data[index].VAL,
            y: data[index].VALPER
        });
    }
    return means;
}

$(document).ready(function(){
    var csvConfig = {
        header: true,
        complete: function(results, file){
            var garbage = results.data.splice(62, 1);
            results.data = results.data.map(function(point){
                return {
                    NAME: point.NAME,
                    VAL: point.VAL,
                    VALPER: Number(point.VALPER)/100
                }
            })
            var means = createMeans(6, results.data)

            for(var i = 0; i<500; i++){
                kCluster(results.data, means);
                //console.log(means);
            }
            var modResults = means.map(function(mean){
                return {
                    name: mean.name,
                    data: results.data.filter(function(point){ return point.mean === mean.name; }).map(function(point){
                        return {
                            name: point.NAME,
                            x: Number(point.VAL),
                            y: Number(point.VALPER)
                        };
                    })
                };
            })
            modResults.push({
                name: 'Means',
                color: 'red',
                data: means
            })
            renderGraph(modResults, means);

        }
    };

    $('#confirm').click(function(){
        var file = document.getElementById('fileItem').files[0];
        Papa.parse(file, csvConfig);
    })



});
