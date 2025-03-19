
using {zynas.thancle as db} from '../db/schema';


/**
 * テンプレート情報を扱う
 */
service TemplateService @(path: '/template') {
    /**
     * テンプレート
     */
    @readonly
    entity Template        as projection on db.Template;


    /**
     * テンプレート登録
     */
    action templateAction(oneDay : db.Template:oneDay, monthDays : db.Template:monthDays, tasks : LargeString) returns {
        error : String
    };
}

