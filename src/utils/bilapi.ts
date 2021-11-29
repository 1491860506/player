const cidapi = `https://quiet-disk-7a77.xmdhs.workers.dev/https://api.bilibili.com/x/player/pagelist?`
const zmapi = `https://quiet-disk-7a77.xmdhs.workers.dev/https://api.bilibili.com/x/player/v2?`
const dmapi = `https://auto.xmdhs.top/getdm?`
const cors = 'https://quiet-disk-7a77.xmdhs.workers.dev/'

export async function getbilCidS(b: string): Promise<bilCidR["data"]> {
    let q = "aid"
    if (b.startsWith("BV")) {
        q = "bvid"
    }
    let uq = new URLSearchParams()
    uq.set(q, b)
    let f = await fetch(cidapi + uq.toString())
    let j = await f.json() as bilCidR
    if (j.code != 0) {
        console.warn("api 报错", j)
        throw new Error("api 报错")
    }
    return j.data
}

interface bilCidR {
    code: number
    message: string
    data: {
        cid: number
        part: string
    }[]
}

export async function getDM(cid: string): Promise<string> {
    await fetchAndInstantiate()
    let q = new URLSearchParams()
    q.set("cid", cid)
    let f = await fetch(dmapi + q.toString())
    let t = await f.text()
    let s = bil2dp(t)
    if (typeof (s as { err: string }).err != "undefined") {
        console.warn((s as { err: string }).err)
        throw new Error((s as { err: string }).err)
    }
    return s as string;
}

let go = new Go();
let has = false;
async function fetchAndInstantiate() {
    if (has) {
        return
    }
    const response = await fetch("https://cdn.jsdelivr.net/gh/xxmdhs/ip/ip.wasm");
    const buffer = await response.arrayBuffer();
    const obj = await WebAssembly.instantiate(buffer, go.importObject)
    go.run(obj.instance);
    has = true
}
fetchAndInstantiate();

declare function bil2dp(s: string): { err: string } | string

export async function getZm(bvid: string, cid: string): Promise<{ lan_doc: string, subtitle_url: string }[]> {
    let q = new URLSearchParams()
    q.set("cid", cid)
    q.set("bvid", bvid)
    let f = await fetch(zmapi + q.toString())
    let j = await f.json()
    if (j.code != 0) {
        console.warn("api 报错" + j)
        throw new Error("api 报错")
    }
    return j.data.subtitle.subtitles
}

export async function getBilZm(url: string): Promise<bilZmR> {
    if (url.startsWith("//")) {
        url = "https:" + url
    }
    let f = await fetch(cors + url)
    let j = await f.json() as bilZmR
    return j
}

interface bilZmR {
    body: {
        content: string
        from: number
        to: number
        location: number
    }[]
}

export function bilZm2vtt(zm: bilZmR): string {
    let s = "WEBVTT\n\n"
    zm.body.forEach(b => {
        s += `${vtttime(b.from * 1000)} --> ${vtttime(b.to * 1000)}\n${b.content}\n\n`
    })
    return s
}
function vtttime(time: number) {
    // 毫秒转换成时分秒表示
    let ms = time % 1000;
    ms = Math.round(ms)
    let mss = String(ms)
    if (mss.length == 1) {
        mss = "00" + mss
    } else if (mss.length == 2) {
        mss = "0" + mss
    }
    // 剩余秒数
    var s = Math.floor(time / 1000);
    return his(s) + '.' + mss;
};

function his(seconds: number) {
    var h = Math.floor(seconds / 3600);
    var i = Math.floor((seconds - h * 3600) / 60);
    var s = seconds % 60;

    return [zero(h), zero(i), zero(s)].join(':')
};

function zero(value: number) {
    if (value < 10) {
        return '0' + value;
    }
    return value;
};