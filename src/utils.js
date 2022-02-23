// How in God's name does javascript not have this already...
export function groupBy(list, keyGetter) {
    const map = new Map();
    list.forEach((item) => {
         const key = keyGetter(item);
         const collection = map.get(key);
         if (!collection) {
             map.set(key, [item]);
         } else {
             collection.push(item);
         }
    });
    return map;
}

// How in God's name does javascript not have this already...
export function sleep(ms, {signal}) {
    let res;
    signal?.addEventListener('abort', () => {
        res()
    })
    return new Promise((resolve, reject) => {
        res = resolve
        setTimeout(resolve, ms)
    });
}

export function arrRnd(arr) {
    return arr[arrRndIdx(arr)];
}

export function arrRndIdx(arr) {
    return Math.floor(Math.random()*arr.length);
}

export function shuffleArray(arrayIn) {
    const array = [...arrayIn]
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}