const fs = require("node:fs");
const path = require("node:path");

function fail(message) {
  process.stderr.write(`${message}\n`);
  process.exit(1);
}

let content;
try {
  content = fs.readFileSync(path.join(process.cwd(), "门牌"), "utf8");
} catch (error) {
  fail(error.code === "ENOENT" ? "找不到门牌" : "门牌不对");
}

if (content.length === 0) {
  fail("门牌不对");
}

const lines = content.split(/\r?\n/);
if (lines[lines.length - 1] === "") {
  lines.pop();
}

const queryMatch = lines[0] && lines[0].match(/^查 ([1-9]\d*)$/);
if (!queryMatch) {
  fail("门牌不对");
}

const query = BigInt(queryMatch[1]);
const intervals = [];

for (const line of lines.slice(1)) {
  const match = line.match(/^段 ([1-9]\d*) ([1-9]\d*)$/);
  if (!match) {
    fail("门牌不对");
  }

  const first = BigInt(match[1]);
  const second = BigInt(match[2]);
  intervals.push({
    start: first < second ? first : second,
    end: first < second ? second : first,
  });
}

intervals.sort((left, right) => {
  if (left.start < right.start) return -1;
  if (left.start > right.start) return 1;
  if (left.end < right.end) return -1;
  if (left.end > right.end) return 1;
  return 0;
});

const merged = [];
for (const interval of intervals) {
  const last = merged[merged.length - 1];
  if (!last || interval.start > last.end + 1n) {
    merged.push({ ...interval });
  } else if (interval.end > last.end) {
    last.end = interval.end;
  }
}

const output = merged.map((interval) => `${interval.start} ${interval.end}`);
const found = merged.find(
  (interval) => query >= interval.start && query <= interval.end,
);
output.push(found ? `落在 ${found.start} ${found.end}` : "没落在");

process.stdout.write(`${output.join("\n")}\n`);
