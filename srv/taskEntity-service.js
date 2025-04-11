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
			// 既存データチェック
			const existingData = await db.run(SELECT.from('zynas.thancle.TaskEntity').where({ userId, date }));

            // データセット
            const insertData = {
                userId,
                date
            };
            // task1～task10 に値をセット
            for (let i = 0; i < 10; i++) {
                insertData[`task${i + 1}`] = taskList[i] || ""; // タスクが少ない場合、空文字をセット
            }

			// 登録or更新処理
			if (existingData.length > 0) {
				// 既存データがある場合は更新
				await db.run(UPDATE('zynas.thancle.TaskEntity').set(insertData).where({ userId, date }));
			} else {
				// 既存データがない場合は挿入
				await db.run(INSERT.into('zynas.thancle.TaskEntity').entries(insertData));
			}

            // 成功
            return { error: "" };

        } catch (err) {
            console.error("DB Error:", err);
            return { error: "taskEntityInsertFailed" };
        }
    }

    /**
     * 今日のタスクを更新
     */
	async onTaskEnd(req) {
		const userId = "admin";
		const { date, tasks, taskTimes } = req.data;

		console.log("───タスク更新処理開始───")
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
			// 既存データチェック
			const existing = await db.run(
				SELECT.from('zynas.thancle.taskEntity').where({ userId, date })
			);
			if (existing.length === 0) {
				return { error: "recordNotFound" };
			}

			// レコード更新
			await db.run(
				cds.ql.UPDATE('zynas.thancle.taskEntity')
					.set({
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
					.where({ userId, date })
			);

			console.log("───タスク更新成功 : ", userId + " / " + date + " ───");
			return { success: true };
		} catch (error) {
			console.error("DBエラー:", error);
			return { error: "dbUpdateError" };
		}
	}
}

module.exports = TaskEntityService;