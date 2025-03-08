using zynas.thancle as db from '../db/schema';

/**
 * 商品情報を取得
 */
service PrizeService @(path: '/prize') {
    @readonly
    entity Prizes as projection on db.Prizes;
}
