from utils import get_pipeline, read_input, write_output

MODEL_NAME = "facebook/bart-base"
MAX_LENGTH = 128
MIN_LENGTH = 30

def format_tasks_context(tasks: list[dict]) -> str:
    """タスクリストをプロンプト用のテキストに整形します"""
    context = "現在のタスク一覧:\n"
    for task in tasks:
        status_text = {
            "NOT_STARTED": "未着手",
            "IN_PROGRESS": "進行中",
            "COMPLETED": "完了",
            "ON_HOLD": "保留中"
        }.get(task.get("status", ""), "不明")
        
        context += f"- {task.get('title', '')}\n"
        if task.get("description"):
            context += f"  説明: {task['description']}\n"
        context += f"  状態: {status_text}\n"
        if task.get("priority"):
            context += f"  優先度: {task['priority']}\n"
    
    context += "\n上記のタスクリストを考慮して、次に取り組むべきタスクを提案してください。"
    return context

def analyze_suggestion(text: str) -> tuple[str, str, str]:
    """生成されたテキストからタスク情報を抽出します"""
    # タイトルと説明を分離
    lines = text.split("\n")
    title = lines[0].strip()
    description = "\n".join(lines[1:]).strip()
    
    # 優先度を分析
    classifier = get_pipeline(
        "text-classification",
        "distilbert-base-uncased",
        max_length=512
    )
    result = classifier(f"How urgent and important is this task: {text}")
    score = result[0]["score"]
    
    if score > 0.7:
        priority = "高"
    elif score > 0.4:
        priority = "中"
    else:
        priority = "低"
    
    return title, description, priority

def main() -> None:
    # 入力データの読み取り
    data = read_input()
    if "error" in data:
        write_output(data)
        return

    tasks = data.get("tasks", [])
    if not isinstance(tasks, list):
        write_output({"error": "Tasks must be an array"})
        return

    try:
        # タスクリストのコンテキストを生成
        context = format_tasks_context(tasks)
        
        # 次のタスクを生成
        generator = get_pipeline(
            "text2text-generation",
            MODEL_NAME,
            max_length=MAX_LENGTH,
            min_length=MIN_LENGTH,
            do_sample=True,
            temperature=0.7,
            top_p=0.9
        )
        
        generated_text = generator(context)[0]["generated_text"]
        
        # 生成されたテキストを解析
        title, description, priority = analyze_suggestion(generated_text)
        
        write_output({
            "title": title,
            "description": description,
            "priority": priority
        })
    except Exception as e:
        write_output({"error": f"Failed to suggest next task: {str(e)}"})

if __name__ == "__main__":
    main() 