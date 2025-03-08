using {zynas.thancle as db} from '../db/schema';


/**
 * さんくるのタネの送受信を扱う
 */
service SeedService @(path: '/seed') {
    /**
     * さんくるのタネを送る
     */
    action present(recipientId : db.Employees:ID, rateId : db.SeedRates:ID, message : String) returns {
        error : String
    };

    /**
     * タネレート
     */
    @readonly
    entity Rates as projection on db.SeedRates;
}
