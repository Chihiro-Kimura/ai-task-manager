-- 既存のステータスを新しい形式に更新
UPDATE "Task"
SET status = 'todo'
WHERE status = '未完了' OR status = '未着手';

UPDATE "Task"
SET status = 'in-progress'
WHERE status = '進行中';

UPDATE "Task"
SET status = 'done'
WHERE status = '完了';

UPDATE "Task"
SET status = 'pending'
WHERE status = '保留'; 