const fs = require("fs");

const fail = (msg) => {
  process.stderr.write(msg + "\n");
  process.exit(1);
};

let raw;
try {
  raw = fs.readFileSync("门牌", "utf8");
} catch (e) {
  fail("找不到门牌");
}

if (raw.length === 0) fail("门牌不对");

const lines = raw.split("\n");
if (lines[lines.length - 1] === "") lines.pop();
for (let i = 0; i < lines.length; i++) {
  lines[i] = lines[i].replace(/\r$/, "");
}
if (lines.length === 0) fail("门牌不对");

const isPositiveInt = (s) => /^\d+$/.test(s) && Number(s) >= 1;

const queryParts = lines[0].split(" ");
if (queryParts.length !== 2 || queryParts[0] !== "查" || !isPositiveInt(queryParts[1])) {
  fail("门牌不对");
}
const query = Number(queryParts[1]);

const segs = [];
for (let i = 1; i < lines.length; i++) {
  const parts = lines[i].split(" ");
  if (
    parts.length !== 3 ||
    parts[0] !== "段" ||
    !isPositiveInt(parts[1]) ||
    !isPositiveInt(parts[2])
  ) {
    fail("门牌不对");
  }
  const a = Number(parts[1]);
  const b = Number(parts[2]);
  segs.push([Math.min(a, b), Math.max(a, b)]);
}

segs.sort((x, y) => x[0] - y[0] || x[1] - y[1]);
const merged = [];
for (const [s, e] of segs) {
  const last = merged[merged.length - 1];
  if (last && s <= last[1] + 1) {
    if (e > last[1]) last[1] = e;
  } else {
    merged.push([s, e]);
  }
}

let out = "";
for (const [s, e] of merged) out += s + " " + e + "\n";
const hit = merged.find(([s, e]) => query >= s && query <= e);
out += hit ? "落在 " + hit[0] + " " + hit[1] + "\n" : "没落在\n";
process.stdout.write(out);
