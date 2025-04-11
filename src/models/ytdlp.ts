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
  } as const;

  downloadVideo?(videoId?: string): Promise<void>;
  downloadAudio?(): Promise<void>;
  formats?(): any;

  public async clean() {
    const downloadedFile = Bun.file(this._filePath);
    try {
      if (await downloadedFile.exists()) {
        await downloadedFile.delete();
      }
    } catch (error) {
      throw error;
    }
  }
}

export default Ytdlp;
