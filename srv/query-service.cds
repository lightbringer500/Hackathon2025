using {zynas.thancle as db} from '../db/schema';


/**
 * エンティティをクエリする
 */
service QueryService @(path: '/query') {
    /**
     * タネ履歴
     */
    @readonly
    entity SeedHistories    as projection on db.SeedHistories;

    /**
     * ポイント履歴
     */
    @readonly
    entity PointHistories   as projection on db.PointHistories;

    /**
     * タネ-ポイント対応表
     */
    @readonly
    entity SeedPointMapping as projection on db.SeedPointMapping;
}
