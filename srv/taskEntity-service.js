const cds = require('@sap/cds');

class TaskEntityService extends cds.ApplicationService {

    init() {
        this.on('taskStartAction', this.onTaskStart);

        return super.init();
    }

    /**
     * 今日のタスクを登録
     */
    async onTaskStart(req) {
        // データ取得
        const userId = "admin";
        const { date, tasks } = req.data;
        
        // タスク一覧(JSON文字列 ▶ 配列)
        let taskList = [];
        try {
            taskList = JSON.parse(tasks);
        } catch (e) {
            console.error("JSON Parse Error:", e);
            return { error: "invalidTaskData" };
        }
        
        // トランザクション開始
        const db = cds.transaction(req);

        try {
            // 1. 既存データを削除
            await db.run(DELETE.from('zynas.thancle.TaskEntity').where({ userId }));

            // 2. 新規データを挿入
            const insertData = {
                userId,
                date
            };

            // task1～task10 に値をセット
            for (let i = 0; i < 10; i++) {
                insertData[`task${i + 1}`] = taskList[i] || ""; // タスクが少ない場合、空文字をセット
            }

            await db.run(INSERT.into('zynas.thancle.TaskEntity').entries(insertData));

            // 登録成功
            return { error: "" };

        } catch (err) {
            console.error("DB Error:", err);
            return { error: "taskEntityInsertFailed" };
        }

        // // ログインユーザーを取得
        // const userEmail = req.user.id;
        // const profile = await SELECT.one
        //     .from('zynas.thancle.Employees')
        //     .where({ email: userEmail })
        //     .columns(e => {
        //         e.ID, e.seed.quantity
        //     });
        // if (!profile) {
        //     return { error: "thanksPresentLoginUserNotExistMessage" };
        // }
        // // 送る相手、レートID、メッセージ
        // const { recipientId, rateId, message } = req.data;
        // // 送る相手が自分自身の場合は処理しない
        // if (recipientId === profile.ID) {
        //     return { error: "thanksPresentCanNotYourselfMessage" };
        // }
        // // 贈る相手を取得
        // const recipient = await SELECT.one.from('zynas.thancle.Employees').where({ ID: recipientId });
        // if (!recipient) {
        //     return { error: "thanksPresentRecipientNotExistMessage" };
        // }
        // // レートを取得
        // const seedRate = await SELECT.one.from('zynas.thancle.SeedRates').where({ ID: rateId });
        // if (!seedRate) {
        //     return { error: "thanksPresentRateNotSelectedMessage" };
        // }
        // // 保有タネ数より贈るタネ数が多い場合はエラー
        // if (seedRate.quantity > profile.seed_quantity) {
        //     return { error: "thanksPresentSeedShortageMessage" };
        // }
        // // 履歴を登録
        // await this.registerHistories(profile.ID, recipientId, seedRate, message);
        // return { error: "" };
    }
}

module.exports = TaskEntityService;