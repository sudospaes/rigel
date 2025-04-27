abstract class Ytdlp {
  protected url: string;
  private _status: keyof typeof Ytdlp.ProcessStatus = "INACTIVE";
  private declare _filePath: string;

  constructor(url: string) {
    this.url = url;
  }

  get filePath() {
    return this._filePath;
  }
  set filePath(path: string) {
    this._filePath = path;
  }

  get status() {
    return this._status;
  }
  set status(status: keyof typeof Ytdlp.ProcessStatus) {
    this._status = status;
  }

  static ProcessStatus = {
    ACTIVE: "ACTIVE",
    INACTIVE: "INACTIVE",
    PENDING: "PENDING",
  } as const;

  downloadVideo?(...args: any): Promise<void>;
  downloadAudio?(...args: any): Promise<void>;
  formats?(): any;

  public async clean() {
    this._status = "INACTIVE";
    if (!this._filePath) return;
    const downloadedFile = Bun.file(this._filePath);
    if (await downloadedFile.exists()) {
      await downloadedFile.delete();
    }
  }
}

export default Ytdlp;
