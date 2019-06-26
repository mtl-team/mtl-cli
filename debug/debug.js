
var debugAndroid = function(){
    var data = {
        "t1":"t1~v",
        "t2":"t2v"
    }
    var x = require('../src/mtl_create').test(data);
    console.log(x);
}

debugAndroid();