import { OpenLandEnum, Position } from "./interface";

export class Minesweeper {
  constructor(
    width: number = 9,
    height: number = 9,
    landmineLength: number = 10,
    ignoreList: number[] = []
  ) {
    const innerIgnoreList = [...ignoreList];
    this.width = Math.min(Math.max(width, 8), 30);
    this.height = Math.min(Math.max(height, 8), 20);
    const all = this.width * this.height;
    const maxLandmine = (this.width - 1) * (this.height - 1);
    this.landmineLength = Math.min(Math.max(landmineLength, 10), maxLandmine);

    if (innerIgnoreList.length > all - maxLandmine) {
      innerIgnoreList.length = all - maxLandmine;
    }
    this.ignoreIndexData = {};
    innerIgnoreList.forEach((num) => {
      this.ignoreIndexData[num] = true;
    });
    if (this.landmineLength + innerIgnoreList.length > all) {
      this.landmineLength = all - innerIgnoreList.length;
    }
    this.saveLandmineLangth = all - landmineLength;
    this.init();
  }

  static readonly nearVectorList: Position[] = [
    { x: 0, y: -1 }, // 上
    { x: 1, y: -1 }, // 右上
    { x: 1, y: 0 }, // 右
    { x: 1, y: 1 }, // 右下
    { x: 0, y: 1 }, // 下
    { x: -1, y: 1 }, // 左下
    { x: -1, y: 0 }, // 左
    { x: -1, y: -1 }, // 左上
  ];
  private ignoreIndexData: { [num: number]: boolean };
  private width: number;
  private height: number;
  private landmineLength: number;
  private saveLandmineLangth: number;
  private openSaveLandLangth = 0;
  private _flagLangth = 0;
  private landmineIndexData: { [num: number]: boolean } = {};
  private landMatrix: Land[] = [];

  private get isDone(): boolean {
    return this.saveLandmineLangth === this.openSaveLandLangth;
  }

  get flagLangth(): number {
    return this._flagLangth;
  }

  private init(): void {
    this.landmineIndexData = this.createLandmineIndexData();
    this.landMatrix = this.createMatrix();
    this.updateMatrix();
  }

  private createLandmineIndexData(): { [num: number]: boolean } {
    let length = 0;
    const json: { [num: number]: boolean } = {};
    const max = this.width * this.height;
    while (length < this.landmineLength) {
      const k = ~~(Math.random() * max);
      if (!json[k] && !this.ignoreIndexData[k]) {
        json[k] = true;
        length++;
      }
    }
    return { ...json };
  }

  private createMatrix(): Land[] {
    const result: Land[] = [];
    for (let i = 0, max = this.width * this.height; i < max; i++) {
      const position = this.indexToPosition(i);
      result[i] = new Land(this.landmineIndexData[i]);
      result[i].setPosition(position.x, position.y);
      result[i].setIndex(i);
    }
    return result;
  }

  private updateMatrix(): void {
    this.landMatrix.forEach((land) => {
      const neerLandList = this.getNearLandList(land);
      land.setNearLandmineLength(0);

      neerLandList.forEach((l) => {
        land.setNearLandmineLength(land.nearLandmineLength + +(l as Land).isLandmine)
      });
    });
  }

  private indexToPosition(index: number): Position {
    return { x: index % this.width, y: ~~(index / this.width) };
  }

  private getNearLandList(land: Land, filter = true): (Land | null)[] {
    const result: (Land | null)[] = [];
    Minesweeper.nearVectorList.forEach((nearVector) => {
      const x = land.position.x + nearVector.x;
      const y = land.position.y + nearVector.y;
      if (x < 0 || y < 0 || x >= this.width || y >= this.height) {
        if (!filter) {
          result.push(null);
        }
        return;
      }
      const innerLand = this.getLandByPos(x, y);
      result.push(innerLand);
    });
    return result;
  }

  private getLandByPos(x: number, y: number): Land | null {
    if (x >= this.width || y >= this.height) {
      return null;
    }
    return this.landMatrix[y * this.width + x];
  }

  private checkCanAutoOpen(targetLand: Land): Land[] {
    if (!targetLand.nearLandmineLength) {
      return [];
    }
    const result: Land[] = [];
    const l = this.getNearLandList(targetLand, false);
    const fn = (i1: number, i2: number, i3: number) => {
      if (
        (!l[i1] || !(l[i1] as Land).nearLandmineLength) &&
        (!l[i2] || !(l[i2] as Land).nearLandmineLength) &&
        (!l[i3] || !(l[i3] as Land).nearLandmineLength)
      ) {
        if (l[i1]) {
          result[(l[i1] as Land).index] = l[i1] as Land;
        }
        if (l[i2]) {
          result[(l[i2] as Land).index] = l[i2] as Land;
        }
        if (l[i3]) {
          result[(l[i3] as Land).index] = l[i3] as Land;
        }
      }
    };
    fn(7, 0, 1);
    fn(1, 2, 3);
    fn(3, 4, 5);
    fn(5, 6, 7);

    return result;
  }

  private eachNearLand(targetLand: Land, checkFlag: boolean): Land[] {
    const checkList: Land[] = [];
    const ignoreList: Land[] = [];
    const targetLandNearList = this.checkCanAutoOpen(targetLand);

    const checkFn = (land: Land) => {
      const nearLandList: Land[] = this.getNearLandList(land) as Land[];
      const nearLandNotOpenedList: Land[] = [];
      let flagLength = 0;

      checkList[land.index] = land;

      nearLandList.forEach((nearLand) => {
        flagLength += +nearLand.isFlag;
        if (!nearLand.isOpen && !nearLand.isFlag) {
          nearLandNotOpenedList.push(nearLand);
        }
      });

      if (
        !land.nearLandmineLength ||
        (checkFlag && land.nearLandmineLength === flagLength)
      ) {
        nearLandNotOpenedList.forEach((innerLand) => {
          if (!checkList[innerLand.index] && !ignoreList[innerLand.index]) {
            checkFn(innerLand);
          }
        });
      } else if (targetLandNearList.length) {
        targetLandNearList.forEach((innerLand) => {
          if (!checkList[innerLand.index] && !ignoreList[innerLand.index]) {
            checkFn(innerLand);
          }
        });
        targetLandNearList.length = 0;
      }
    };
    checkFn(targetLand);

    return checkList;
  }

  openLand(
    x_index: number,
    y?: number,
    resolve?: (res: {
      type: OpenLandEnum;
      openLandList: Land[];
      isDone: boolean;
    }) => void
  ): void {
    let land: Land | null;
    if (typeof x_index === 'number' && typeof y === 'number') {
      land = this.getLandByPos(x_index, y);
    } else {
      land = this.landMatrix[x_index] || null;
    }

    if (land === null) {
      resolve &&
        resolve({
          type: OpenLandEnum.Fail,
          openLandList: [],
          isDone: this.isDone,
        });
    } else if (land.isOpen) {
      resolve &&
        resolve({
          type: OpenLandEnum.IsOpened,
          openLandList: [land],
          isDone: this.isDone,
        });
    } else if (land.isFlag) {
      resolve &&
        resolve({
          type: OpenLandEnum.IsFlag,
          openLandList: [land],
          isDone: this.isDone,
        });
    } else if (land.isLandmine) {
      land.setIsOpen(true);
      resolve &&
        resolve({
          type: OpenLandEnum.IsLandmine,
          openLandList: [land],
          isDone: this.isDone,
        });
    } else {
      const openLandList = this.eachNearLand(land, false);
      let hasLandmine = false;
      this.openSaveLandLangth += openLandList.filter(
        (l) => !l.isLandmine && !l.isOpen
      ).length;
      openLandList.forEach((openLand) => {
        openLand.setIsOpen(true);
        hasLandmine = hasLandmine || openLand.isLandmine;
      });

      if (hasLandmine) {
        resolve &&
          resolve({
            type: OpenLandEnum.IsLandmine,
            openLandList,
            isDone: this.isDone,
          });
      } else {
        resolve &&
          resolve({
            type: OpenLandEnum.IsSave,
            openLandList,
            isDone: this.isDone,
          });
      }
    }
  }

  openNearLand(
    x_index: number,
    y?: number,
    resolve?: (res: {
      type: OpenLandEnum;
      openLandList: Land[];
      isDone: boolean;
    }) => void
  ): void {
    let land: Land | null;
    if (typeof x_index === 'number' && typeof y === 'number') {
      land = this.getLandByPos(x_index, y);
    } else {
      land = this.landMatrix[x_index] || null;
    }

    if (land === null || !land.isOpen) {
      resolve &&
        resolve({
          type: OpenLandEnum.Fail,
          openLandList: [],
          isDone: this.isDone,
        });
    } else {
      const openLandList = this.eachNearLand(land, true);
      let hasLandmine = false;
      this.openSaveLandLangth += openLandList.filter(
        (l) => !l.isLandmine && !l.isOpen
      ).length;
      openLandList.forEach((openLand) => {
        openLand.setIsOpen(true);
        hasLandmine = hasLandmine || openLand.isLandmine;
      });

      if (hasLandmine) {
        resolve &&
          resolve({
            type: OpenLandEnum.IsLandmine,
            openLandList,
            isDone: this.isDone,
          });
      } else {
        resolve &&
          resolve({
            type: OpenLandEnum.IsSave,
            openLandList,
            isDone: this.isDone,
          });
      }
    }
  }

  openAll(
    resolve?: (res: {
      type: OpenLandEnum;
      openLandList: Land[];
      isDone: boolean;
    }) => void
  ): void {
    const openLandList: Land[] = [];
    let hasLandmine = false;
    this.landMatrix.forEach((land) => {
      if (!land || land.isOpen) {
        return;
      }
      land.setIsOpen(true);
      openLandList.push(land);
      if (land.isLandmine) {
        hasLandmine = land.isLandmine;
      } else {
        this.openSaveLandLangth++;
      }
    });
    resolve &&
      resolve({
        type: hasLandmine ? OpenLandEnum.IsLandmine : OpenLandEnum.IsOpened,
        openLandList,
        isDone: this.isDone,
      });
  }

  openAllLandmineAngWorngFlag(
    resolve?: (res: {
      type: OpenLandEnum;
      openLandList: Land[];
      isDone: boolean;
    }) => void
  ): void {
    const openLandList: Land[] = [];
    let hasLandmine = false;
    this.landMatrix.forEach((land) => {
      if (!land || land.isOpen) {
        return;
      }
      if (land.isLandmine || (land.isFlag && !land.isLandmine)) {
        land.setIsOpen(true);
        openLandList.push(land);
        if (land.isLandmine) {
          hasLandmine = land.isLandmine;
        } else {
          this.openSaveLandLangth++;
        }
      }
    });
    resolve &&
      resolve({
        type: hasLandmine ? OpenLandEnum.IsLandmine : OpenLandEnum.IsOpened,
        openLandList,
        isDone: this.isDone,
      });
  }

  setFlag(x_index: number, y?: number): void {
    let land: Land | null;
    if (typeof x_index === 'number' && typeof y === 'number') {
      land = this.getLandByPos(x_index, y);
    } else {
      land = this.landMatrix[x_index];
    }
    if (land && !land.isOpen) {
      land.setIsFlag(!land.isFlag);
      if (land.isFlag) {
        this._flagLangth += 1;
      } else {
        this._flagLangth -= 1;
      }
    }
  }

  getLandMatrix(): Land[] {
    return this.landMatrix;
  }
}

export class Land {
  constructor(isLandmine: boolean) {
    this.isLandmine = !!isLandmine;
  }

  readonly isLandmine: boolean;
  private _position: Position = { x: 0, y: 0 };
  private _isOpen = false;
  private _isFlag = false;
  private _index = -1;
  private _nearLandmineLength = 0;

  get nearLandmineLength() {
    return this._nearLandmineLength;
  }
  get index() {
    return this._index;
  }
  get isOpen() {
    return this._isOpen;
  }
  get isFlag() {
    return this._isFlag;
  }

  get position(): Position {
    return { ...this._position };
  }

  setPosition(x: number, y: number): void {
    this._position = { x, y };
  }

  setNearLandmineLength(num: number): void {
    this._nearLandmineLength = num;
  }

  setIndex(index: number): void {
    this._index = index;
  }

  setIsOpen(isOpen: boolean): void {
    this._isOpen = isOpen;
  }

  setIsFlag(isFlag: boolean): void {
    this._isFlag = isFlag;
  }

}
