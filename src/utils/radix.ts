
export function radixSort(data: string[]): void {
    let revers = true;

    for (let iSt=data[0].length-1; iSt >=0; iSt--) {
        if (data[0][iSt] === '.')
            continue;

        const bin: string[][] = [[], [], [], [], [], [], [], [], [], []]; // Used to hold our array of queues
        const digIndex: number[] = []; // This will be used to hold mapping values for remapping data elements to their proper index location
        if (revers) {
            for (let i = 0; i < data.length; i++) {
                bin[+data[i][iSt]].push(data[i]); // The first enqueue process is a forward sweep
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
        revers = false;
    }
}
