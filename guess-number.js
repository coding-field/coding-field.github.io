async function 猜数字() {
    console.println(`我们来玩一个猜数字游戏吧！\n\n你可以心里想一个固定范围内的数字，然后我来猜这个数字，看看我最少问几次问题可以猜中。\n`);
    console.println(`首先，请输入这次我们猜数字的范围：\n（比如输入 50，表示猜 1 到 50 范围内的数字）`);
    let n;
    while (n === undefined) {
        const readline = await console.readln();
        if (!/^\d+$/.test(readline)) {
            console.println(`你输入的不是一个数字！`);
            continue;
        }
        if (Number.parseInt(readline) <= 1) {
            console.println(`请输入 1 以上的数字！`);
            continue;
        }
        n = Number.parseInt(readline);
    }
    const maxGuess = -Math.floor(-Math.log2(n));
    console.println(`你输入了 ${n}，对于 1 到 ${n} 之间的数字，我肯定可以在 ${maxGuess} 次问题内猜出来！\n\n让我们开始吧，请想好一个 1 到 ${n} 之间的数字，然后按回车。`);
    await console.readln();
    let start = 1, end = n, guessIndex = 0;
    while (true) {
        if (start === end) {
            console.println(`知道了！你想的数字就是 ${start}！我总共猜了 ${guessIndex} 次！`);
            break;
        }
        guessIndex++;
        const x = Math.floor((start + end) / 2);
        if (start === x) {
            console.println(`[第${guessIndex}次猜] 你想的数字是 ${x} 么？\n输入 Y 表示是，输入 N 表示否：`);
        } else {
            console.println(`[第${guessIndex}次猜] 你想的数字是在 ${start} 到 ${x} 之间么？\n输入 Y 表示是，输入 N 表示否：`);
        }
        let answer;
        while (answer === undefined) {
            const readline = await console.readln();
            if (!/^y|n$/i.test(readline)) {
                console.println(`你输入既不是 Y 也不是 N！`);
                continue;
            }
            answer = /^y$/i.test(readline);
        }
        if (answer) {
            end = x;
        } else {
            start = x + 1;
        }
    }

}