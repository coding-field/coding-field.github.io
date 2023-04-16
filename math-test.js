async function 加法测试() {
    let index = 0;
    let right = 0, wrong = 0;
    while (true) {
        index++;
        const a = Math.floor(Math.random() * 100), b = Math.floor(Math.random() * 100);
        console.println(`[第${index}题] 请问 ${a} + ${b} 等于多少呀？`);
        let c;
        while (c === undefined) {
            const readline = await console.readln();
            if (!/^\d+$/.test(readline)) {
                console.println(`输入错误，请输入数字。`);
                continue;
            }
            c = Number.parseInt(readline);
        }
        if (a + b == c) {
            console.println(`回答正确，答案就是：${c}！`);
            right++;
        } else {
            console.println(`回答错误！答案应该是：${a + b}。`);
            wrong++;
        }
        console.println(`你目前结果为：${right} 题目正确， ${wrong} 题目错误。`);
    }
}