const cds = require('@sap/cds');

class UserService extends cds.ApplicationService {

    init() {
        // プロフィール取得
        this.on('profile', this.fetchProfile);

        return super.init();
    }

    /**
     * ログインユーザーのプロフィールを取得する
     * 
     * @param {*} req 
     * @returns 
     */
    async fetchProfile(req) {
        // ログインユーザーを取得
        const userEmail = req.user.id;

        // 社員情報を取得
        const profile = await SELECT.one
            .from('zynas.thancle.Employees')
            .where({ email: userEmail })
            .columns(e => {
                e.ID, e.name, e.email, e.seed.quantity, e.point.amount
            });
        if (!profile) {
            // 取得できない場合は空データを返す
            return {
                ID: "",
                name: "",
                email: "",
                seeds: 0,
                points: 0,
                roles: {}
            }
        }

        return {
            ID: profile.ID,
            name: profile.name,
            email: profile.email,
            seeds: profile.seed_quantity,
            points: profile.point_amount,
            roles: req.user.roles
        }
    }

}

module.exports = UserService;
