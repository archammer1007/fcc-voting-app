$(document).ready(function(){
    
    var labels = poll.options.map(function(option){
        return option.name;
    })
    var data = poll.options.map(function(option){
        return option.votes.length;
    })
    var backgroundColor = generateColours(labels.length);
    var borderColor = [];
    for (var i = 0; i < labels.length; i++){
        borderColor.push("#ffffff");
    }
    
    
    var ctx = document.getElementById("myChart");
    var myChart = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: labels,
            datasets: [{
                label: '# of Votes',
                data: data,
                backgroundColor: backgroundColor,
                borderColor: borderColor,
                borderWidth: 1
            }]
        },
        options: {
            scales: {
            }
        }
    })
})

var generateColours = function(n){
    var hexcodes = []
    for (var i = 0; i < n; i++){
        addHexCode(hexcodes);
    }
    return hexcodes;
}

var addHexCode = function(hexcodes){
    var newCode = generateHexCode();
    var unique = true;
    hexcodes.forEach(function(hexcode){
        if (hexcode == newCode){
            unique = false;
        }
    })
    if (unique){
        hexcodes.push(newCode);
    }
    else{
        addHexCode(hexcodes);
    }
    
}

var generateHexCode = function(){
    var hexdigits = "0123456789abcdef".split("");
    var randlength = hexdigits.length;
    var hexstring = "#";
    for (var i = 0; i < 6; i++){
        hexstring += hexdigits[generateRandom(0, 15)];
    }
    return hexstring;
}

var generateRandom = function(min, max){
    return Math.floor(Math.random() * (max - min)) + min;
}