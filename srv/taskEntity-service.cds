
using {zynas.thancle as db} from '../db/schema';


/**
 * 今日のタスクを扱う
 */
service TaskEntityService @(path: '/taskEntity') {
    /**
     * 今日のタスク
     */
    @readonly
    entity TaskEntity        as projection on db.taskEntity;


    /**
     * 今日のタスク登録
     */
    action taskStartAction(date : db.taskEntity:date, tasks : LargeString) returns {
        error : String
    };
}

