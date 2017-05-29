function fetchSomething(): Promise<string> {
    return new Promise<string>((resolve, reject) => {
        setTimeout(() => {
            resolve("future value");
        }, 500);
    });
}

async function run(): Promise<void> {
    let contents: string = await fetchSomething();
    console.log(contents);
}

run();

function(): Promise<void> {
    return spawn()
}