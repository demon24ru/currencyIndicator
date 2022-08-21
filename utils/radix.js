
function radixSort(data, iSt=0, revers=true) {
    let lenStr = data[0].length;
    if (iSt === Math.floor(lenStr / 2) && !(lenStr%2))
        return;

    const bin = [[], [], [], [], [], [], [], [], [], []]; // Used to hold our array of queues
    const digIndex = []; // This will be used to hold mapping values for remapping data elements to their proper index location
    if (revers) {
        for (let i = 0; i < data.length; i++) {
            bin[+data[i][lenStr-1-iSt]].push(data[i]); // The first enqueue process is a forward sweep
        }
    } else {
        for (let i = data.length - 1; i >= 0; i--) {
            bin[+data[i][iSt]].push(data[i]); // The second enqueue process will be a backsweep
        }
    }
    for (let i = 0; i < bin.length; i++) {
        digIndex.push(bin[i].length);
    }
    for (let i = 0; i < digIndex.length - 1; i++) {
        digIndex[i + 1] += digIndex[i];
    }
    for (let i = bin.length - 1; i >= 0; i--) {
        for (let ij = 0; ij < bin[i].length; ij++) {
            data[--digIndex[i]] = bin[i][ij]; // The first deqeueing process
        }
    }
    if (revers) {
        if (iSt === Math.floor(lenStr / 2) && !!(lenStr%2))
            return;
        console.log('wrk', iSt > Math.floor(lenStr / 2), !!(lenStr%2), lenStr-1-iSt)
        radixSort(data, iSt, !revers);
    } else {
        radixSort(data, iSt+1, !revers);
    }
}


const testA = [];
for(let i = 0; i < 15; i++){
    testA[i] = ('000000' + (Math.random()*1000).toFixed(0)).slice(-3);
}
const st = new Date().getTime();
radixSort(testA);
const stp = new Date().getTime();
console.log(testA, stp - st, 'ms');