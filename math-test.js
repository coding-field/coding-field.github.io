async function main() {
    let index = 0;
    let right = 0, wrong = 0;
    while (true) {
        index++;
        const a = Math.floor(Math.random() * 100), b = Math.floor(Math.random() * 100);
        console.println(`[第${index}题] 请问 ${a} + ${b} 等于多少呀？`);
        const c = await console.readlnInt();
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