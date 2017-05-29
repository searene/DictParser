var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
function fetchSomething() {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve("future value");
        }, 500);
    });
}
function run() {
    return __awaiter(this, void 0, void 0, function* () {
        let contents = yield fetchSomething();
        console.log(contents);
    });
}
run();
function () {
    return spawn();
}
//# sourceMappingURL=Test.js.map