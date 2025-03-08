using zynas.thancle as db from '../db/schema';

/**
 * ログインしているユーザーの情報を扱う
 */
service UserService @(path: '/user') {
    /**
     * プロフィールを取得する
     */
    function profile() returns {
        id : db.Employees:ID;
        name : db.Employees:name;
        email : db.Employees:email;
        seeds : db.SeedHistories:quantity;
        points : db.PointHistories:amount;
        roles : Map;
    };
}
