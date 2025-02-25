import re
from datetime import datetime
from typing import Optional, Tuple

from utils import get_pipeline, read_input, write_output

MODEL_NAME = "google/flan-t5-small"
MAX_LENGTH = 128
MIN_LENGTH = 30

def extract_date(text: str) -> Optional[str]:
    """テキストから日付を抽出します"""
    # 日付パターンの定義
    patterns = [
        r'(\d{4}[-/年]\d{1,2}[-/月]\d{1,2}日?)',  # YYYY-MM-DD
        r'(\d{1,2}[-/月]\d{1,2}日?)',  # MM-DD
        r'来週|今週|明日|明後日|今日|今月末|今週末|来月',  # 相対的な日付
    ]
    
    for pattern in patterns:
        match = re.search(pattern, text)
        if match:
            return match.group(0)
    return None

def extract_task_info(text: str) -> Tuple[str, str, list[str]]:
    """テキストからタスク情報を抽出します"""
    # タスク生成用のモデル
    generator = get_pipeline(
        "text2text-generation",
        MODEL_NAME,
        max_length=MAX_LENGTH,
        min_length=MIN_LENGTH,
        do_sample=True,
        temperature=0.7
    )
    
    # タスク情報の生成
    prompt = f"""
Extract task information from the following text:
{text}

Format:
Title: [task title]
Description: [task description]
Tags: [comma-separated tags]
"""
    
    result = generator(prompt)[0]["generated_text"]
    
    # 結果の解析
    title = ""
    description = ""
    tags = []
    
    for line in result.split("\n"):
        if line.startswith("Title:"):
            title = line.replace("Title:", "").strip()
        elif line.startswith("Description:"):
            description = line.replace("Description:", "").strip()
        elif line.startswith("Tags:"):
            tags = [
                tag.strip()
                for tag in line.replace("Tags:", "").strip().split(",")
                if tag.strip()
            ]
    
    return title, description, tags

def analyze_priority(text: str) -> str:
    """テキストから優先度を分析します"""
    classifier = get_pipeline(
        "text-classification",
        "distilbert-base-uncased",
        max_length=512
    )
    
    # 緊急度と重要度の分析
    urgency = classifier(f"Is this task urgent? {text}")[0]["score"]
    importance = classifier(f"Is this task important? {text}")[0]["score"]
    
    # 優先度の決定
    score = (urgency + importance) / 2
    if score > 0.7:
        return "高"
    elif score > 0.4:
        return "中"
    else:
        return "低"

def main() -> None:
    # 入力データの読み取り
    data = read_input()
    if "error" in data:
        write_output(data)
        return

    text = data.get("text", "")
    if not text:
        write_output({"error": "Text is required"})
        return

    try:
        # タスク情報の抽出
        title, description, tags = extract_task_info(text)
        
        # 期限の抽出
        due_date = extract_date(text)
        if due_date:
            description = f"{description}\n期限: {due_date}"
        
        # 優先度の分析
        priority = analyze_priority(text)
        
        write_output({
            "title": title,
            "description": description,
            "priority": priority,
            "tags": tags
        })
    except Exception as e:
        write_output({"error": f"Failed to create task: {str(e)}"})

if __name__ == "__main__":
    main() 