
using {zynas.thancle as db} from '../db/schema';


/**
 * 社員情報を扱う
 */
service EmployeeService @(path: '/employee') {
    /**
     * 社員
     */
    @readonly
    entity Employees        as projection on db.Employees;
}

