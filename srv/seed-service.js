const cds = require('@sap/cds');

class SeedService extends cds.ApplicationService {

    init() {
        this.on('present', this.onPresent);

        return super.init();
    }

    /**
     * さんくるのタネを相手に送る
     */
    async onPresent(req) {
        // ログインユーザーを取得
        const userEmail = req.user.id;
        const profile = await SELECT.one
            .from('zynas.thancle.Employees')
            .where({ email: userEmail })
            .columns(e => {
                e.ID, e.seed.quantity
            });
        if (!profile) {
            return { error: "thanksPresentLoginUserNotExistMessage" };
        }
        // 送る相手、レートID、メッセージ
        const { recipientId, rateId, message } = req.data;
        // 送る相手が自分自身の場合は処理しない
        if (recipientId === profile.ID) {
            return { error: "thanksPresentCanNotYourselfMessage" };
        }
        // 贈る相手を取得
        const recipient = await SELECT.one.from('zynas.thancle.Employees').where({ ID: recipientId });
        if (!recipient) {
            return { error: "thanksPresentRecipientNotExistMessage" };
        }
        // レートを取得
        const seedRate = await SELECT.one.from('zynas.thancle.SeedRates').where({ ID: rateId });
        if (!seedRate) {
            return { error: "thanksPresentRateNotSelectedMessage" };
        }
        // 保有タネ数より贈るタネ数が多い場合はエラー
        if (seedRate.quantity > profile.seed_quantity) {
            return { error: "thanksPresentSeedShortageMessage" };
        }
        // 履歴を登録
        await this.registerHistories(profile.ID, recipientId, seedRate, message);
        return { error: "" };
    }

    /**
     * 履歴の登録
     */
    async registerHistories(senderId, recipientId, seedRate, message) {
        // 消費タネ数、贈るポイント、ポイントバック
        const { quantity: quantity, sender_amount: backAmount, recipient_amount: amount } = seedRate;
        // タネ履歴を登録し、登録内容を保持
        const seedEntries = [{ employee_ID: senderId, quantity: -quantity }];
        await INSERT.into('zynas.thancle.SeedHistories', seedEntries);
        const seedHistory = seedEntries.find(() => true);

        // ポイント履歴を登録し、登録内容を保持
        const pointEntries = [
            // 贈る相手
            {
                employee_ID: recipientId,
                amount: amount,
                message: message,
            },
            // 自身へのバック
            {
                employee_ID: senderId,
                amount: backAmount,
                message: "",
            }
        ];
        await INSERT.into('zynas.thancle.PointHistories', pointEntries);

        // タネ履歴とポイント履歴の対応
        const seedPointMappingEntries = pointEntries.map((point) => {
            return {
                pointHistory_ID: point.ID,
                seedHistory_ID: seedHistory.ID,
            }
        });
        await INSERT.into('zynas.thancle.SeedPointMapping', seedPointMappingEntries);
    }
}

module.exports = SeedService;