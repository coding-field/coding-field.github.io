console.fixViewport = function () {
    const viewportHeight = window.visualViewport && window.visualViewport.height || window.innerHeight;
    const screen = document.querySelector("#screen");
    const prompt = document.querySelector("#prompt");
    screen.style.height = `${viewportHeight - prompt.offsetHeight - 20}px`;
    prompt.style.top = `${viewportHeight - prompt.offsetHeight - 10}px`;
    if (window.scrollTo) window.scrollTo(0,0);
    document.body.scrollTop = 0;
    console.scrollToEnd();
};
console.scrollToEnd = function () {
    const screen = document.querySelector("#screen");
    if (console._printScrollTimeout) clearTimeout(console._printScrollTimeout);
    console._printScrollTimeout = setTimeout(() => {
        screen.scrollTop = screen.scrollHeight - screen.clientHeight;
        delete console._printScrollTimeout;
    }, 0);
};
console.print = function (str) {
    if (typeof str !== "string") str = `${str}`;
    const screen = document.querySelector("#screen");
    let screenLastLine;
    let lineIndex = 0;
    for (let line of str.split("\n")) {
        if (lineIndex == 0) {
            if (screenLastLine === undefined) screenLastLine = screen.querySelector(':scope > div:last-child');
            // append to the last line
            if (line) screenLastLine.appendChild(document.createTextNode(line));
        } else {
            screenLastLine = document.createElement("div");
            if (line) screenLastLine.appendChild(document.createTextNode(line));
            screen.appendChild(screenLastLine);
        }
        lineIndex++;
    }
    console.scrollToEnd();
};
console.println = function (str) {
    console.print(`${str}\n`);
};
if (!console._originClear) {
    console._originClear = console.clear;
}
console.clear = function () {
    console._originClear();
    const screen = document.querySelector("#screen");
    screen.innerHTML = "<div></div>";
};
window.thread = {
    sleep: function (timeInMs) {
        return new Promise((resolve, reject) => setTimeout(resolve, timeInMs));
    },
    nextTick: function () {
        return this.sleep(0);
    }
};
console.readln = async function (options) {
    if (options && options.checkFn) {
        const checkFn = options.checkFn;
        const newOptions = { ...options };
        delete newOptions.checkFn;

        while (true) {
            const line = await console.readln(newOptions);
            const error = checkFn(line);
            if (error) {
                console.println(error);
                continue;
            }
            return line;
        }
    }
    const prompt = document.querySelector("#prompt");
    const attrs = options && options.attrs || { type: 'text' };
    for (let k in attrs) {
        prompt.setAttribute(k, attrs[k]);
    }
    prompt.style.visibility = "visible";
    await thread.nextTick();
    prompt.focus();
    console._readlnResult = undefined;
    while (true) {
        const result = console._readlnResult;
        if (result !== undefined) {
            prompt.style.visibility = "hidden";
            return result;
        }
        await thread.sleep(20);
    }
};
console.readlnInt = async function (options) {
    return Number.parseInt(await console.readln({
        attrs: { type: 'number' },
        checkFn: line => {
            if (!/^-?\d+$/.test(line)) {
                return `你输入的不是一个数字！`;
            }
            if (options && options.checkFn) return options.checkFn(line);
            return undefined;
        }
    }));
};
console.onPrompt = function (e) {
    if (e.keyCode === 13) {
        const line = e.target.value;
        e.target.value = "";
        console._readlnResult = line;
        console.print(`${line}\n`);
        e.preventDefault();
    }
};
window.visualViewport.addEventListener('resize', () => setTimeout(console.fixViewport));
window.onload = () => {
    console.fixViewport();
    // document.querySelector("#prompt").addEventListener('focus', () => setTimeout(console.fixViewport));
    // document.querySelector("#prompt").addEventListener('blur', () => setTimeout(console.fixViewport));
    (async () => {
        const allFunctions = [];
        for (let f in window) {
            if (
                typeof window[f] === "function" &&
                !/^_/.test(f) &&
                /^async function/.test(window[f].toString())
            ) {
                allFunctions.push(f);
            }
        }
        console.println(`欢迎来到大师的程序游戏厅！\n\n我们现在有这些游戏：`);
        let index = 0;
        for (let f of allFunctions) {
            index++;
            console.println(`[${index}] ${f}`);
        }
        console.println(`\n请选择你要玩的游戏，并输入它的序号：`);
        const choosenIndex = await console.readlnInt({
            checkFn: number => (
                number < 1 ||
                number > allFunctions.length
            ) && `输入错误，请输入 1 到 ${allFunctions.length} 的游戏序号！`
        });
        const choosen = allFunctions[choosenIndex - 1];
        console.clear();
        console.println(`正在载入 ${choosen}：`);
        await thread.sleep(500);
        console.clear();
        console.println(`加载完毕 ${choosen}`);
        await thread.sleep(500);
        console.clear();
        await window[choosen]();
    })().catch((e) => {
        console.error(e);
        alert(e.message || e);
    });
};