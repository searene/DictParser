function bar() {
    var obj = {
        foo: () => {
            console.log(this); // this?
        }
    };
    obj.foo();
}
bar();
