var p1 = new Promise(function (resolve, reject) {
    resolve("sucess");
});
p1.then(function (code) {
    console.log(code);
}).then(function () {
    console.log("How about this?");
}, function () {
    console.log("This is not fired");
});
