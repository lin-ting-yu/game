import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges,
} from '@angular/core';
import { OpenLandEnum } from '../public-api';
import { Land, Minesweeper } from './core/minesweeper';

export enum MinesweeperLevel {
  Easy = 'Easy',
  Normal = 'Normal',
  Hard = 'Hard',
}

const minesweeperLevelData = {
  [MinesweeperLevel.Easy]: {
    width: '.'.repeat(9).split(''),
    height: '.'.repeat(9).split(''),
    landmine: 10,
  },
  [MinesweeperLevel.Normal]: {
    width: '.'.repeat(16).split(''),
    height: '.'.repeat(16).split(''),
    landmine: 40,
  },
  [MinesweeperLevel.Hard]: {
    width: '.'.repeat(30).split(''),
    height: '.'.repeat(16).split(''),
    landmine: 99,
  },
};

const mouseupIntervalTime = 30

@Component({
  selector: 'app-minesweeper',
  templateUrl: './minesweeper.component.html',
  styleUrls: ['./minesweeper.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MinesweeperComponent implements OnInit, OnChanges, OnDestroy {
  constructor(
    private cdRef: ChangeDetectorRef
  ) { }

  @Input() readonly level: MinesweeperLevel = MinesweeperLevel.Easy;
  @Input() readonly isCollaspe = false;

  @Input() readonly isShowSelect = true;
  @Input() readonly isShowClose = true;
  @Input() readonly isShowCollapse = true;

  @Output() onSelectChange = new EventEmitter<MinesweeperLevel>();
  @Output() onCloseClick = new EventEmitter<void>();
  @Output() onCollaspe = new EventEmitter<boolean>();


  readonly options = Object.keys(MinesweeperLevel).map(key => ({
    value: key ,
    text: MinesweeperLevel[key as any as MinesweeperLevel]
  }));

  private _innerLevel: MinesweeperLevel;
  set innerLevel(innerLevel) {
    if (this._innerLevel !== innerLevel) {
      this._innerLevel = innerLevel;
      this.onSelectChange.emit(innerLevel);
      this.init();
    }
  }
  get innerLevel(): MinesweeperLevel {
    return this._innerLevel;
  }

  private minesweeper: Minesweeper;
  time = 0;

  private isStart = false;
  isDone = false;
  isDead = false;

  isLeftDown = false;
  private isRightDown = false;
  // private leftDownIndex = -1;
  private rightDownIndex = -1;

  minesweeperData: {
    width: string[];
    height: string[];
    landmine: number;
  };

  private oldMouseupTimestamp = new Date().getTime();
  private mouseupIntervalTime = 10000;
  private landMatrix: Land[] = [];
  private downIndexList: boolean[][] = [];
  private interval: NodeJS.Timeout;

  get landmineNum(): number {
    const landmine = (this.minesweeperData?.landmine || 0) - (this.minesweeper?.flagLangth || 0);
    return Math.min(Math.max(landmine, -99), 999);
  };

  ngOnInit(): void {
    this.innerLevel = this.level || MinesweeperLevel.Easy;
    this.init();
  }

  ngOnChanges(changes: SimpleChanges): void {
      if (changes['level']) {
        this.innerLevel = this.level || MinesweeperLevel.Easy;
        this.init();
      }
  }

  ngOnDestroy(): void {
    clearInterval(this.interval);
  }

  itemClick(x: number, y: number, event: MouseEvent | PointerEvent): void {
    // event.stopPropagation();
    event.preventDefault();
    // console.log('itemClick', event.button);
    if (this.isDone || this.isDead) {
      return;
    }
    if (event.button === 0 && this.mouseupIntervalTime > mouseupIntervalTime && !this.isRightDown) {
      if (!this.isStart && this.landMatrix[this.xyToI(x, y)].isLandmine) {
        this.setMinesweeper(x, y);
      }
      this.startInterval();
      this.isStart = true;
      this.minesweeper.openLand(x, y, (res) => {

        if (res.type === OpenLandEnum.IsLandmine) {
          this.isDead = true;
          this.minesweeper.openAllLandmineAngWorngFlag();
        }
        this.setIsDone(res.isDone);
      });
    }
  }

  mousedown(x: number, y: number, event: MouseEvent | PointerEvent): void {
    switch (event.button) {
      case 0:
        // this.leftDownIndex = this.xyToI(x, y);
        this.isLeftDown = true;
        return;
      case 2:
        this.rightDownIndex = this.xyToI(x, y);
        this.isRightDown = true;
        return;
    }
  }

  mouseup(x: number, y: number, event: MouseEvent | PointerEvent): void {
    const index = this.xyToI(x, y);
    const now = new Date().getTime();
    const land = this.landMatrix[index];
    this.mouseupIntervalTime = now - this.oldMouseupTimestamp;
    this.oldMouseupTimestamp = now;
    if (this.isDone || this.isDead) {
      return;
    }

    if (event.button === 0 || event.button === 2) {
      if (event.button === 0) {
        // this.leftDownIndex = -1;
        this.isLeftDown = false;
      } else {
        if (
          this.rightDownIndex === index &&
          !land.isOpen &&
          !this.isLeftDown &&
          this.mouseupIntervalTime > mouseupIntervalTime
        ) {
          this.startInterval();
          this.isStart = true;
          this.minesweeper.setFlag(x, y);
          this.cdRef.markForCheck();
        }
        this.rightDownIndex = -1;
        this.isRightDown = false;
      }

      if (
        land.isOpen &&
        !land.isFlag &&
        (this.mouseupIntervalTime < mouseupIntervalTime || this.isRightDown || this.isLeftDown)
      ) {
        this.minesweeper.openNearLand(x, y, (res) => {
          if (res.type === OpenLandEnum.IsLandmine) {
            this.isDead = true;
            this.minesweeper.openAllLandmineAngWorngFlag();
          }
          this.setIsDone(res.isDone);
        });
      }
    }
  }

  mouseenter(x: number, y: number): void {
    this.downIndexList = [];
    (this.downIndexList[y] || (this.downIndexList[y] = []))[x] = true;
    Minesweeper.nearVectorList.forEach((vector) => {
      const innerX = vector.x + x;
      const innerY = vector.y + y;
      (this.downIndexList[innerY] || (this.downIndexList[innerY] = []))[
        innerX
      ] = true;
    });
  }

  getLand(x: number, y: number): Land {
    return this.landMatrix[this.xyToI(x, y)] || {};
  }

  xyToI(x: number, y: number): number {
    return this.minesweeperData.width.length * y + x;
  }

  checkDown(x: number, y: number): boolean {
    if (this.isDone || this.isDead) {
      return false;
    }
    return (
      this.isLeftDown && this.isRightDown && (this.downIndexList[y] || [])[x]
    );
  }

  init(): void {
    this.minesweeperData = minesweeperLevelData[this.innerLevel];
    this.isStart = false;
    this.isDone = false;
    this.isDead = false;
    this.isLeftDown = false;
    this.isRightDown = false;
    this.time = 0;
    this.setMinesweeper();
    clearInterval(this.interval);
  }

  private setMinesweeper(x?: number, y?: number): void {
    const ignoreIndex =
      typeof x === 'number' && typeof y === 'number' ? [this.xyToI(x, y)] : [];
    this.minesweeper = new Minesweeper(
      this.minesweeperData.width.length,
      this.minesweeperData.height.length,
      this.minesweeperData.landmine,
      ignoreIndex
    );
    this.landMatrix = this.minesweeper.getLandMatrix();
  }
  private setIsDone(isDone: boolean): void {
    this.isDone = isDone;
    if (isDone) {
      this.isLeftDown = false;
      this.isRightDown = false;
    }
  }
  private startInterval(): void {
    if (this.isStart) {
      return;
    }
    clearInterval(this.interval);
    this.interval = setInterval(() => {
      if (this.isDead || this.isDone) {
        clearInterval(this.interval);
        return;
      }
      this.time = Math.min(this.time + 1, 999);
      this.cdRef.markForCheck();
    }, 1000);
  }
}
