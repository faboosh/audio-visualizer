export default async function getLyrics(
  songSlug: string
): Promise<LyricManager> {
  const lyrics = await fetch(`songs/${songSlug}/lyrics.lyrics`).then((res) =>
    res.text()
  );
  const lm = new LyricManager();
  const commandList = parse(lyrics);
  lm.runCommandList(commandList);

  return lm;
}

function parseLine(line: string) {
  const commandRegex = /\[.*\]/g;
  const command = line.match(commandRegex)[0];
  const text = line.replace(command, "").trim();
  const parsedArgs = command.replace(/[\[\]]/g, "").split(":");
  const [name, ...args] = parsedArgs;
  return {
    name,
    args: [...args, text],
  };
}

function parse(lyrics: string) {
  const lines = lyrics
    .split("\n")
    .filter((line) => !!line.trim())
    .map((line) => line.trim());
  const parsedCommands = lines.map(parseLine);

  return parsedCommands;
}

type LyricData = [timestamp: number, lyric: string];
type Command = {
  name: string;
  args: string[];
};

export class LyricManager {
  lyrics: LyricData[] = [];
  bpmNum: number = 1;
  stepNum: number = 1;
  offsetNum: number = 0;

  bpm(bpmNum: number) {
    this.bpmNum = Number(bpmNum);
  }

  step(stepNum: number) {
    this.stepNum = Number(stepNum);
  }
  offset(offsetNum: number) {
    this.offsetNum = Number(offsetNum);
  }

  t(bar: string, step: string, text: string) {
    const barLen = (60 / this.bpmNum) * 4;
    const stepLen = barLen / this.stepNum;
    const barNum = Number(bar) - 1;
    const stepNum = Number(step) - 1;

    const offset = barLen * barNum + stepLen * stepNum + this.offsetNum;
    this.lyrics.push([offset, text]);
  }

  runCommandList(commandList: Command[]) {
    commandList.forEach((command) => this.runCommand(command));
  }

  runCommand(command: Command) {
    this[command.name](...command.args);
  }

  getLyricAt(timestamp: number) {
    let match = "";

    for (let i = 0; i < this.lyrics.length; i++) {
      const [lyricTS, lyric] = this.lyrics[i];
      if (timestamp > lyricTS) {
        match = lyric;
      } else {
        break;
      }
    }

    return match;
  }
}
