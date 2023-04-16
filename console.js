console.fixViewport = function () {
    const viewportHeight = window.visualViewport && window.visualViewport.height || window.innerHeight;
    const screen = document.querySelector("#screen");
    const prompt = document.querySelector("#prompt");
    document.body.style.height = `${viewportHeight}px`;
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
    const promptInput = document.querySelector("#input");
    const attrs = options && options.attrs || { type: 'text' };
    for (let k in attrs) {
        promptInput.setAttribute(k, attrs[k]);
    }
    promptInput.style.visibility = "visible";
    await thread.nextTick();
    promptInput.focus();
    console._readlnResult = undefined;
    while (true) {
        const result = console._readlnResult;
        if (result !== undefined) {
            promptInput.style.visibility = "hidden";
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
        e.target.blur();
        e.preventDefault();
    }
};
window.visualViewport.addEventListener('resize', () => setTimeout(console.fixViewport));
async function loadScript(script, mainFnName) {
    return new Promise((resolve, reject) => {
        const sourceElement = document.querySelector('#source');
        let href = `${script}`;
        const match = location.hostname.match(/^([\w\-]+)\.github\.io$/i);
        if (match)
        href = `https://github.com/${match[1]}/${match[1]}.github.io/blob/main/${script}`
        while (sourceElement.firstChild)
            sourceElement.removeChild(sourceElement.firstChild);
        const loadingTextNode = document.createTextNode(`⌛`)
        sourceElement.appendChild(loadingTextNode);
        sourceElement.setAttribute('href', href);
        sourceElement.appendChild(document.createTextNode(`${script}`));
    
        const scriptElement = document.createElement("script");
        scriptElement.setAttribute("src", script);
        scriptElement.addEventListener("load", () => {
            loadingTextNode.nodeValue = '✔️';
            try {
                if (typeof window[mainFnName] === 'function') {
                    if (/^async function/i.test(window[mainFnName].toString())) {
                        window[mainFnName]().then(resolve).catch(reject);
                        return;
                    } else {
                        window[mainFnName]();
                    }
                } else {
                    throw new Error(`window.${mainFnName} is not a function (${typeof window[mainFnName]})`);
                }
                resolve();
            } catch (e) {
                reject(e);
            }
        });
        
        scriptElement.addEventListener("error", e => {
            loadingTextNode.nodeValue = '❌';
            reject(e);
        });
        document.body.appendChild(scriptElement);
    });
}
console.presentMenu = async function(menu, mainFnName) {
    const allFunctions = [];
    console.println(`欢迎来到大师的程序游戏厅！\n\n我们现在有这些游戏：`);
    let index = 0;
    for (let f in menu) {
        console.println(`[${index + 1}] ${f}`);
        allFunctions.push(f); 
        index++;
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
    await loadScript(menu[choosen], mainFnName);
}
window.addEventListener("load", () => {
    console.fixViewport();
});