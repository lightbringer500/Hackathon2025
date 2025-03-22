const cds = require('@sap/cds');

class TaskEntityService extends cds.ApplicationService {

    init() {
        this.on('taskStartAction', this.onTaskStart);

        this.on('taskEndAction', this.onTaskEnd);

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
    }

    /**
     * 今日のタスクを更新
     */
	async registerTask(req) {
        const userId = "admin";
		const { date, tasks, taskTimes } = req.data;

        console.log("サーバー到達");
        console.log(date);
        console.log(tasks);
        console.log(taskTimes);

		// JSONをオブジェクト化
		let taskList = [];
		let taskTimeList = [];
		try {
			taskList = JSON.parse(tasks);
			taskTimeList = JSON.parse(taskTimes);
		} catch (e) {
			console.error("JSON Parse Error:", e);
			return { error: "invalidTaskData" };
		}

		// DBトランザクション開始
		const db = cds.transaction(req);

		try {
			// 既存データ削除
			await db.run(DELETE.from('zynas.thancle.taskEntity').where({ userId, date }));

			// 新規データ登録
			await db.run(
				INSERT.into('zynas.thancle.taskEntity').entries({
					userId,
					date,
					task1: taskList[0],
					task2: taskList[1],
					task3: taskList[2],
					task4: taskList[3],
					task5: taskList[4],
					task6: taskList[5],
					task7: taskList[6],
					task8: taskList[7],
					task9: taskList[8],
					task10: taskList[9],
					taskTime1: taskTimeList[0] || null,
					taskTime2: taskTimeList[1] || null,
					taskTime3: taskTimeList[2] || null,
					taskTime4: taskTimeList[3] || null,
					taskTime5: taskTimeList[4] || null,
					taskTime6: taskTimeList[5] || null,
					taskTime7: taskTimeList[6] || null,
					taskTime8: taskTimeList[7] || null,
					taskTime9: taskTimeList[8] || null,
					taskTime10: taskTimeList[9] || null
				})
			);

			console.log("タスク登録成功:", userId, date);
			return { success: true };
		} catch (error) {
			console.error("DBエラー:", error);
			return { error: "dbInsertError" };
		}
	}

    
}

module.exports = TaskEntityService;