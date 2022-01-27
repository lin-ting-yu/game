export interface Position {
    x: number;
    y: number;
}

export enum OpenLandEnum {
    IsOpened = 'isOpened',
    IsLandmine = 'isLandmine',
    IsFlag = 'isFlag',
    IsSave = 'isSave',
    Fail = 'fail',
}
