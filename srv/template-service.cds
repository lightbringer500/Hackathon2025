
using {zynas.thancle as db} from '../db/schema';


/**
 * テンプレート情報を扱う
 */
service TemplateService @(path: '/employee') {
    /**
     * テンプレート
     */
    @readonly
    entity Template        as projection on db.Template;
}

